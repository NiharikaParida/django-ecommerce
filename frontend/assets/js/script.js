(function () {
  "use strict";

  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  // These are the catalog ingredients used by the product cards. The final
  // `products` array below contains one complete object for every card.
  const imagePool = [
    "../assets/image/product-1.svg",
    "../assets/image/product-2.svg",
    "../assets/image/product-3.svg",
    "../assets/image/product-4.svg",
    "../assets/image/product-5.svg",
  ];
  const catalog = [
    ["Women", ["Festive Wear", "Party Wear", "Western Wear", "Casual Wear", "Office Wear", "Sports Wear", "New Arrivals"]],
    ["Men", ["Shirts", "T-Shirts", "Jeans", "Hoodies", "Jackets", "Formal Wear", "Casual Wear"]],
    ["Kids", ["Boys", "Girls", "Baby Wear", "Party Wear", "School Wear"]],
    ["Footwear", ["Sneakers", "Running Shoes", "Sandals", "Boots"]],
    ["Watches", ["Analog Watches", "Smart Watches", "Chronograph", "Dress Watches"]],
    ["Sunglasses", ["Aviators", "Cat Eye", "Oversized", "Polarized"]],
    ["Jewellery", ["Earrings", "Necklaces", "Rings", "Bracelets"]],
    ["Handbags", ["Totes", "Crossbody Bags", "Shoulder Bags", "Clutches"]],
    ["Luggage", ["Carry On", "Trolley Bags", "Duffle Bags", "Travel Sets"]],
    ["Accessories", ["Watches", "Sunglasses", "Jewellery", "Handbags", "Luggage"]],
  ];

  // Product information is kept in one array so the detail page has one
  // reusable rendering path for every product ID.
  const products = [];
  catalog.forEach(([category, subcategories], categoryIndex) => {
    subcategories.forEach((subcategory, subcategoryIndex) => {
      for (let index = 0; index < 8; index += 1) {
        const productsBeforeCategory = catalog
          .slice(0, categoryIndex)
          .reduce((total, [, previousSubcategories]) => total + previousSubcategories.length * 8, 0);
        const id = productsBeforeCategory + subcategoryIndex * 8 + index + 1;
        const name = `${subcategory} ${["Edit", "Dress", "Set", "Essential", "Layer", "Collection"][index % 6]}`;
        const price = 2299 + categoryIndex * 180 + index * 175 + (subcategory.length % 3) * 60;
        products.push({
          id,
          name,
          category,
          price,
          oldPrice: price + Math.round(price * 0.34),
          description: `A premium ${subcategory.toLowerCase()} from the ${category.toLowerCase()} edit, designed with clean lines, elevated finishing, and versatile styling for modern wardrobes.`,
          image: imagePool[(index + subcategoryIndex) % imagePool.length],
          rating: Number((4.4 + ((index + subcategory.length) % 5) * 0.1).toFixed(1)),
        });
      }
    });
  });

  // Give the existing category-page cards stable IDs without changing their layout.
  // The ranges keep IDs unique across the Women, Men, and Kids pages.
  const pagePath = window.location.pathname.toLowerCase();
  const pageStart = pagePath.includes("kids") ? 113 : pagePath.includes("men") ? 57 : 1;
  document.querySelectorAll(".product-card").forEach((card, index) => {
    const id = pageStart + index;
    card.dataset.productId = String(id);
    card.addEventListener("click", (event) => {
      if (!event.target.closest("a, button")) {
        window.location.href = `product-details.html?id=${id}`;
      }
    });
  });

  // Read the selected product ID from the URL, for example ?id=1.
  const params = new URLSearchParams(window.location.search);
  const selectedId = Number(params.get("id"));
  const product = products.find((item) => item.id === selectedId);

  // Only update elements that exist, keeping this shared script safe on every page.
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  const image = document.getElementById("detailImage") || document.querySelector("[data-detail-image]") || document.getElementById("mainImage");
  const notFound = document.getElementById("productNotFound");

  if (!product) {
    if (notFound) notFound.classList.remove("d-none");
    return;
  }

  if (image) {
    image.src = product.image;
    image.alt = product.name;
  }
  setText("detailName", product.name);
  setText("detailCategory", product.category);
  setText("detailPrice", money.format(product.price));
  setText("detailOldPrice", product.oldPrice ? money.format(product.oldPrice) : "");
  setText("detailDescription", product.description);
  setText("detailRating", product.rating ? `★ ${product.rating}` : "");
  const currentPrice = document.querySelector(".new-price");
  const oldPrice = document.querySelector(".old-price");
  if (currentPrice) currentPrice.textContent = money.format(product.price);
  if (oldPrice) oldPrice.textContent = product.oldPrice ? money.format(product.oldPrice) : "";
})();
