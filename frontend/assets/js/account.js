(function () {
  "use strict";

  let loggedIn = false;
  try { loggedIn = Boolean(JSON.parse(localStorage.getItem("fashionUser") || "null")); }
  catch (error) { loggedIn = false; }

  const isRootPage = window.location.pathname.endsWith("/index.html") || window.location.pathname.endsWith("/");
  const destination = loggedIn ? "profile.html" : "login.html";
  const profileHref = isRootPage ? `pages/${destination}` : destination;

  document.querySelectorAll(".nav-icons").forEach((icons) => {
    const icon = icons.querySelector(".fa-user, .fa-regular.fa-user, .fa-solid.fa-user");
    if (!icon) return;
    const link = icon.closest("a") || document.createElement("a");
    if (!link.parentElement) {
      icon.replaceWith(link);
      link.appendChild(icon);
    }
    link.href = profileHref;
    link.setAttribute("aria-label", loggedIn ? "Profile" : "Login");
    link.title = loggedIn ? "Profile" : "Login / Register";
  });
})();
