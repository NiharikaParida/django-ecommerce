(function () {
  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const imagePool = [
    "../assets/image/product-1.svg",
    "../assets/image/product-2.svg",
    "../assets/image/product-3.svg",
    "../assets/image/product-4.svg",
    "../assets/image/product-5.svg",
  ];

  const categories = [
    { key: "women", name: "Women", copy: "Festive wear, party wear, western wear, and premium essentials.", image: imagePool[0] },
    { key: "men", name: "Men", copy: "Shirts, tees, denim, tailoring, and sharp casual layers.", image: imagePool[1] },
    { key: "kids", name: "Kids", copy: "Comfort-first styles for boys, girls, and baby wear.", image: imagePool[2] },
    { key: "footwear", name: "Footwear", copy: "Sneakers, running shoes, sandals, and boots.", image: imagePool[3] },
    { key: "watches", name: "Watches", copy: "Analog, smart, dress, and chronograph picks.", image: imagePool[4] },
    { key: "sunglasses", name: "Sunglasses", copy: "Aviators, cat-eye, oversized, and polarized frames.", image: imagePool[0] },
    { key: "jewellery", name: "Jewellery", copy: "Elegant earrings, necklaces, rings, and bracelets.", image: imagePool[1] },
    { key: "handbags", name: "Handbags", copy: "Totes, crossbody bags, shoulder bags, and clutches.", image: imagePool[2] },
    { key: "luggage", name: "Luggage", copy: "Carry-ons, duffles, and travel-ready bags.", image: imagePool[3] },
    { key: "accessories", name: "Accessories", copy: "Watches, sunglasses, jewellery, handbags, and luggage.", image: imagePool[4] },
  ];

  const subcategoriesByCategory = {
    women: [
      { key: "festive-wear", title: "Festive Wear", copy: "Embroidered silhouettes and rich textures.", image: imagePool[0] },
      { key: "party-wear", title: "Party Wear", copy: "Statement looks for evening plans.", image: imagePool[1] },
      { key: "western-wear", title: "Western Wear", copy: "Modern day-to-night dressing.", image: imagePool[2] },
      { key: "casual-wear", title: "Casual Wear", copy: "Relaxed layers for daily styling.", image: imagePool[3] },
      { key: "office-wear", title: "Office Wear", copy: "Sharp and understated tailored edits.", image: imagePool[4] },
      { key: "sports-wear", title: "Sports Wear", copy: "Comfortable active-inspired fashion.", image: imagePool[0] },
      { key: "new-arrivals", title: "New Arrivals", copy: "Fresh drops from the latest edit.", image: imagePool[1] },
    ],
    men: [
      { key: "shirts", title: "Shirts", copy: "Premium shirts for every setting.", image: imagePool[1] },
      { key: "t-shirts", title: "T-Shirts", copy: "Clean basics and graphic edits.", image: imagePool[2] },
      { key: "jeans", title: "Jeans", copy: "A refined fit with everyday wearability.", image: imagePool[3] },
      { key: "hoodies", title: "Hoodies", copy: "Relaxed layers with a premium handfeel.", image: imagePool[4] },
      { key: "jackets", title: "Jackets", copy: "Lightweight outerwear and structure.", image: imagePool[0] },
      { key: "formal-wear", title: "Formal Wear", copy: "Polished pieces for modern tailoring.", image: imagePool[1] },
      { key: "casual-wear", title: "Casual Wear", copy: "Easy wardrobe staples for daily use.", image: imagePool[2] },
    ],
    kids: [
      { key: "boys", title: "Boys", copy: "Playful, durable, and easy to wear.", image: imagePool[2] },
      { key: "girls", title: "Girls", copy: "Bright styles with soft comfort.", image: imagePool[3] },
      { key: "baby-wear", title: "Baby Wear", copy: "Gentle fabrics and simple silhouettes.", image: imagePool[4] },
      { key: "party-wear", title: "Party Wear", copy: "Event-ready edits for little occasions.", image: imagePool[0] },
      { key: "school-wear", title: "School Wear", copy: "Everyday uniforms and basics.", image: imagePool[1] },
    ],
    footwear: [
      { key: "sneakers", title: "Sneakers", copy: "Modern everyday sneaker edits.", image: imagePool[0] },
      { key: "running-shoes", title: "Running Shoes", copy: "Performance-led comfort silhouettes.", image: imagePool[1] },
      { key: "sandals", title: "Sandals", copy: "Lightweight styles for warm weather.", image: imagePool[2] },
      { key: "boots", title: "Boots", copy: "Structured pairs with a luxury edge.", image: imagePool[3] },
    ],
    watches: [
      { key: "analog-watches", title: "Analog Watches", copy: "Minimal and classic designs.", image: imagePool[0] },
      { key: "smart-watches", title: "Smart Watches", copy: "Connected style with utility.", image: imagePool[1] },
      { key: "chronograph", title: "Chronograph", copy: "Detailed dials with premium appeal.", image: imagePool[2] },
      { key: "dress-watches", title: "Dress Watches", copy: "Formal watches for polished looks.", image: imagePool[3] },
    ],
    sunglasses: [
      { key: "aviators", title: "Aviators", copy: "Iconic frame shapes with impact.", image: imagePool[0] },
      { key: "cat-eye", title: "Cat Eye", copy: "Fashion-led frames with a sleek edge.", image: imagePool[1] },
      { key: "oversized", title: "Oversized", copy: "Statement shades with coverage.", image: imagePool[2] },
      { key: "polarized", title: "Polarized", copy: "Clarity and comfort for bright days.", image: imagePool[3] },
    ],
    jewellery: [
      { key: "earrings", title: "Earrings", copy: "Elevated pieces for daily polish.", image: imagePool[0] },
      { key: "necklaces", title: "Necklaces", copy: "Layered and statement necklaces.", image: imagePool[1] },
      { key: "rings", title: "Rings", copy: "Minimal to bold ring edits.", image: imagePool[2] },
      { key: "bracelets", title: "Bracelets", copy: "Refined bracelets and bangles.", image: imagePool[3] },
    ],
    handbags: [
      { key: "totes", title: "Totes", copy: "Spacious silhouettes for the day.", image: imagePool[0] },
      { key: "crossbody", title: "Crossbody Bags", copy: "Compact hands-free styling.", image: imagePool[1] },
      { key: "shoulder-bags", title: "Shoulder Bags", copy: "Polished bags with an elevated finish.", image: imagePool[2] },
      { key: "clutches", title: "Clutches", copy: "Evening-ready compact statements.", image: imagePool[3] },
    ],
    luggage: [
      { key: "carry-on", title: "Carry On", copy: "Smooth travel with structure.", image: imagePool[0] },
      { key: "trolley-bags", title: "Trolley Bags", copy: "Spacious and durable baggage.", image: imagePool[1] },
      { key: "duffle", title: "Duffle Bags", copy: "Flexible weekend travel shapes.", image: imagePool[2] },
      { key: "travel-sets", title: "Travel Sets", copy: "Matching luggage for long trips.", image: imagePool[3] },
    ],
    accessories: [
      { key: "watches", title: "Watches", copy: "Timepieces and wrist statements.", image: imagePool[0] },
      { key: "sunglasses", title: "Sunglasses", copy: "Style-driven sun protection.", image: imagePool[1] },
      { key: "jewellery", title: "Jewellery", copy: "Polished accents and sets.", image: imagePool[2] },
      { key: "handbags", title: "Handbags", copy: "Essential carry and utility.", image: imagePool[3] },
      { key: "luggage", title: "Luggage", copy: "Travel-ready add-ons.", image: imagePool[4] },
    ],
  };

  const productProfiles = {
    women: {
      brands: ["Aurelia", "Maison Noire", "Elara"],
      descriptors: ["Satin Dress", "Wrap Dress", "Co-ord Set", "Midi Dress", "Tailored Jumpsuit", "Statement Blouse"],
      basePrice: 2299,
      step: 175,
      fabric: "Premium Satin",
      pattern: "Floral Print",
      fit: "Regular Fit",
      occasion: "Evening Wear",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "Midnight Black", swatch: "swatch-black" },
        { name: "Rose Wine", swatch: "swatch-rose" },
        { name: "Ivory Cloud", swatch: "swatch-ivory" },
        { name: "Olive Grove", swatch: "swatch-olive" },
      ],
    },
    men: {
      brands: ["Aurelius", "Noir Lane", "Studio 17"],
      descriptors: ["Oxford Shirt", "Graphic Tee", "Slim Jeans", "Relaxed Hoodie", "Bomber Jacket", "Formal Shirt"],
      basePrice: 1499,
      step: 145,
      fabric: "Cotton Blend",
      pattern: "Solid / Micro Texture",
      fit: "Regular Fit",
      occasion: "Casual Wear",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "Charcoal Gray", swatch: "swatch-charcoal" },
        { name: "Deep Navy", swatch: "swatch-navy" },
        { name: "Sand Beige", swatch: "swatch-sand" },
        { name: "Optic White", swatch: "swatch-white" },
      ],
    },
    kids: {
      brands: ["Mini Muse", "Little Lane", "Play Studio"],
      descriptors: ["Play Set", "Printed Dress", "Cotton Tee", "School Shirt", "Winter Jacket", "Track Set"],
      basePrice: 999,
      step: 90,
      fabric: "Soft Cotton",
      pattern: "Playful Prints",
      fit: "Comfort Fit",
      occasion: "Everyday Wear",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "Sky Blue", swatch: "swatch-sky" },
        { name: "Blush Pink", swatch: "swatch-rose" },
        { name: "Mint Green", swatch: "swatch-mint" },
        { name: "Deep Navy", swatch: "swatch-navy" },
      ],
    },
    footwear: {
      brands: ["Stride", "North Star", "Apex"],
      descriptors: ["Sneaker", "Boot", "Sandal", "Running Shoe", "Slip On", "Trainer"],
      basePrice: 1699,
      step: 190,
      fabric: "Faux Leather / Mesh",
      pattern: "Solid",
      fit: "Comfort Fit",
      occasion: "Daily Wear",
      sizes: ["6", "7", "8", "9", "10"],
      colors: [
        { name: "Black", swatch: "swatch-black" },
        { name: "White", swatch: "swatch-white" },
        { name: "Sand", swatch: "swatch-sand" },
        { name: "Gold", swatch: "swatch-gold" },
      ],
    },
    watches: {
      brands: ["Chrona", "North Vale", "Arc"],
      descriptors: ["Chronograph Watch", "Dress Watch", "Smart Watch", "Minimal Watch"],
      basePrice: 3299,
      step: 260,
      fabric: "Stainless Steel",
      pattern: "Brushed Finish",
      fit: "One Size",
      occasion: "Everyday Wear",
      sizes: ["One Size"],
      colors: [
        { name: "Black", swatch: "swatch-black" },
        { name: "Silver", swatch: "swatch-silver" },
        { name: "Gold", swatch: "swatch-gold" },
        { name: "Navy", swatch: "swatch-navy" },
      ],
    },
    sunglasses: {
      brands: ["Shade", "Noir", "Axis"],
      descriptors: ["Aviator Sunglasses", "Cat Eye Frames", "Oversized Shades", "Polarized Shades"],
      basePrice: 1299,
      step: 125,
      fabric: "Acetate",
      pattern: "Gloss Finish",
      fit: "One Size",
      occasion: "Everyday Wear",
      sizes: ["One Size"],
      colors: [
        { name: "Black", swatch: "swatch-black" },
        { name: "Tortoise", swatch: "swatch-cocoa" },
        { name: "Ivory", swatch: "swatch-ivory" },
        { name: "Rose", swatch: "swatch-rose" },
      ],
    },
    jewellery: {
      brands: ["Lumi", "Ora", "Noble"],
      descriptors: ["Earring Set", "Chain Necklace", "Ring Set", "Bracelet Set"],
      basePrice: 899,
      step: 120,
      fabric: "Brass Alloy",
      pattern: "Polished Finish",
      fit: "One Size",
      occasion: "Occasion Wear",
      sizes: ["One Size"],
      colors: [
        { name: "Gold", swatch: "swatch-gold" },
        { name: "Silver", swatch: "swatch-silver" },
        { name: "Rose Gold", swatch: "swatch-rose" },
        { name: "Pearl", swatch: "swatch-pearl" },
      ],
    },
    handbags: {
      brands: ["Vanta", "Mira", "Atelier"],
      descriptors: ["Tote Bag", "Crossbody Bag", "Shoulder Bag", "Clutch Bag"],
      basePrice: 1999,
      step: 180,
      fabric: "Textured Vegan Leather",
      pattern: "Grain Texture",
      fit: "One Size",
      occasion: "Daily Wear",
      sizes: ["One Size"],
      colors: [
        { name: "Black", swatch: "swatch-black" },
        { name: "Camel", swatch: "swatch-camel" },
        { name: "Ivory", swatch: "swatch-ivory" },
        { name: "Olive", swatch: "swatch-olive" },
      ],
    },
    luggage: {
      brands: ["Voyage", "Lumen", "Travele"],
      descriptors: ["Carry On", "Trolley Bag", "Duffle Bag", "Travel Set"],
      basePrice: 2499,
      step: 220,
      fabric: "Hard Shell Polycarbonate",
      pattern: "Textured Shell",
      fit: "One Size",
      occasion: "Travel",
      sizes: ["One Size"],
      colors: [
        { name: "Black", swatch: "swatch-black" },
        { name: "Navy", swatch: "swatch-navy" },
        { name: "Sand", swatch: "swatch-sand" },
        { name: "Red", swatch: "swatch-rose" },
      ],
    },
    accessories: {
      brands: ["Core", "Nova", "Atlas"],
      descriptors: ["Signature Edit", "Classic Essential", "Modern Capsule", "Statement Piece"],
      basePrice: 799,
      step: 110,
      fabric: "Mixed Materials",
      pattern: "Clean Finish",
      fit: "One Size",
      occasion: "Everyday Wear",
      sizes: ["One Size"],
      colors: [
        { name: "Black", swatch: "swatch-black" },
        { name: "Silver", swatch: "swatch-silver" },
        { name: "Gold", swatch: "swatch-gold" },
        { name: "Olive", swatch: "swatch-olive" },
      ],
    },
  };

  const state = {
    categoryKey: null,
    subcategoryKey: null,
    products: [],
    selectedProduct: null,
    selectedSize: "",
    selectedColor: "",
    quantity: 1,
    compareId: null,
    wishlistIds: new Set(),
    recentlyViewed: [],
    productRegistry: new Map(),
  };

  const els = {
    categorySection: document.getElementById("categorySection"),
    categoryGrid: document.getElementById("categoryGrid"),
    resetFlowBtn: document.getElementById("resetFlowBtn"),
    subcategorySection: document.getElementById("subcategorySection"),
    subcategoryHeading: document.getElementById("subcategoryHeading"),
    subcategoryCopy: document.getElementById("subcategoryCopy"),
    breadcrumbTrail: document.getElementById("breadcrumbTrail"),
    subcategoryGrid: document.getElementById("subcategoryGrid"),
    listingSection: document.getElementById("listingSection"),
    listingHeading: document.getElementById("listingHeading"),
    listingCopy: document.getElementById("listingCopy"),
    sortSelect: document.getElementById("sortSelect"),
    productGrid: document.getElementById("productGrid"),
    detailSection: document.getElementById("detailSection"),
    backToListingBtn: document.getElementById("backToListingBtn"),
    detailBreadcrumb: document.getElementById("detailBreadcrumb"),
    mainImage: document.getElementById("mainImage"),
    thumbGrid: document.getElementById("thumbGrid"),
    detailName: document.getElementById("detailName"),
    detailBrand: document.getElementById("detailBrand"),
    detailRating: document.getElementById("detailRating"),
    detailReviews: document.getElementById("detailReviews"),
    detailStock: document.getElementById("detailStock"),
    detailPrice: document.getElementById("detailPrice"),
    detailOldPrice: document.getElementById("detailOldPrice"),
    detailDiscount: document.getElementById("detailDiscount"),
    detailSku: document.getElementById("detailSku"),
    detailFabric: document.getElementById("detailFabric"),
    detailPattern: document.getElementById("detailPattern"),
    detailFit: document.getElementById("detailFit"),
    detailOccasion: document.getElementById("detailOccasion"),
    detailAvailability: document.getElementById("detailAvailability"),
    sizeGroup: document.getElementById("sizeGroup"),
    colorGroup: document.getElementById("colorGroup"),
    qtyDecrease: document.getElementById("qtyDecrease"),
    qtyIncrease: document.getElementById("qtyIncrease"),
    quantityInput: document.getElementById("quantityInput"),
    addToCartBtn: document.getElementById("addToCartBtn"),
    buyNowBtn: document.getElementById("buyNowBtn"),
    wishlistBtn: document.getElementById("wishlistBtn"),
    compareBtn: document.getElementById("compareBtn"),
    galleryWishlistBtn: document.getElementById("galleryWishlistBtn"),
    deliveryForm: document.getElementById("deliveryForm"),
    pincodeInput: document.getElementById("pincodeInput"),
    deliveryStatus: document.getElementById("deliveryStatus"),
    detailDescription: document.getElementById("detailDescription"),
    detailHighlights: document.getElementById("detailHighlights"),
    specTableBody: document.getElementById("specTableBody"),
    ratingBreakdown: document.getElementById("ratingBreakdown"),
    ratingBreakdownStars: document.getElementById("ratingBreakdownStars"),
    reviewCards: document.getElementById("reviewCards"),
    faqAccordion: document.getElementById("faqAccordion"),
    relatedGrid: document.getElementById("relatedGrid"),
    mobileCartBar: document.getElementById("mobileCartBar"),
    mobilePrice: document.getElementById("mobilePrice"),
    mobileWishlistBtn: document.getElementById("mobileWishlistBtn"),
    mobileAddBtn: document.getElementById("mobileAddBtn"),
    backToTop: document.getElementById("backToTop"),
    toastMessage: document.getElementById("toastMessage"),
  };

  function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function formatMoney(value) {
    return money.format(value);
  }

  function formatStars(rating) {
    const count = Math.round(rating);
    return Array.from({ length: 5 }, (_, index) => `<i class="bi ${index < count ? "bi-star-fill" : "bi-star"}"></i>`).join("");
  }

  function showToast(message) {
    els.toastMessage.textContent = message;
    els.toastMessage.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toastMessage.classList.remove("show"), 2400);
  }

  function scrollToElement(element) {
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setSectionVisible(section, visible) {
    section.classList.toggle("d-none", !visible);
  }

  function setTab(target) {
    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tabTarget === target);
    });
    document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tabPanel === target);
    });
  }

  function getCategory(categoryKey) {
    return categories.find((item) => item.key === categoryKey) || categories[0];
  }

  function getSubcategory(categoryKey, subcategoryKey) {
    const items = subcategoriesByCategory[categoryKey] || [];
    return items.find((item) => item.key === subcategoryKey) || items[0];
  }

  function buildProduct(categoryKey, subcategory, index) {
    const profile = productProfiles[categoryKey];
    const category = getCategory(categoryKey);
    const brand = profile.brands[index % profile.brands.length];
    const descriptor = profile.descriptors[(index + subcategory.key.length) % profile.descriptors.length];
    const price = profile.basePrice + index * profile.step + (subcategory.title.length % 3) * 60;
    const oldPrice = price + Math.round(price * 0.34);
    const discount = Math.round((1 - price / oldPrice) * 100);
    const name = `${subcategory.title} ${descriptor}`;
    const id = `${categoryKey}-${subcategory.key}-${index}`;
    const rating = Number((4.4 + ((index + subcategory.title.length) % 5) * 0.1).toFixed(1));
    const reviews = 118 + index * 17;
    const sold = 900 + index * 121;
    const stock = index % 4 === 0 ? "Only a few left" : "In stock";
    const sku = `LM-${slugify(categoryKey).slice(0, 3).toUpperCase()}-${slugify(subcategory.key).slice(0, 3).toUpperCase()}-${String(index + 1).padStart(2, "0")}`;
    const images = Array.from({ length: 4 }, (_, frameIndex) => ({
      src: imagePool[(index + frameIndex) % imagePool.length],
      alt: `${name} image ${frameIndex + 1}`,
    }));

    return {
      id,
      name,
      brand,
      categoryKey,
      categoryName: category.name,
      subcategoryKey: subcategory.key,
      subcategoryName: subcategory.title,
      image: images[0].src,
      images,
      price,
      oldPrice,
      discount,
      rating,
      reviews,
      sold,
      stock,
      sku,
      fabric: profile.fabric,
      pattern: profile.pattern,
      fit: profile.fit,
      occasion: profile.occasion,
      sizes: profile.sizes,
      colors: profile.colors,
      description: `A premium ${subcategory.title.toLowerCase()} from the ${category.name.toLowerCase()} edit, designed with clean lines, elevated finishing, and versatile styling for modern wardrobes.`,
      highlights: [
        "Premium fabric with a polished hand feel",
        "Modern silhouette for effortless styling",
        "Comfort-first construction and clean finishing",
        "Pairs easily with casual and occasion looks",
      ],
      specifications: [
        ["Brand", brand],
        ["Category", category.name],
        ["Subcategory", subcategory.title],
        ["Fabric", profile.fabric],
        ["Pattern", profile.pattern],
        ["Fit", profile.fit],
        ["Occasion", profile.occasion],
        ["SKU", sku],
        ["Stock", stock],
      ],
      reviewsData: [
        {
          name: "Priya S.",
          time: "2 days ago",
          rating: 5,
          text: `${name} looks even better in person. The finish feels premium and the fit is polished.`,
        },
        {
          name: "Aman P.",
          time: "1 week ago",
          rating: 4,
          text: "Great value for the quality. The silhouette is clean and easy to style with multiple outfits.",
        },
        {
          name: "Neha R.",
          time: "2 weeks ago",
          rating: 5,
          text: "Beautiful packaging, quick delivery, and a refined look that feels fashion-forward.",
        },
      ],
      faqs: [
        {
          q: "Is the product true to size?",
          a: `Yes, ${name.toLowerCase()} follows a regular ${profile.fit.toLowerCase()} and is designed for comfortable wear.`,
        },
        {
          q: "How soon is delivery available?",
          a: "Delivery estimates are shown instantly after checking your pincode below.",
        },
        {
          q: "Can I return the item?",
          a: "Yes, easy returns are available within the standard return window.",
        },
        {
          q: "Is the product suitable for gifting?",
          a: "Absolutely. The luxury styling and packaging-friendly presentation make it ideal for gifting.",
        },
      ],
    };
  }

  function buildProducts(categoryKey, subcategory, count = 8) {
    return Array.from({ length: count }, (_, index) => buildProduct(categoryKey, subcategory, index));
  }

  function registerProducts(products) {
    products.forEach((product) => state.productRegistry.set(product.id, product));
  }

  function renderCategoryCards() {
    els.categoryGrid.innerHTML = categories
      .map(
        (category) => `
          <div class="col-12 col-sm-6 col-xl-3">
            <button class="category-card text-start" type="button" data-category="${category.key}">
              <img src="${category.image}" alt="${category.name}">
              <div class="card-body">
                <h3>${category.name}</h3>
                <p class="category-copy">${category.copy}</p>
                <div class="category-meta">Explore subcategories</div>
              </div>
            </button>
          </div>
        `
      )
      .join("");
  }

  function renderSubcategories(categoryKey) {
    const category = getCategory(categoryKey);
    const items = subcategoriesByCategory[categoryKey] || [];

    els.subcategoryHeading.textContent = `${category.name} Subcategories`;
    els.subcategoryCopy.textContent = category.copy;
    els.breadcrumbTrail.innerHTML = `
      <li class="breadcrumb-item"><span>Categories</span></li>
      <li class="breadcrumb-item active" aria-current="page">${category.name}</li>
    `;

    els.subcategoryGrid.innerHTML = items
      .map(
        (item) => `
          <div class="col-12 col-sm-6 col-xl-3">
            <button class="subcategory-card text-start" type="button" data-subcategory="${item.key}">
              <img src="${item.image}" alt="${item.title}">
              <div class="card-body">
                <h3>${item.title}</h3>
                <p>${item.copy}</p>
              </div>
            </button>
          </div>
        `
      )
      .join("");

    setSectionVisible(els.subcategorySection, true);
    setSectionVisible(els.listingSection, false);
    setSectionVisible(els.detailSection, false);
    els.mobileCartBar.classList.add("d-none");
    scrollToElement(els.subcategorySection);
  }

  function renderStars(rating) {
    return formatStars(rating);
  }

  function renderProductCard(product, compact = false) {
    const active = state.wishlistIds.has(product.id);
    const actionText = compact ? "View" : "Quick View";
    return `
      <div class="col-12 col-sm-6 col-xl-3">
        <article class="product-card" data-product-id="${product.id}">
          <button class="wishlist-icon ${active ? "active" : ""}" type="button" data-action="wishlist" aria-label="Toggle wishlist">
            <i class="bi ${active ? "bi-heart-fill" : "bi-heart"}"></i>
          </button>
          <span class="badge-discount">-${product.discount}%</span>
          <img src="${product.image}" alt="${product.name}">
          <div class="card-body">
            <p class="text-uppercase small fw-semibold text-muted mb-1">${product.brand}</p>
            <h3>${product.name}</h3>
            <div class="card-meta mb-2">
              <span class="stars">${renderStars(product.rating)}</span>
              <span>${product.rating}</span>
              <span>(${product.reviews})</span>
            </div>
            <div class="price-row">
              <strong class="current-price">${formatMoney(product.price)}</strong>
              <span class="old-price">${formatMoney(product.oldPrice)}</span>
            </div>
            <div class="card-actions">
              <button class="btn btn-outline-dark btn-sm" type="button" data-action="quick-view">${actionText}</button>
              <button class="btn btn-dark btn-sm" type="button" data-action="add-cart">Add to Cart</button>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function renderProducts(products) {
    if (!products.length) {
      els.productGrid.innerHTML = `
        <div class="col-12">
          <div class="module-intro-panel">
            <div>
              <h3 class="mb-2">Select a subcategory to view products.</h3>
              <p class="section-copy mb-0">Your premium listing will appear here.</p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    els.productGrid.innerHTML = products.map((product) => renderProductCard(product)).join("");
    registerProducts(products);
  }

  function sortProducts(products, sortValue) {
    const sorted = [...products];
    switch (sortValue) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }

  function renderThumbs(product) {
    els.thumbGrid.innerHTML = product.images
      .map(
        (frame, index) => `
          <button class="thumb-btn ${index === 0 ? "active" : ""}" type="button" data-thumb="${index}" data-src="${frame.src}" data-alt="${frame.alt}">
            <img src="${frame.src}" alt="${frame.alt}">
          </button>
        `
      )
      .join("");
  }

  function renderSizeButtons(product) {
    els.sizeGroup.innerHTML = product.sizes
      .map(
        (size, index) => `
          <button class="chip-btn ${index === 0 ? "active" : ""}" type="button" data-size="${size}">${size}</button>
        `
      )
      .join("");
  }

  function renderColorButtons(product) {
    els.colorGroup.innerHTML = product.colors
      .map(
        (color, index) => `
          <button class="swatch-btn ${color.swatch} ${index === 0 ? "active" : ""}" type="button" data-color="${color.name}" aria-label="${color.name}"></button>
        `
      )
      .join("");
  }

  function renderHighlights(product) {
    els.detailHighlights.innerHTML = product.highlights.map((item) => `<li>${item}</li>`).join("");
  }

  function renderSpecifications(product) {
    els.specTableBody.innerHTML = product.specifications.map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join("");
  }

  function renderReviews(product) {
    els.ratingBreakdown.textContent = product.rating.toFixed(1);
    els.ratingBreakdownStars.innerHTML = renderStars(product.rating);
    els.reviewCards.innerHTML = product.reviewsData
      .map(
        (review) => `
          <article class="review-card">
            <div class="d-flex justify-content-between align-items-center gap-3">
              <strong>${review.name}</strong>
              <span class="small text-muted">${review.time}</span>
            </div>
            <div class="stars small my-2">${Array.from({ length: 5 }, (_, index) => `<i class="bi ${index < review.rating ? "bi-star-fill" : "bi-star"}"></i>`).join("")}</div>
            <p class="mb-0 text-muted">${review.text}</p>
          </article>
        `
      )
      .join("");
  }

  function renderFaqs(product) {
    els.faqAccordion.innerHTML = product.faqs
      .map(
        (faq, index) => {
          const itemId = `${product.id}-faq-${index}`;
          return `
            <div class="accordion-item">
              <h3 class="accordion-header" id="${itemId}-heading">
                <button class="accordion-button ${index === 0 ? "" : "collapsed"}" type="button" data-bs-toggle="collapse" data-bs-target="#${itemId}-collapse" aria-expanded="${index === 0 ? "true" : "false"}" aria-controls="${itemId}-collapse">
                  ${faq.q}
                </button>
              </h3>
              <div id="${itemId}-collapse" class="accordion-collapse collapse ${index === 0 ? "show" : ""}" aria-labelledby="${itemId}-heading" data-bs-parent="#faqAccordion">
                <div class="accordion-body text-muted">${faq.a}</div>
              </div>
            </div>
          `;
        }
      )
      .join("");
  }

  function renderRelatedProducts(product) {
    const pool = (subcategoriesByCategory[product.categoryKey] || [])
      .filter((item) => item.key !== product.subcategoryKey)
      .slice(0, 4)
      .map((sub, index) => buildProduct(product.categoryKey, sub, index + 1));

    if (pool.length < 4) {
      const fallback = buildProducts(product.categoryKey, getSubcategory(product.categoryKey, product.subcategoryKey), 4)
        .filter((item) => item.id !== product.id);
      pool.push(...fallback.slice(0, 4 - pool.length));
    }

    const related = pool.slice(0, 4);
    registerProducts(related);
    els.relatedGrid.innerHTML = related.map((item) => renderProductCard(item, true)).join("");
  }

  function renderDetailBreadcrumb(product) {
    els.detailBreadcrumb.innerHTML = `
      <li class="breadcrumb-item"><span>Categories</span></li>
      <li class="breadcrumb-item"><span>${product.categoryName}</span></li>
      <li class="breadcrumb-item"><span>${product.subcategoryName}</span></li>
      <li class="breadcrumb-item active" aria-current="page">${product.name}</li>
    `;
  }

  function updateWishlistButtons(product) {
    const active = state.wishlistIds.has(product.id);
    const iconClass = active ? "bi-heart-fill" : "bi-heart";
    els.galleryWishlistBtn.classList.toggle("active", active);
    els.galleryWishlistBtn.innerHTML = `<i class="bi ${iconClass}"></i>`;
    els.wishlistBtn.classList.toggle("btn-dark", active);
    els.wishlistBtn.classList.toggle("btn-outline-dark", !active);
    els.wishlistBtn.innerHTML = `<i class="bi ${iconClass} me-2"></i>${active ? "Saved" : "Wishlist"}`;
    els.mobileWishlistBtn.innerHTML = `<i class="bi ${iconClass}"></i>`;
    els.productGrid.querySelectorAll("[data-product-id]").forEach((card) => {
      const productId = card.dataset.productId;
      const isActive = state.wishlistIds.has(productId);
      const button = card.querySelector("[data-action='wishlist']");
      if (button) {
        button.classList.toggle("active", isActive);
        button.innerHTML = `<i class="bi ${isActive ? "bi-heart-fill" : "bi-heart"}"></i>`;
      }
    });
  }

  function updateCompareButton(product) {
    const active = state.compareId === product.id;
    els.compareBtn.classList.toggle("btn-dark", active);
    els.compareBtn.classList.toggle("btn-outline-dark", !active);
    els.compareBtn.innerHTML = `<i class="bi bi-shuffle me-2"></i>${active ? "Comparing" : "Compare"}`;
  }

  function updateMobileBar(product) {
    els.mobilePrice.textContent = formatMoney(product.price * state.quantity);
  }

  function setQuantity(next) {
    state.quantity = Math.max(1, next);
    els.quantityInput.value = String(state.quantity);
    if (state.selectedProduct) {
      updateMobileBar(state.selectedProduct);
    }
  }

  function setSelectedSize(size) {
    state.selectedSize = size;
    document.querySelectorAll("[data-size]").forEach((button) => button.classList.toggle("active", button.dataset.size === size));
  }

  function setSelectedColor(color) {
    state.selectedColor = color;
    document.querySelectorAll("[data-color]").forEach((button) => button.classList.toggle("active", button.dataset.color === color));
  }

  function renderDetail(product) {
    state.selectedProduct = product;
    state.quantity = 1;
    state.selectedSize = product.sizes[0];
    state.selectedColor = product.colors[0].name;

    els.mainImage.src = product.images[0].src;
    els.mainImage.alt = product.images[0].alt;
    els.detailName.textContent = product.name;
    els.detailBrand.textContent = product.brand;
    els.detailRating.innerHTML = `${renderStars(product.rating)} <span class="ms-1">${product.rating.toFixed(1)}</span>`;
    els.detailReviews.textContent = `${product.reviews} reviews`;
    els.detailStock.textContent = product.stock;
    els.detailPrice.textContent = formatMoney(product.price);
    els.detailOldPrice.textContent = formatMoney(product.oldPrice);
    els.detailDiscount.textContent = `-${product.discount}%`;
    els.detailSku.textContent = product.sku;
    els.detailFabric.textContent = product.fabric;
    els.detailPattern.textContent = product.pattern;
    els.detailFit.textContent = product.fit;
    els.detailOccasion.textContent = product.occasion;
    els.detailAvailability.textContent = product.stock;
    els.detailDescription.textContent = product.description;
    renderHighlights(product);
    renderThumbs(product);
    renderSizeButtons(product);
    renderColorButtons(product);
    renderSpecifications(product);
    renderReviews(product);
    renderFaqs(product);
    renderRelatedProducts(product);
    renderDetailBreadcrumb(product);
    updateWishlistButtons(product);
    updateCompareButton(product);
    updateMobileBar(product);
    els.deliveryStatus.className = "delivery-status";
    els.deliveryStatus.textContent = "Enter your pincode to check delivery availability.";
    setQuantity(1);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0].name);
    setSectionVisible(els.detailSection, true);
    setSectionVisible(els.listingSection, true);
    els.mobileCartBar.classList.remove("d-none");
  }

  function openProduct(product, options = {}) {
    if (!product) {
      return;
    }

    if (!state.recentlyViewed.find((item) => item.id === product.id)) {
      state.recentlyViewed.unshift(product);
      state.recentlyViewed = state.recentlyViewed.slice(0, 6);
    }

    renderDetail(product);

    if (options.scroll !== false) {
      scrollToElement(els.detailSection);
    }
  }

  function selectCategory(categoryKey) {
    state.categoryKey = categoryKey;
    state.subcategoryKey = null;
    state.products = [];
    state.selectedProduct = null;
    setSectionVisible(els.subcategorySection, true);
    setSectionVisible(els.listingSection, false);
    setSectionVisible(els.detailSection, false);
    els.mobileCartBar.classList.add("d-none");
    renderSubcategories(categoryKey);
  }

  function selectSubcategory(categoryKey, subcategoryKey) {
    state.categoryKey = categoryKey;
    state.subcategoryKey = subcategoryKey;
    const subcategory = getSubcategory(categoryKey, subcategoryKey);
    const products = sortProducts(buildProducts(categoryKey, subcategory, 8), els.sortSelect.value);
    state.products = products;

    els.listingHeading.textContent = `${subcategory.title} Products`;
    els.listingCopy.textContent = `${getCategory(categoryKey).name} / ${subcategory.title} collection.`;
    renderProducts(products);
    setSectionVisible(els.listingSection, true);
    setSectionVisible(els.detailSection, false);
    scrollToElement(els.listingSection);
  }

  function toggleWishlist(productId) {
    if (state.wishlistIds.has(productId)) {
      state.wishlistIds.delete(productId);
      showToast("Removed from wishlist.");
    } else {
      state.wishlistIds.add(productId);
      showToast("Added to wishlist.");
    }

    if (state.products.length) {
      renderProducts(state.products);
    }

    if (state.selectedProduct) {
      updateWishlistButtons(state.selectedProduct);
    }
  }

  function toggleCompare(productId) {
    state.compareId = state.compareId === productId ? null : productId;
    if (state.selectedProduct) {
      updateCompareButton(state.selectedProduct);
    }
    showToast(state.compareId ? "Added to compare." : "Removed from compare.");
  }

  function attachRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
  }

  function initTabs() {
    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.tabTarget));
    });
  }

  function initEventHandlers() {
    els.categoryGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (button) {
        selectCategory(button.dataset.category);
      }
    });

    els.subcategoryGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-subcategory]");
      if (button) {
        selectSubcategory(state.categoryKey, button.dataset.subcategory);
      }
    });

    function handleProductClick(event, sourceGrid) {
      const card = event.target.closest("[data-product-id]");
      if (!card) {
        return;
      }

      const product = state.productRegistry.get(card.dataset.productId);
      if (!product) {
        return;
      }

      const action = event.target.closest("[data-action]");
      if (action) {
        switch (action.dataset.action) {
          case "wishlist":
            toggleWishlist(product.id);
            break;
          case "quick-view":
            openProduct(product);
            break;
          case "add-cart":
            showToast(`Added ${product.name} to cart.`);
            break;
          default:
            break;
        }
        return;
      }

      openProduct(product);
    }

    els.productGrid.addEventListener("click", (event) => handleProductClick(event));
    els.relatedGrid.addEventListener("click", (event) => handleProductClick(event));

    els.sortSelect.addEventListener("change", () => {
      if (!state.categoryKey || !state.subcategoryKey) {
        return;
      }
      const subcategory = getSubcategory(state.categoryKey, state.subcategoryKey);
      state.products = sortProducts(buildProducts(state.categoryKey, subcategory, 8), els.sortSelect.value);
      renderProducts(state.products);
      if (state.selectedProduct) {
        const replacement = state.products.find((item) => item.id === state.selectedProduct.id) || state.products[0];
        if (replacement) {
          openProduct(replacement, { scroll: false });
        }
      }
    });

    els.qtyDecrease.addEventListener("click", () => setQuantity(state.quantity - 1));
    els.qtyIncrease.addEventListener("click", () => setQuantity(state.quantity + 1));

    els.sizeGroup.addEventListener("click", (event) => {
      const button = event.target.closest("[data-size]");
      if (button) {
        setSelectedSize(button.dataset.size);
      }
    });

    els.colorGroup.addEventListener("click", (event) => {
      const button = event.target.closest("[data-color]");
      if (button) {
        setSelectedColor(button.dataset.color);
      }
    });

    els.galleryWishlistBtn.addEventListener("click", () => {
      if (state.selectedProduct) {
        toggleWishlist(state.selectedProduct.id);
      }
    });

    els.wishlistBtn.addEventListener("click", () => {
      if (state.selectedProduct) {
        toggleWishlist(state.selectedProduct.id);
      }
    });

    els.mobileWishlistBtn.addEventListener("click", () => {
      if (state.selectedProduct) {
        toggleWishlist(state.selectedProduct.id);
      }
    });

    els.compareBtn.addEventListener("click", () => {
      if (state.selectedProduct) {
        toggleCompare(state.selectedProduct.id);
      }
    });

    els.addToCartBtn.addEventListener("click", () => {
      if (state.selectedProduct) {
        showToast(`Added ${state.quantity} x ${state.selectedProduct.name} to cart.`);
      }
    });

    els.buyNowBtn.addEventListener("click", () => {
      if (state.selectedProduct) {
        showToast("Proceeding to secure checkout.");
      }
    });

    els.mobileAddBtn.addEventListener("click", () => {
      if (state.selectedProduct) {
        showToast(`Added ${state.quantity} x ${state.selectedProduct.name} to cart.`);
      }
    });

    els.deliveryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const pincode = els.pincodeInput.value.trim();

      if (!/^\d{6}$/.test(pincode)) {
        els.deliveryStatus.className = "delivery-status is-error";
        els.deliveryStatus.textContent = "Please enter a valid 6-digit pincode.";
        return;
      }

      const firstDigit = Number(pincode[0]);
      const eta = firstDigit <= 3 ? "2-4 business days" : "4-6 business days";
      els.deliveryStatus.className = "delivery-status is-success";
      els.deliveryStatus.textContent = `Delivery available to ${pincode}. Expected delivery in ${eta}.`;
    });

    els.backToListingBtn.addEventListener("click", () => {
      scrollToElement(els.listingSection);
    });

    els.resetFlowBtn.addEventListener("click", () => {
      state.categoryKey = null;
      state.subcategoryKey = null;
      state.products = [];
      state.selectedProduct = null;
      state.selectedSize = "";
      state.selectedColor = "";
      state.quantity = 1;
      state.compareId = null;
      els.quantityInput.value = "1";
      els.pincodeInput.value = "";
      els.deliveryStatus.className = "delivery-status";
      els.deliveryStatus.textContent = "Enter your pincode to check delivery availability.";
      setSectionVisible(els.subcategorySection, false);
      setSectionVisible(els.listingSection, false);
      setSectionVisible(els.detailSection, false);
      els.mobileCartBar.classList.add("d-none");
      scrollToElement(els.categorySection);
    });

    els.thumbGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-thumb]");
      if (!button) {
        return;
      }

      els.mainImage.src = button.dataset.src;
      els.mainImage.alt = button.dataset.alt;
      document.querySelectorAll("[data-thumb]").forEach((thumb) => thumb.classList.toggle("active", thumb === button));
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".tab-btn")) {
        return;
      }
    });

    els.detailSection.addEventListener("click", (event) => {
      const tabButton = event.target.closest("[data-tab-target]");
      if (tabButton) {
        setTab(tabButton.dataset.tabTarget);
      }
    });

    window.addEventListener("scroll", () => {
      els.backToTop.classList.toggle("show", window.scrollY > 600);
    });

    els.backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initScrollReveal() {
    document.querySelectorAll(".section-space").forEach((section) => section.classList.add("reveal"));
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
  }

  function init() {
    renderCategoryCards();
    setSectionVisible(els.subcategorySection, false);
    setSectionVisible(els.listingSection, false);
    setSectionVisible(els.detailSection, false);
    setTab("description");
    els.deliveryStatus.textContent = "Enter your pincode to check delivery availability.";
    initTabs();
    initEventHandlers();
    initScrollReveal();
    els.quantityInput.value = "1";
    showToast("Select a category to begin browsing.");
  }

  init();
})();
