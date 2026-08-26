(function () {
  "use strict";
  const products = window.FASHION_PRODUCTS || [];
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const message = document.getElementById("checkoutMessage");
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("fashionCart") || "[]"); } catch { cart = []; }
  const normalizeProduct = (product) => ({
    ...product,
    id: Number(product.id),
    price: Number(product.price) || 0,
    sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
  });
  const localProducts = products.map(normalizeProduct);
  const apiOrigin = window.location.port === "5501" ? "http://127.0.0.1:8765" : "";
  const loadProducts = async () => {
    const byId = new Map(localProducts.map((product) => [product.id, product]));
    const missingIds = [...new Set(cart.map((entry) => Number(entry.id)).filter((id) => Number.isInteger(id) && !byId.has(id)))];
    if (missingIds.length) {
      try {
        const response = await fetch(`${apiOrigin}/api/products/`, { headers: { Accept: "application/json" } });
        if (response.ok) (await response.json()).map(normalizeProduct).forEach((product) => byId.set(product.id, product));
      } catch { /* Local cart items remain usable if the API is unavailable. */ }
    }
    return cart.map((entry) => {
      const product = byId.get(Number(entry.id));
      return product ? { ...product, selectedSize: entry.size || product.sizes[0] || "", quantity: Math.max(1, Number(entry.quantity) || 1) } : null;
    }).filter(Boolean);
  };
  loadProducts().then((items) => {
    const shipping = Number(localStorage.getItem("fashionShipping") || 0);
    const discountRate = Number(localStorage.getItem("fashionDiscountRate") || 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * .06;
    const total = subtotal - discount + shipping + tax;
    document.getElementById("checkoutItems").innerHTML = items.map((item) => `<div class="checkout-item"><span>${item.name}<small>Size: ${item.selectedSize} · ${item.quantity} × ${money.format(item.price)}</small></span><b>${money.format(item.price * item.quantity)}</b></div>`).join("");
    document.getElementById("checkoutSubtotal").textContent = money.format(subtotal); document.getElementById("checkoutDiscount").textContent = `−${money.format(discount)}`; document.getElementById("checkoutShipping").textContent = money.format(shipping); document.getElementById("checkoutTax").textContent = money.format(tax); document.getElementById("checkoutTotal").textContent = money.format(total);
    const form = document.getElementById("checkoutForm");
    const submitButton = form.querySelector("button[type=submit]");
    if (!items.length) { message.textContent = "Your cart is empty. Please add a product before checkout."; message.classList.add("show"); submitButton.disabled = true; }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!items.length) return;
      const formData = new FormData(form); const customer = Object.fromEntries(formData.entries());
      if (!customer.name.trim() || !customer.email.includes("@") || !/^\d{10,15}$/.test(customer.phone) || !customer.address.trim() || !customer.city.trim() || !customer.state.trim() || !/^[A-Za-z0-9-]{4,10}$/.test(customer.postal_code)) { message.textContent = "Please enter valid name, email, phone, address, city, state, and PIN/ZIP code."; message.classList.add("show"); return; }
      const order = { id: `ORD-${Date.now().toString().slice(-8)}`, status: "Placed", customer, items: items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })), subtotal, discount, shipping, tax, total, createdAt: new Date().toISOString() };
      localStorage.setItem("fashionLastOrder", JSON.stringify(order));
      submitButton.disabled = true;
      submitButton.textContent = "Order Placed";
      localStorage.removeItem("fashionCart"); localStorage.removeItem("fashionShipping"); localStorage.removeItem("fashionDiscountRate"); window.location.href = "order-success.html?placed=1";
    });
  });
})();
