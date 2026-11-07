const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("show-menu");

    });

}

const cards = document.querySelectorAll(".category-card");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold: 0.2

});

cards.forEach(card => {

    observer.observe(card);

});

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-10px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});

const searchInput = document.querySelector(".search-box input");

const searchBtn = document.querySelector(".search-box button");

const searchResultsSection = document.getElementById("searchResultsSection");

const searchResultsGrid = document.getElementById("searchResultsGrid");

const searchResultsTitle = document.getElementById("searchResultsTitle");

const searchResultsMessage = document.getElementById("searchResultsMessage");

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
});

const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#39;"
}[character]));

function renderSearchResults(products, keyword) {
    if (!searchResultsSection || !searchResultsGrid || !searchResultsMessage || !searchResultsTitle) return;

    searchResultsSection.hidden = false;
    searchResultsTitle.textContent = `Search results for “${keyword}”`;

    if (!products.length) {
        searchResultsMessage.textContent = "No products found";
        searchResultsGrid.innerHTML = "";
        return;
    }

    searchResultsMessage.textContent = `${products.length} product${products.length === 1 ? "" : "s"} found`;
    searchResultsGrid.innerHTML = products.map((product) => {
        const image = product.images?.[0] || "";
        const oldPrice = Number(product.old_price) > Number(product.price)
            ? `<del>${money.format(product.old_price)}</del><span>(${escapeHtml(product.discount)}% OFF)</span>`
            : "";
        return `<div class="col-lg-3 col-md-6">
            <a class="product-card d-block" href="product-details.html?id=${encodeURIComponent(product.id)}" data-product-id="${escapeHtml(product.id)}">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}">
                <div class="rating">${escapeHtml(product.rating)} ★</div>
                <h4>${escapeHtml(product.brand)}</h4>
                <p>${escapeHtml(product.name)}</p>
                <div class="price"><strong>${money.format(product.price)}</strong>${oldPrice}</div>
            </a>
        </div>`;
    }).join("");
}

async function searchProducts() {
    const keyword = searchInput?.value.trim() || "";
    if (!keyword) {
        if (searchResultsSection) searchResultsSection.hidden = true;
        if (searchResultsGrid) searchResultsGrid.innerHTML = "";
        return;
    }

    if (searchResultsSection) searchResultsSection.hidden = false;
    if (searchResultsMessage) searchResultsMessage.textContent = "Searching…";
    if (searchResultsGrid) searchResultsGrid.innerHTML = "";

    try {
        const response = await fetch(`/api/products/?search=${encodeURIComponent(keyword)}`, {
            headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Search request failed");
        renderSearchResults(await response.json(), keyword);
    } catch (error) {
        if (searchResultsSection) searchResultsSection.hidden = false;
        if (searchResultsMessage) searchResultsMessage.textContent = "Unable to load products. Please try again.";
        if (searchResultsGrid) searchResultsGrid.innerHTML = "";
    }
}

if (searchBtn) {

    searchBtn.addEventListener("click", searchProducts);

}

if (searchInput) {

    searchInput.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            searchProducts();

        }

    });

}

const newsletterForm = document.querySelector(".newsletter-form");

if (newsletterForm) {

    newsletterForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = this.querySelector("input").value.trim();

        if (email === "") {

            alert("Please enter your email.");

            return;

        }

        alert("Thank you for subscribing!");

        this.reset();

    });

}

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        navItems.forEach(link => {

            link.classList.remove("active");

        });

        item.classList.add("active");

    });

});

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 80) {

        navbar.style.padding = "12px 8%";

        navbar.style.boxShadow = "0 10px 25px rgba(0,0,0,.1)";

    }

    else {

        navbar.style.padding = "18px 8%";

        navbar.style.boxShadow = "0 5px 20px rgba(0,0,0,.05)";

    }

});

const revealElements = document.querySelectorAll(".category-card,.featured-banner,.newsletter");

function reveal() {

    revealElements.forEach(element => {

        const windowHeight = window.innerHeight;

        const revealTop = element.getBoundingClientRect().top;

        const revealPoint = 120;

        if (revealTop < windowHeight - revealPoint) {

            element.classList.add("show");

        }

    });

}

window.addEventListener("scroll", reveal);

reveal();

const exploreButtons = document.querySelectorAll(".category-card .btn");

exploreButtons.forEach(button => {

    button.addEventListener("click", function () {

        window.location.href = button.getAttribute("href") || "product.html";

    });

});

const socialIcons = document.querySelectorAll(".social-icons a");

socialIcons.forEach(icon => {

    icon.addEventListener("mouseenter", () => {

        icon.style.transform = "translateY(-6px) rotate(8deg)";

    });

    icon.addEventListener("mouseleave", () => {

        icon.style.transform = "translateY(0) rotate(0deg)";

    });

});

const backToTop = document.createElement("button");

backToTop.innerHTML = "↑";

backToTop.className = "back-to-top";

document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {

        backToTop.classList.add("show");

    }

    else {

        backToTop.classList.remove("show");

    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});
const summerBanner = document.querySelector(".summer-banner");

const bannerObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{

    threshold:0.3

});

if(summerBanner){

    bannerObserver.observe(summerBanner);

}
