(function () {
  "use strict";
  const products = window.FASHION_PRODUCTS || [];
  const wrap = document.getElementById("cartItemsWrap");
  if (!wrap) return;
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  let shipping = 0;
  let discountRate = 0;
  const readCart = () => { try { return JSON.parse(localStorage.getItem("fashionCart") || "[]"); } catch { return []; } };
  const writeCart = (cart) => localStorage.setItem("fashionCart", JSON.stringify(cart));
  const normalizeProduct = (product) => ({
    ...product,
    id: Number(product.id),
    price: Number(product.price) || 0,
    sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
  });
  let catalog = products.map(normalizeProduct);
  const apiOrigin = "";
  const loadCatalog = async () => {
    const cartIds = new Set(readCart().map((entry) => Number(entry.id)));
    const localIds = new Set(catalog.map((product) => product.id));
    if ([...cartIds].some((id) => !localIds.has(id))) {
      try {
        const response = await fetch(`${apiOrigin}/api/products/`, { headers: { Accept: "application/json" } });
        if (response.ok) catalog = (await response.json()).map(normalizeProduct);
      } catch { /* Keep the local catalog available when Django is offline. */ }
    }
  };
  const getItems = () => readCart().map((entry) => {
    const product = catalog.find((p) => p.id === Number(entry.id));
    return product ? { ...product, selectedSize: entry.size || product.sizes[0], quantity: Math.max(1, Number(entry.quantity) || 1) } : null;
  }).filter(Boolean);

  function render() {
    const items = getItems();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * 0.06;
    const total = subtotal - discount + shipping + tax;
    document.getElementById("itemCountText").textContent = items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("emptyCart").hidden = items.length > 0;
    wrap.innerHTML = items.map((item) => `<article class="cart-item" data-id="${item.id}" data-size="${item.selectedSize}"><img src="${item.images[0]}" alt="${item.name}"><div><span class="brand">${item.brand}</span><h2>${item.name}</h2><p class="meta">${item.category} · Size: ${item.selectedSize}</p><span class="price">${money.format(item.price)}</span>${item.oldPrice > item.price ? `<span class="old-price">${money.format(item.oldPrice)}</span>` : ""}<div class="item-bottom"><div class="qty"><button type="button" data-action="minus" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-action="plus" aria-label="Increase quantity">+</button></div><strong>${money.format(item.price * item.quantity)}</strong><div class="item-actions"><button type="button" data-action="save">Save for Later</button><button type="button" class="remove" data-action="remove">Remove</button></div></div></div></article>`).join("");
    document.getElementById("sumSubtotal").textContent = money.format(subtotal);
    document.getElementById("sumDiscount").textContent = `−${money.format(discount)}`;
    document.getElementById("sumShipping").textContent = money.format(shipping);
    document.getElementById("sumTax").textContent = money.format(tax);
    document.getElementById("sumTotal").textContent = money.format(total);
    document.getElementById("sumSavings").textContent = money.format(discount);
  }

  wrap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const card = button.closest(".cart-item");
    const id = Number(card.dataset.id);
    const size = card.dataset.size;
    const cart = readCart();
    const entry = cart.find((item) => Number(item.id) === id && (item.size || "") === (size || ""));
    const product = getItems().find((item) => item.id === id && (item.selectedSize || "") === (size || ""));
    if (button.dataset.action === "remove" || button.dataset.action === "save") {
      const remaining = cart.filter((item) => !(Number(item.id) === id && (item.size || "") === (size || "")));
      writeCart(remaining);
      if (button.dataset.action === "save") {
        const saved = JSON.parse(localStorage.getItem("fashionWishlist") || "[]");
        const savedItem = product ? {
          id: product.id, name: product.name, brand: product.brand, price: product.price,
          oldPrice: product.oldPrice, image: product.images[0], color: product.color || ""
        } : entry;
        if (savedItem && !saved.some((item) => Number(item.id) === id)) saved.push(savedItem);
        localStorage.setItem("fashionWishlist", JSON.stringify(saved));
        window.location.href = "wishlist.html";
        return;
      }
      render();
      return;
    } else if (entry) entry.quantity = Math.max(1, Number(entry.quantity || 1) + (button.dataset.action === "plus" ? 1 : -1));
    writeCart(cart); render();
  });
  document.querySelectorAll(".ship-option").forEach((option) => option.addEventListener("click", () => { document.querySelectorAll(".ship-option").forEach((item) => item.classList.remove("active")); option.classList.add("active"); shipping = Number(option.dataset.cost); localStorage.setItem("fashionShipping", String(shipping)); render(); }));
  document.getElementById("applyCouponBtn").addEventListener("click", () => { const code = document.getElementById("couponInput").value.trim().toUpperCase(); const message = document.getElementById("couponMsg"); discountRate = code === "FASHION20" || code === "ASHION20" ? .2 : 0; localStorage.setItem("fashionDiscountRate", String(discountRate)); message.textContent = discountRate ? "Coupon applied successfully." : "Enter a valid coupon code."; render(); });
  document.getElementById("checkoutBtn").addEventListener("click", () => { if (!getItems().length) return alert("Your cart is empty."); localStorage.setItem("fashionShipping", String(shipping)); localStorage.setItem("fashionDiscountRate", String(discountRate)); window.location.href = "checkout.html?checkout=1"; });
  loadCatalog().then(render);
})();
