(function () {
  "use strict";

  const products = window.FASHION_PRODUCTS || [];
  const productId = Number(new URLSearchParams(window.location.search).get("id"));
  const product = products.find((item) => item.id === productId);
  const details = document.querySelector(".product-details");
  const notFound = document.getElementById("productNotFound");

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  if (!product) {
    if (details) details.hidden = true;
    if (notFound) notFound.hidden = false;
    document.querySelectorAll(".product-highlights, .product-tabs, .reviews, .related-products").forEach((section) => {
      section.hidden = true;
    });
    return;
  }

  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  // Render all selected-product fields from the shared dataset.
  const mainImage = document.getElementById("mainImage");
  const thumbnailImages = document.getElementById("thumbnailImages");
  if (mainImage) {
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
  }
  if (thumbnailImages) {
    thumbnailImages.innerHTML = product.images
      .map((image, index) => `<img src="${image}" class="thumb ${index === 0 ? "active" : ""}" data-image="${image}" alt="${product.name} image ${index + 1}">`)
      .join("");
  }

  setText("detailName", product.name);
  setText("detailCategory", product.category);
  setText("detailBrand", product.brand);
  setText("detailPrice", money.format(product.price));
  setText("detailOldPrice", money.format(product.oldPrice));
  setText("detailDiscount", `${product.discount}% OFF`);
  setText("detailRating", `★ ${product.rating}`);
  setText("detailDescription", product.description);

  const sizeGroup = document.getElementById("detailSizes");
  if (sizeGroup) {
    sizeGroup.innerHTML = `<h3>Select Size</h3>${product.sizes.map((size) => `<button type="button">${size}</button>`).join("")}`;
  }

  let quantity = 1;
  const quantityInput = document.getElementById("qty");
  const updateQuantity = (next) => {
    quantity = Math.max(1, Math.min(10, Number(next) || 1));
    if (quantityInput) quantityInput.value = quantity;
  };
  document.getElementById("minus")?.addEventListener("click", () => updateQuantity(quantity - 1));
  document.getElementById("plus")?.addEventListener("click", () => updateQuantity(quantity + 1));
  quantityInput?.addEventListener("change", () => updateQuantity(quantityInput.value));

  // Clicking a thumbnail swaps the main product image.
  if (thumbnailImages && mainImage) {
    thumbnailImages.addEventListener("click", (event) => {
      const thumbnail = event.target.closest("[data-image]");
      if (!thumbnail) return;
      mainImage.src = thumbnail.dataset.image;
      thumbnailImages.querySelectorAll(".thumb").forEach((item) => item.classList.toggle("active", item === thumbnail));
    });
  }

  // Save the selected product in localStorage, then take the customer to cart.html.
  const addToCartButton = document.getElementById("addToCartBtn");
  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      const cart = JSON.parse(localStorage.getItem("fashionCart") || "[]");
      const existing = cart.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity = (Number(existing.quantity) || 1) + quantity;
      } else {
        cart.push({ id: product.id, quantity });
      }
      localStorage.setItem("fashionCart", JSON.stringify(cart));
      window.location.href = "cart.html";
    });
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("fashionCart") || "[]");
    const existing = cart.find((item) => Number(item.id) === product.id);
    if (existing) existing.quantity = (Number(existing.quantity) || 1) + quantity;
    else cart.push({ id: product.id, quantity });
    localStorage.setItem("fashionCart", JSON.stringify(cart));
  };

  document.querySelector(".buy-btn")?.addEventListener("click", () => {
    addToCart();
    window.location.href = "checkout.html";
  });

  const wishlistButton = document.querySelector(".buttons .wishlist");
  if (wishlistButton) {
    const wishlist = () => JSON.parse(localStorage.getItem("fashionWishlist") || "[]");
    const saved = () => wishlist().some((item) => String(item.id) === String(product.id));
    const updateWishlistState = () => {
      wishlistButton.classList.toggle("active", saved());
      wishlistButton.setAttribute("aria-label", saved() ? "Remove from wishlist" : "Add to wishlist");
    };
    wishlistButton.addEventListener("click", (event) => {
      event.preventDefault();
      const items = wishlist();
      const next = saved() ? items.filter((item) => String(item.id) !== String(product.id)) : [...items, { id: product.id, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.images[0] }];
      localStorage.setItem("fashionWishlist", JSON.stringify(next));
      updateWishlistState();
    });
    updateWishlistState();
  }
})();
