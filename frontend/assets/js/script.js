(function () {
  "use strict";

  // Route every product card to the single reusable detail page.
  const pagePath = window.location.pathname.toLowerCase();
  const pageStart = pagePath.includes("women") ? 1 : pagePath.includes("kids") ? 113 : 57;

  document.querySelectorAll(".product-card").forEach((card, index) => {
    const productId = Number(card.dataset.productId || pageStart + index);
    card.dataset.productId = String(productId);

    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select, label")) {
        return;
      }
      window.location.href = `product-details.html?id=${productId}`;
    });
  });
})();
