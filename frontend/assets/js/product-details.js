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

  // Clicking a thumbnail swaps the main product image.
  if (thumbnailImages && mainImage) {
    thumbnailImages.addEventListener("click", (event) => {
      const thumbnail = event.target.closest("[data-image]");
      if (!thumbnail) return;
      mainImage.src = thumbnail.dataset.image;
      thumbnailImages.querySelectorAll(".thumb").forEach((item) => item.classList.toggle("active", item === thumbnail));
    });
  }
})();
