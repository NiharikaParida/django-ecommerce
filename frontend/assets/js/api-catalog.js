/* Adds imported Django-catalog products to the existing category grids. */
(function () {
  "use strict";

  const grid = document.querySelector(".product-grid");
  if (!grid) return;
  const path = window.location.pathname.toLowerCase();
  const category = path.includes("women") ? "Women" : path.includes("men") ? "Men" : path.includes("kids") ? "Kids" : "";
  if (!category || window.location.port === "5501") return;

  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));

  fetch("/api/products/", { headers: { Accept: "application/json" } })
    .then((response) => response.ok ? response.json() : [])
    .then((products) => {
      const existingIds = new Set(Array.from(grid.querySelectorAll(".product-card[data-product-id]")).map((card) => card.dataset.productId));
      const imported = products.filter((product) => product.source !== "manual" && product.category === category && !existingIds.has(String(product.id)));
      imported.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.productId = product.id;
        card.dataset.apiProduct = "true";
        card.innerHTML = `<img src="${escapeHtml(product.images?.[0] || "")}" alt="${escapeHtml(product.name)}"><div class="rating">${escapeHtml(product.rating)} ★</div><h4>${escapeHtml(product.brand)}</h4><p>${escapeHtml(product.name)}</p><div class="price"><strong>${money.format(product.price)}</strong>${product.old_price > product.price ? `<del>${money.format(product.old_price)}</del><span>(${escapeHtml(product.discount)}% OFF)</span>` : ""}</div>`;
        card.addEventListener("click", () => { window.location.href = `product-details.html?id=${encodeURIComponent(product.id)}`; });
        grid.appendChild(card);
      });
      if (imported.length) document.dispatchEvent(new CustomEvent("catalog:updated"));
    })
    .catch(() => {
      // Live Server and offline pages retain the existing manually authored catalog.
    });
})();
