(function () {
  "use strict";

  const inPagesFolder = /[\\/]pages[\\/]/i.test(window.location.pathname);
  const pageBase = inPagesFolder ? "" : "pages/";
  const assetBase = inPagesFolder ? "../assets/" : "assets/";
  const productPage = `${pageBase}product.html`;
  const wishlistPage = `${pageBase}wishlist.html`;
  const loginPage = `${pageBase}login.html`;
  const products = () => window.FASHION_PRODUCTS || [];
  const WISHLIST_KEY = "fashionWishlist";

  function loadWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveWishlist(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }

  function isSaved(id) {
    return loadWishlist().some((item) => String(item.id) === String(id));
  }

  function toggleWishlist(id) {
    const product = products().find((item) => String(item.id) === String(id));
    if (!product) return false;
    const items = loadWishlist();
    const exists = items.some((item) => String(item.id) === String(id));
    saveWishlist(exists ? items.filter((item) => String(item.id) !== String(id)) : [...items, product]);
    return !exists;
  }

  function updateWishlistIndicators() {
    const count = loadWishlist().length;
    document.querySelectorAll("[data-wishlist-count]").forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
    document.querySelectorAll("[data-wishlist-id]").forEach((button) => {
      const saved = isSaved(button.dataset.wishlistId);
      button.classList.toggle("is-saved", saved);
      button.setAttribute("aria-label", saved ? "Remove from wishlist" : "Add to wishlist");
      button.innerHTML = saved ? "♥" : "♡";
    });
  }

  function createHeader() {
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <div class="site-header-inner">
        <a class="site-logo" href="${inPagesFolder ? "../index.html" : "index.html"}">FASHION<span>.</span></a>
        <button class="site-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
        <nav class="site-nav" aria-label="Main navigation">
          <a data-nav="home" href="${inPagesFolder ? "../index.html" : "index.html"}">Home</a>
          <a data-nav="products" href="${productPage}">Products</a>
          <a data-nav="women" href="${pageBase}categories_women.html">Women</a>
          <a data-nav="men" href="${pageBase}categories_men.html">Men</a>
          <a data-nav="kids" href="${pageBase}catgories_kids.html">Kids</a>
          <a data-nav="blog" href="${pageBase}blog.html">Blog</a>
          <a data-nav="contact" href="${pageBase}contact.html">Contact</a>
        </nav>
        <form class="site-search" id="siteSearchForm" role="search">
          <input id="siteSearchInput" type="search" placeholder="Search products..." aria-label="Search products">
          <button type="submit" aria-label="Search">⌕</button>
        </form>
        <div class="site-actions">
          <a class="site-action" href="${wishlistPage}" aria-label="Wishlist">♡<span class="site-count" data-wishlist-count hidden>0</span></a>
          <a class="site-action" href="${wishlistPage}" aria-label="Cart">🛒</a>
          <a class="site-action" data-profile-link href="${loginPage}" aria-label="Profile">♙</a>
        </div>
      </div>`;
    return header;
  }

  function createFooter() {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="site-footer-inner">
        <div><h2>Fashion<span>.</span></h2><p>Discover premium fashion for men, women, and kids. Style meets comfort with every collection.</p></div>
        <div><h3>Explore</h3><a href="${productPage}">Products</a><a href="${pageBase}categories_women.html">Women</a><a href="${pageBase}categories_men.html">Men</a><a href="${pageBase}catgories_kids.html">Kids</a></div>
        <div><h3>Customer Care</h3><a href="${pageBase}contact.html">Contact</a><a href="${pageBase}wishlist.html">Wishlist</a><a href="${pageBase}blog.html">Blog</a><a href="${pageBase}login.html">Account</a></div>
        <div><h3>Support</h3><a href="${pageBase}contact.html">Shipping & Returns</a><a href="${pageBase}contact.html">Privacy</a><a href="${pageBase}contact.html">FAQs</a></div>
      </div>
      <div class="site-footer-bottom">© 2026 Fashion. All Rights Reserved.</div>`;
    return footer;
  }

  function setActivePage() {
    const file = window.location.pathname.split(/[\\/]/).pop().toLowerCase() || "index.html";
    const key = file.includes("categories_women") ? "women" : file.includes("categories_men") ? "men" : file.includes("kids") ? "kids" : file.includes("blog") ? "blog" : file.includes("contact") ? "contact" : file.includes("product") ? "products" : "home";
    document.querySelector(`[data-nav="${key}"]`)?.classList.add("is-active");
  }

  function routeCards() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("wishlist")) return;
    const start = path.includes("categories_women") ? 1 : path.includes("categories_men") ? 57 : path.includes("kids") ? 113 : 1;
    document.querySelectorAll(".product-card").forEach((card, index) => {
      const id = card.dataset.productId || card.dataset.id || String(start + index);
      card.dataset.productId = id;
      if (!card.querySelector("[data-wishlist-id]")) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "site-wishlist-toggle";
        button.dataset.wishlistId = id;
        button.textContent = "♡";
        card.style.position = card.style.position || "relative";
        card.appendChild(button);
      }
      card.addEventListener("click", (event) => {
        if (event.target.closest("button, a, input, select, label")) return;
        if (products().some((product) => String(product.id) === String(id))) {
          window.location.href = `${pageBase}product-details.html?id=${encodeURIComponent(id)}`;
        }
      });
    });
  }

  function bindWishlistButtons() {
    document.querySelectorAll("[data-wishlist-id]").forEach((button) => {
      if (button.dataset.commonBound) return;
      button.dataset.commonBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(button.dataset.wishlistId);
        updateWishlistIndicators();
      });
    });
  }

  function bindDetailWishlist() {
    const id = new URLSearchParams(window.location.search).get("id");
    const button = document.querySelector(".wishlist");
    if (id && button && !button.dataset.wishlistId) button.dataset.wishlistId = id;
  }

  function showNoProducts(container, message = "No products found") {
    let empty = container.querySelector(".site-no-products");
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "site-no-products";
      container.appendChild(empty);
    }
    empty.textContent = message;
    empty.hidden = false;
  }

  function filterCurrentCards(query) {
    const cards = [...document.querySelectorAll(".product-card")];
    if (!cards.length) return false;
    let visible = 0;
    cards.forEach((card) => {
      const matches = card.textContent.toLowerCase().includes(query);
      card.style.display = matches ? "" : "none";
      if (matches) visible += 1;
    });
    const container = cards[0].parentElement?.parentElement || document.body;
    if (visible === 0) showNoProducts(container);
    else container.querySelector(".site-no-products")?.setAttribute("hidden", "hidden");
    return true;
  }

  function renderSearchResults(query) {
    const matches = products().filter((product) => product.name.toLowerCase().includes(query));
    let section = document.getElementById("siteSearchResults");
    if (!section) {
      section = document.createElement("section");
      section.id = "siteSearchResults";
      section.className = "site-search-results";
      document.querySelector(".products-hero")?.after(section);
    }
    section.innerHTML = `<h2>Search results for “${query}”</h2>`;
    if (!matches.length) {
      section.insertAdjacentHTML("beforeend", '<div class="site-no-products">No products found</div>');
      return;
    }
    section.insertAdjacentHTML("beforeend", `<div class="site-search-results-grid">${matches.map((product) => `<article class="site-search-result-card" data-product-id="${product.id}"><button type="button" class="site-wishlist-toggle" data-wishlist-id="${product.id}">♡</button><img src="${product.images[0]}" alt="${product.name}"><h3>${product.name}</h3><p>${product.category} · ${product.brand} · ₹${product.price}</p></article>`).join("")}</div>`);
    section.querySelectorAll(".site-search-result-card").forEach((card) => card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      window.location.href = `product-details.html?id=${card.dataset.productId}`;
    }));
    bindWishlistButtons();
    updateWishlistIndicators();
  }

  function bindSearch() {
    const form = document.getElementById("siteSearchForm");
    const input = document.getElementById("siteSearchInput");
    if (!form || !input) return;
    const query = new URLSearchParams(window.location.search).get("search") || "";
    input.value = query;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim().toLowerCase();
      if (!value) return;
      if (window.location.pathname.toLowerCase().includes("product.html")) {
        renderSearchResults(value);
      } else if (!filterCurrentCards(value)) {
        window.location.href = `${productPage}?search=${encodeURIComponent(value)}`;
      }
    });
  }

  function updateProfileLink() {
    const link = document.querySelector("[data-profile-link]");
    if (!link) return;
    const loggedIn = localStorage.getItem("fashionAuth") === "true";
    link.href = loggedIn ? `${pageBase}login.html?loggedIn=true` : loginPage;
  }

  function init() {
    if (!document.querySelector("link[data-common-styles]")) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = `${assetBase}css/common.css`;
      style.dataset.commonStyles = "true";
      document.head.appendChild(style);
    }
    document.querySelectorAll("header, footer").forEach((element) => element.remove());
    document.body.prepend(createHeader());
    document.body.append(createFooter());
    routeCards();
    bindDetailWishlist();
    bindWishlistButtons();
    updateWishlistIndicators();
    setActivePage();
    updateProfileLink();
    bindSearch();
    const query = new URLSearchParams(window.location.search).get("search")?.trim().toLowerCase();
    if (query && window.location.pathname.toLowerCase().includes("product.html")) renderSearchResults(query);
    const menu = document.querySelector(".site-menu-toggle");
    const nav = document.querySelector(".site-nav");
    menu?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", String(open));
    });
  }

  function loadProductsThenInit() {
    if (window.FASHION_PRODUCTS) {
      init();
      return;
    }
    const script = document.createElement("script");
    script.src = `${assetBase}js/products.js`;
    script.onload = init;
    script.onerror = init;
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadProductsThenInit);
  else loadProductsThenInit();
})();
