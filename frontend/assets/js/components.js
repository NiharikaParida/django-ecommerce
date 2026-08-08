(function () {
  "use strict";

  const inPages = window.location.pathname.toLowerCase().includes("/pages/");
  const link = (file) => inPages ? file : `pages/${file}`;
  const home = inPages ? "../index.html" : "index.html";
  const loggedIn = Boolean(localStorage.getItem("fashionUser"));
  const profile = loggedIn ? link("profile.html") : link("login.html");
  const current = window.location.pathname.split("/").pop().toLowerCase();

  const navItems = [
    ["index.html", "Home", home], ["product.html", "Products", link("product.html")],
    ["categories_women.html", "Women", link("categories_women.html")],
    ["categories_men.html", "Men", link("categories_men.html")],
    ["catgories_kids.html", "Kids", link("catgories_kids.html")],
    ["blog.html", "Blog", link("blog.html")], ["contact.html", "Contact", link("contact.html")],
  ];

  const header = `<header class="navbar site-header">
    <div class="logo"><a href="${home}">FASHION<span>.</span></a></div>
    <nav><ul class="nav-links">${navItems.map(([file, label, href]) => `<li><a href="${href}" class="${current === file ? "active" : ""}">${label}</a></li>`).join("")}</ul></nav>
    <div class="nav-icons">
      <a href="${link("product.html")}" aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></a>
      <a href="${link("wishlist.html")}" aria-label="Wishlist"><i class="fa-regular fa-heart"></i></a>
      <a href="${link("cart.html")}" aria-label="Cart"><i class="fa-solid fa-cart-shopping"></i></a>
      <a href="${profile}" aria-label="${loggedIn ? "Profile" : "Login"}"><i class="fa-regular fa-user"></i></a>
    </div>
    <button class="menu-btn" type="button" aria-label="Open navigation">☰</button>
  </header>`;

  const footer = `<footer class="footer site-footer"><div class="footer-container">
    <div class="footer-box"><h2>Fashion.</h2><p>Premium fashion store offering latest trends<br>for men, women, and kids.</p></div>
    <div class="footer-box"><h3>Quick Links</h3><a href="${home}">Home</a><a href="${link("product.html")}">Shop</a><a href="${link("categories_women.html")}">Categories</a><a href="${link("product.html")}">Sale</a></div>
    <div class="footer-box"><h3>Customer Support</h3><a href="${link("contact.html")}">Contact Us</a><a href="${link("contact.html")}#returns">Returns</a><a href="${link("contact.html")}#shipping">Shipping</a><a href="${link("contact.html")}#privacy">Privacy Policy</a></div>
    <div class="footer-box"><h3>Contact</h3><p>support@fashion.com</p><p>+91 9876543210</p><p>Bhubaneswar, Odisha</p></div>
  </div><div class="copyright">© 2026 Fashion Store | All Rights Reserved</div></footer>`;

  function renderSharedChrome() {
    const oldHeader = document.querySelector("header");
    if (oldHeader) oldHeader.outerHTML = header;
    else document.body.insertAdjacentHTML("afterbegin", header);
    const oldFooter = document.querySelector("footer");
    if (oldFooter) oldFooter.outerHTML = footer;
    else document.body.insertAdjacentHTML("beforeend", footer);

    const menu = document.querySelector(".site-header .menu-btn");
    const nav = document.querySelector(".site-header .nav-links");
    if (menu && nav) menu.addEventListener("click", () => nav.classList.toggle("open"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderSharedChrome);
  else renderSharedChrome();
})();
