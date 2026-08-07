/* ============================================================
   WISHLIST.JS
   Handles:
   - index.html    -> static .wishlist heart buttons
   - product.html  -> handled separately inside product.js
   - wishlist.html -> renders saved items grid, remove/clear,
                       and Add to Cart for BOTH #wishlistGrid
                       (dynamic) and #relatedGrid (static HTML)

   Uses the SAME localStorage key/format as product.js:
   key: "fashionWishlist"
   item shape: { id, name, brand, image, price, oldPrice }
   ============================================================ */

const WISHLIST_KEY = "fashionWishlist";

/* ---------- Core storage helpers ---------- */

function loadWishlist() {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
}

function saveWishlist(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

function isInWishlist(id) {
    return loadWishlist().some((item) => item.id === id);
}

function addToWishlist(product) {
    const items = loadWishlist();
    if (!items.some((item) => item.id === product.id)) {
        items.push(product);
        saveWishlist(items);
    }
}

function removeFromWishlist(id) {
    saveWishlist(loadWishlist().filter((item) => item.id !== id));
}

function toggleWishlistItem(product) {
    if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        return false; // now removed
    }
    addToWishlist(product);
    return true; // now added
}

/* ---------- Toast (matches .toast-message / .show in wishlist.css) ---------- */

let toastTimer = null;

function showToast(message) {
    const toast = document.getElementById("toastMessage");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ============================================================
   PART 1 — index.html static product cards
   ============================================================ */

function getProductFromStaticCard(card) {
    const name = card.querySelector("h3")?.textContent.trim() || "Product";
    const id = "static-" + name.replace(/\s+/g, "-").toLowerCase();

    return {
        id,
        name,
        brand: card.querySelector(".brand")?.textContent.trim() || "",
        price: card.querySelector(".new-price")?.textContent.trim() || "",
        oldPrice: card.querySelector(".old-price")?.textContent.trim() || "",
        image: card.querySelector("img")?.getAttribute("src") || "",
    };
}

function setHeartState(btn, active) {
    btn.classList.toggle("active", active);
    btn.style.color = active ? "#D72638" : "";
}

function initStaticWishlistButtons() {
    const buttons = document.querySelectorAll(".product-card .wishlist");

    buttons.forEach((btn) => {
        const card = btn.closest(".product-card");
        const product = getProductFromStaticCard(card);

        setHeartState(btn, isInWishlist(product.id));

        btn.addEventListener("click", () => {
            const nowActive = toggleWishlistItem(product);
            setHeartState(btn, nowActive);
            updateWishlistCountBadge();
        });
    });
}

/* ============================================================
   PART 2 — wishlist.html: render saved items + remove/clear
   Matches friend's actual card markup: img directly in
   .product-card, .card-meta/.stars, .current-price/.old-price,
   .btn-accent for Add to Cart, row g-4 / col-sm-6 col-lg-3 grid.
   ============================================================ */

function updateWishlistCountBadge() {
    const count = loadWishlist().length;
    const chip = document.getElementById("wishlistCount");
    if (chip) chip.textContent = `${count} Item${count !== 1 ? "s" : ""} Saved`;
}

function renderWishlistPage() {
    const grid = document.getElementById("wishlistGrid");
    const emptyState = document.getElementById("wishlistEmpty");
    if (!grid) return; // not on wishlist.html

    const items = loadWishlist();
    updateWishlistCountBadge();

    if (items.length === 0) {
        grid.innerHTML = "";
        emptyState?.classList.remove("d-none");
        return;
    }

    emptyState?.classList.add("d-none");

    grid.innerHTML = items
        .map(
            (product) => `
        <div class="col-sm-6 col-lg-3">
            <article class="product-card" data-id="${product.id}">

                <button class="wishlist-icon active" type="button" data-id="${product.id}" aria-label="Remove from wishlist">
                    <i class="bi bi-heart-fill"></i>
                </button>

                <img src="${product.image}" alt="${product.name}">

                <div class="card-body">

                    <span class="brand-pill">${product.brand}</span>

                    <h3>${product.name}</h3>

                    <div class="price-row">
                        <span class="current-price">${product.price}</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice}</span>` : ""}
                    </div>

                    <div class="card-actions">
                        <button class="btn btn-accent btn-sm flex-fill">
                            <i class="bi bi-bag me-1"></i>Add to Cart
                        </button>
                        <button class="btn btn-outline-dark btn-sm remove-btn" data-id="${product.id}">Remove</button>
                    </div>

                </div>

            </article>
        </div>
    `
        )
        .join("");

    // Remove via the heart icon on saved cards
    grid.querySelectorAll(".wishlist-icon").forEach((btn) => {
        btn.addEventListener("click", () => {
            removeFromWishlist(btn.dataset.id);
            showToast("Removed from wishlist.");
            renderWishlistPage();
        });
    });

    // Remove via the explicit Remove button
    grid.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            removeFromWishlist(btn.dataset.id);
            showToast("Removed from wishlist.");
            renderWishlistPage();
        });
    });

    // Re-attach Add to Cart for the freshly rendered cards
    initAddToCartButtons(grid);
}

/* ============================================================
   PART 3 — Add to Cart (fixes the missing-listener bug)
   Covers BOTH #wishlistGrid (rebuilt by JS) and #relatedGrid
   (static HTML that never gets touched otherwise). stopPropagation
   is critical here — it blocks home.js's global click handler
   from also firing and showing its own "Redirecting..." alert.
   ============================================================ */

function initAddToCartButtons(scope) {
    const root = scope || document;
    root.querySelectorAll(".card-actions .btn-accent").forEach((btn) => {
        // Avoid double-binding the same button twice
        if (btn.dataset.cartBound) return;
        btn.dataset.cartBound = "true";

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const name = btn.closest(".product-card").querySelector("h3").textContent.trim();
            const catalogProduct = (window.FASHION_PRODUCTS || []).find((item) => item.name === name);
            if (catalogProduct) {
                const cart = JSON.parse(localStorage.getItem("fashionCart") || "[]");
                const existing = cart.find((item) => Number(item.id) === catalogProduct.id);
                if (existing) existing.quantity = (Number(existing.quantity) || 1) + 1;
                else cart.push({ id: catalogProduct.id, quantity: 1 });
                localStorage.setItem("fashionCart", JSON.stringify(cart));
            }
            showToast(`Added ${name} to cart.`);
        });
    });
}

/* ---------- Clear all ---------- */

function initClearAllButton() {
    const clearBtn = document.getElementById("clearWishlistBtn");
    if (!clearBtn) return;
    clearBtn.addEventListener("click", () => {
        saveWishlist([]);
        showToast("Wishlist cleared.");
        renderWishlistPage();
    });
}

/* ---------- Share button (placeholder) ---------- */

function initShareButton() {
    const shareBtn = document.getElementById("shareWishlistBtn");
    if (!shareBtn) return;
    shareBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showToast("Wishlist link copied.");
    });
}

/* ---------- Back to top ---------- */

function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        btn.classList.toggle("show", window.scrollY > 500);
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ---------- Run on page load ---------- */

document.addEventListener("DOMContentLoaded", () => {
    initStaticWishlistButtons();        // does nothing on pages with no .wishlist buttons
    renderWishlistPage();               // does nothing unless #wishlistGrid exists
    initAddToCartButtons(document);     // covers static #relatedGrid too
    initClearAllButton();
    initShareButton();
    initBackToTop();
    updateWishlistCountBadge();
});
