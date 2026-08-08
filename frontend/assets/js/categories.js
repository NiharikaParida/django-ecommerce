document.addEventListener("DOMContentLoaded", () => {
    const products = Array.from(document.querySelectorAll(".product-card"));
    const filters = Array.from(document.querySelectorAll(".filter-group input[type='checkbox']"));
    const sortDropdown = document.querySelector(".sort-dropdown");

    const getGroup = (filter) => filter.closest(".filter-group")?.querySelector("h3")?.textContent.toLowerCase() || "";
    const selected = (groupName) => filters
        .filter((filter) => filter.checked && getGroup(filter).includes(groupName))
        .map((filter) => filter.id.replace(/^size-|^color-/, ""));

    function filterProducts() {
        const categories = selected("categorie");
        const brands = selected("brand");
        const sizes = selected("size");
        const colors = selected("color");
        let visibleCount = 0;

        products.forEach((product) => {
            // Older category cards do not include every optional data attribute.
            // In that case, only apply the filter when the card has that value.
            const matches = (values, attribute) => values.length === 0 || !product.dataset[attribute] || values.includes(product.dataset[attribute]);
            const visible = (categories.length === 0 || categories.includes(product.dataset.category))
                && matches(brands, "brand")
                && matches(sizes, "size")
                && matches(colors, "color");
            product.style.display = visible ? "flex" : "none";
            if (visible) visibleCount += 1;
        });

        const countText = document.querySelector(".page-header span");
        if (countText) countText.textContent = `- ${visibleCount} items`;
    }

    filters.forEach((filter) => filter.addEventListener("change", filterProducts));

    if (sortDropdown) {
        sortDropdown.addEventListener("change", () => {
            const grid = document.querySelector(".product-grid");
            if (!grid) return;
            const cards = Array.from(grid.querySelectorAll(".product-card"));
            const value = sortDropdown.value.toLowerCase();
            if (value.includes("low")) cards.sort((a, b) => getPrice(a) - getPrice(b));
            if (value.includes("high")) cards.sort((a, b) => getPrice(b) - getPrice(a));
            cards.forEach((card) => grid.appendChild(card));
        });
    }

    function getPrice(product) {
        return Number((product.querySelector(".price strong")?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
    }

    filterProducts();
});
