(function () {
  "use strict";

  function addProduct(productId) {
    const cart = JSON.parse(localStorage.getItem("fashionCart") || "[]");
    const item = cart.find((entry) => Number(entry.id) === Number(productId));
    if (item) item.quantity = (Number(item.quantity) || 1) + 1;
    else cart.push({ id: Number(productId), quantity: 1 });
    localStorage.setItem("fashionCart", JSON.stringify(cart));
  }

  document.querySelectorAll(".cart-btn").forEach((button) => {
    if (button.id === "addToCartBtn" || button.dataset.cartBound) return;
    const card = button.closest(".product-card");
    const productId = card?.dataset.productId;
    if (!productId) return;
    button.dataset.cartBound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      addProduct(productId);
      const cartPath = window.location.pathname.includes("/pages/") ? "cart.html" : "pages/cart.html";
      window.location.href = cartPath;
    });
  });
})();
