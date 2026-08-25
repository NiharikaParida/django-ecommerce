(function () {
  "use strict";

  const products = window.FASHION_PRODUCTS || [];
  const productId = Number(new URLSearchParams(window.location.search).get("id"));
  const product = products.find((item) => item.id === productId);
  const details = document.querySelector(".product-details");
  const notFound = document.getElementById("productNotFound");
  const relatedSection = document.querySelector(".related-products");
  const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  const showError = (title, message) => {
    if (details) details.hidden = true;
    document.querySelectorAll(".product-highlights, .product-tabs, .reviews, .related-products").forEach((section) => { section.hidden = true; });
    if (notFound) { notFound.hidden = false; setText("productNotFoundTitle", title); setText("productNotFoundMessage", message); }
  };

  const updateCartCount = () => {
    let count = 0;
    try { count = JSON.parse(localStorage.getItem("fashionCart") || "[]").reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0); } catch { count = 0; }
    document.querySelectorAll("[data-cart-count]").forEach((badge) => { badge.textContent = count; badge.hidden = count === 0; });
  };

  function renderProduct(product, relatedProducts) {
    if (!product || !product.id) return showError("Product not found", "We could not find that product. Please choose another item from the catalog.");
    if (details) details.hidden = false;
    if (notFound) notFound.hidden = true;

    const mainImage = document.getElementById("mainImage");
    const thumbnailImages = document.getElementById("thumbnailImages");
    if (mainImage) {
      mainImage.src = product.images[0] || ""; mainImage.alt = product.name;
      mainImage.addEventListener("error", () => { mainImage.alt = `${product.name} image unavailable`; mainImage.closest(".main-image")?.classList.add("image-unavailable"); }, { once: true });
    }
    if (thumbnailImages) thumbnailImages.innerHTML = product.images.map((image, index) => `<img src="${image}" class="thumb ${index === 0 ? "active" : ""}" data-image="${image}" alt="${product.name} image ${index + 1}">`).join("");

    setText("detailName", product.name); setText("detailCategory", product.category); setText("detailBrand", product.brand);
    setText("detailPrice", money.format(product.price)); setText("detailOldPrice", product.oldPrice == null ? "" : money.format(product.oldPrice));
    setText("detailDiscount", `${product.discount}% OFF`); setText("detailRating", `★ ${product.rating}`); setText("detailDescription", product.description || "Product details are not available.");
    setText("breadcrumbProduct", product.name); setText("breadcrumbCategory", product.category);
    const breadcrumbCategory = document.getElementById("breadcrumbCategory");
    if (breadcrumbCategory) breadcrumbCategory.href = ({ Men: "categories_men.html", Women: "categories_women.html", Kids: "catgories_kids.html" })[product.category] || "product.html";

    const sizeGroup = document.getElementById("detailSizes");
    let selectedSize = product.sizes[0] || "";
    if (sizeGroup) {
      sizeGroup.innerHTML = `<h3>Select Size</h3>${product.sizes.length ? product.sizes.map((size) => `<button type="button">${size}</button>`).join("") : `<p class="selection-message">Size is currently unavailable.</p>`}`;
      const sizeButtons = Array.from(sizeGroup.querySelectorAll("button")); sizeButtons[0]?.classList.add("active");
      sizeButtons.forEach((button) => button.addEventListener("click", () => { selectedSize = button.textContent.trim(); sizeGroup.dataset.selectedSize = selectedSize; sizeButtons.forEach((item) => item.classList.toggle("active", item === button)); }));
      sizeGroup.dataset.selectedSize = selectedSize;
    }

    let quantity = 1; const quantityInput = document.getElementById("qty");
    const updateQuantity = (next) => { const parsed = Number.parseInt(next, 10); quantity = Number.isFinite(parsed) ? Math.max(1, Math.min(10, parsed)) : 1; if (quantityInput) quantityInput.value = quantity; };
    document.getElementById("minus")?.addEventListener("click", () => updateQuantity(quantity - 1)); document.getElementById("plus")?.addEventListener("click", () => updateQuantity(quantity + 1)); quantityInput?.addEventListener("change", () => updateQuantity(quantityInput.value));

    if (thumbnailImages && mainImage) thumbnailImages.addEventListener("click", (event) => { const thumbnail = event.target.closest("[data-image]"); if (!thumbnail) return; mainImage.src = thumbnail.dataset.image; thumbnailImages.querySelectorAll(".thumb").forEach((item) => item.classList.toggle("active", item === thumbnail)); });

    const readCart = () => { try { return JSON.parse(localStorage.getItem("fashionCart") || "[]"); } catch { return []; } };
    const saveCart = (cart) => localStorage.setItem("fashionCart", JSON.stringify(cart));
    const showSelectionMessage = (text) => { let message = document.getElementById("detailActionMessage"); if (!message) { message = document.createElement("p"); message.id = "detailActionMessage"; message.className = "selection-message"; document.querySelector(".buttons")?.after(message); } message.textContent = text; };
    const addCurrentProductToCart = () => {
      const cart = readCart(); const selected = sizeGroup?.dataset.selectedSize || selectedSize;
      if (!selected && product.sizes.length) { showSelectionMessage("Please select a size before continuing."); sizeGroup?.querySelector("button")?.focus(); return false; }
      const existing = cart.find((item) => Number(item.id) === product.id && (item.size || "") === selected);
      if (existing) existing.quantity = Math.min(10, (Number(existing.quantity) || 1) + quantity);
      else cart.push({ id: product.id, name: product.name, brand: product.brand, image: product.images[0], price: product.price, size: selected, quantity });
      saveCart(cart); updateCartCount(); return true;
    };
    document.getElementById("addToCartBtn")?.addEventListener("click", () => { if (addCurrentProductToCart()) window.location.href = "cart.html"; });
    document.querySelector(".buy-btn")?.addEventListener("click", () => { if (addCurrentProductToCart()) window.location.href = "checkout.html?checkout=1"; });

    const wishlistButton = document.querySelector(".buttons .wishlist");
    if (wishlistButton) {
      const wishlist = () => { try { return JSON.parse(localStorage.getItem("fashionWishlist") || "[]"); } catch { return []; } };
      const saved = () => wishlist().some((item) => String(item.id) === String(product.id));
      const updateWishlistState = () => { wishlistButton.classList.toggle("active", saved()); wishlistButton.setAttribute("aria-label", saved() ? "Remove from wishlist" : "Add to wishlist"); };
      wishlistButton.addEventListener("click", (event) => { event.preventDefault(); const items = wishlist(); const next = saved() ? items.filter((item) => String(item.id) !== String(product.id)) : [...items, { id: product.id, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.images[0] }]; localStorage.setItem("fashionWishlist", JSON.stringify(next)); updateWishlistState(); });
      updateWishlistState();
    }

    const relatedGrid = document.getElementById("relatedGrid");
    if (relatedGrid) {
      const related = relatedProducts.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
      relatedGrid.innerHTML = related.map((item) => `<a class="card related-card" href="product-details.html?id=${item.id}"><img src="${item.images[0]}" alt="${item.name}"><h4>${item.name}</h4><p>${money.format(item.price)}</p></a>`).join("");
      if (!related.length && relatedSection) relatedSection.hidden = true;
    }
    updateCartCount();
  }

  if (!product) showError("Product not found", "Please choose a valid product from the catalog.");
  else renderProduct(product, products);
})();
