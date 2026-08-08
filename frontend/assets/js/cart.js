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
  const getItems = () => readCart().map((entry) => ({ ...products.find((p) => p.id === Number(entry.id)), quantity: Math.max(1, Number(entry.quantity) || 1) })).filter((item) => item.id);

  function render() {
    const items = getItems();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * 0.06;
    const total = subtotal - discount + shipping + tax;
    document.getElementById("itemCountText").textContent = items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("emptyCart").hidden = items.length > 0;
    wrap.innerHTML = items.map((item) => `<article class="cart-item" data-id="${item.id}"><img src="${item.images[0]}" alt="${item.name}"><div><span class="brand">${item.brand}</span><h2>${item.name}</h2><p class="meta">${item.category} · Sizes: ${item.sizes.join(", ")}</p><span class="price">${money.format(item.price)}</span>${item.oldPrice > item.price ? `<span class="old-price">${money.format(item.oldPrice)}</span>` : ""}<div class="item-bottom"><div class="qty"><button data-action="minus" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-action="plus" aria-label="Increase quantity">+</button></div><strong>${money.format(item.price * item.quantity)}</strong><div class="item-actions"><button data-action="save">Save for Later</button><button class="remove" data-action="remove">Remove</button></div></div></div></article>`).join("");
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
    const id = Number(button.closest(".cart-item").dataset.id);
    const cart = readCart();
    const entry = cart.find((item) => Number(item.id) === id);
    if (button.dataset.action === "remove" || button.dataset.action === "save") {
      writeCart(cart.filter((item) => Number(item.id) !== id));
      if (button.dataset.action === "save") { const saved = JSON.parse(localStorage.getItem("fashionSavedForLater") || "[]"); if (!saved.includes(id)) saved.push(id); localStorage.setItem("fashionSavedForLater", JSON.stringify(saved)); }
    } else if (entry) entry.quantity = Math.max(1, Number(entry.quantity || 1) + (button.dataset.action === "plus" ? 1 : -1));
    writeCart(cart); render();
  });
  document.querySelectorAll(".ship-option").forEach((option) => option.addEventListener("click", () => { document.querySelectorAll(".ship-option").forEach((item) => item.classList.remove("active")); option.classList.add("active"); shipping = Number(option.dataset.cost); render(); }));
  document.getElementById("applyCouponBtn").addEventListener("click", () => { const code = document.getElementById("couponInput").value.trim().toUpperCase(); const message = document.getElementById("couponMsg"); discountRate = code === "FASHION20" || code === "ASHION20" ? .2 : 0; message.textContent = discountRate ? "Coupon applied successfully." : "Enter a valid coupon code."; render(); });
  document.getElementById("checkoutBtn").addEventListener("click", () => { if (!getItems().length) return alert("Your cart is empty."); window.location.href = "login.html"; });
  render();
})();
