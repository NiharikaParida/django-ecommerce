(function () {
  "use strict";

  const products = window.FASHION_PRODUCTS || [];
  const list = document.getElementById("cartItems");
  const empty = document.getElementById("cartEmpty");
  const total = document.getElementById("cartTotal");
  const clearButton = document.getElementById("clearCartBtn");
  if (!list || !empty || !total) return;

  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  function renderCart() {
    const saved = JSON.parse(localStorage.getItem("fashionCart") || "[]");
    const items = saved.map((entry) => ({
      ...products.find((product) => product.id === Number(entry.id)),
      quantity: Number(entry.quantity) || 1,
    })).filter((item) => item.id);

    empty.hidden = items.length > 0;
    list.innerHTML = items.map((item) => `
      <article class="cart-item">
        <img src="${item.images[0]}" alt="${item.name}">
        <div><h2>${item.name}</h2><p>${item.category} · ${item.brand}</p><strong>${money.format(item.price)}</strong></div>
        <button type="button" data-remove-id="${item.id}">Remove</button>
      </article>`).join("");
    total.textContent = money.format(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;
    const remaining = JSON.parse(localStorage.getItem("fashionCart") || "[]")
      .filter((item) => Number(item.id) !== Number(button.dataset.removeId));
    localStorage.setItem("fashionCart", JSON.stringify(remaining));
    renderCart();
  });

  if (clearButton) clearButton.addEventListener("click", () => {
    localStorage.removeItem("fashionCart");
    renderCart();
  });
  renderCart();
})();
