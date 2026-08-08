const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});

const sideItems = document.querySelectorAll(".side-item");
const cards = document.querySelectorAll(".card");
sideItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    sideItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
    cards.forEach((card, cardIndex) => {
      card.style.display = cardIndex === index ? "block" : "none";
    });
  });
});

// order page form
const customerNameInput = document.getElementById("customerName");
const phoneInput = document.getElementById("phone");

const placeOrderBtn = document.getElementById("placeOrderBtn");
placeOrderBtn.addEventListener("click", () => {
  const customerName = customerNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = document.getElementById("address").value.trim();

  if (customerName == "" || phone == "" || address == "") {
    alert("please fill all the details");
  } else if (phone.length !== 10 || isNaN(phone)) {
    alert("please enter valid 10 digit phone number");
  } else {
    placeOrderBtn.textContent="✓  Order placed"
  }
});

const checkoutProducts = [
  {
    id: 1,
    name: "Premium Hoodie",
    size: "M",
    color: "Off White",
    price: 1999,
    quantity: 1,
  },
];
const checkoutProductGrid = document.querySelector("#checkoutGrid");

function renderProducts() {
  checkoutProductGrid.innerHTML = "";
  checkoutProducts.map((product, index) => {
    checkoutProductGrid.innerHTML += `
        <div class="product-card">
                  <div class="product-thumb">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8a8577"
                      stroke-width="1.5"
                    >
                      <path d="M8 3 4 6v3l3-1v11h10V8l3 1V6l-4-3-3 2-3-2Z" />
                    </svg>
                  </div>
                  <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-meta">
                      Size: ${product.size} &nbsp;•&nbsp; Color: ${product.color}
                    </p>
                    <p class="product-price" data-price="${product.price}">₹${product.price}</p>
                  </div>
                  <div class="qty-control">
                    <button
                      type="button"
                      class="qtyMinus"
                      data-index="${index}"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span class="qty-value" data-index="${index}">${product.quantity}</span>
                    <button
                      type="button"
                      class="qtyPlus"
                      data-index="${index}"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    class="delete-btn"
                    data-index="${index}"
                    aria-label="Remove product"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
    `;
  });
  attachEventListeners();
  updateTotalPrice();
}

function attachEventListeners() {
  // Plus button
  document.querySelectorAll(".qtyPlus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      checkoutProducts[index].quantity++;
      renderProducts();
    });
  });

  // Minus button
  document.querySelectorAll(".qtyMinus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      if (checkoutProducts[index].quantity > 1) {
        checkoutProducts[index].quantity--;
        renderProducts();
      }
    });
  });

  // Delete button
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      checkoutProducts.splice(index, 1);
      renderProducts();
    });
  });
}

function updateTotalPrice() {
  let subTotal = 0;

  checkoutProducts.forEach((product) => {
    subTotal += product.price * product.quantity;
  });

  // Tax calculation (18%)
  let tax = Math.round(subTotal * 0.18);

  // Shipping calculation
  let shipping = subTotal > 2000 ? 0 : 100;

  // Grand total
  let grandTotal = subTotal + tax + shipping;

  // Update DOM
  document.getElementById("total").textContent = subTotal;
  document.getElementById("tax").textContent = tax;
  document.getElementById("shipping").textContent = shipping;

  if (document.getElementById("grandTotal")) {
    document.getElementById("grandTotal").textContent = grandTotal;
  }
}

// Initial render
renderProducts();

const searchInput = document.querySelector(".search-box input");
const rows = document.querySelectorAll(".manage-table tbody tr");

searchInput.addEventListener("keyup", () => {
  const value = searchInput.value.toLowerCase();
  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
});
const filter = document.querySelector(".manage-toolbar select");

filter.addEventListener("change", () => {
  const selected = filter.value.toLowerCase();
  rows.forEach((row) => {
    const status = row.querySelector(".status").innerText.toLowerCase();
    if (selected === "all status") {
      row.style.display = "";
    } else {
      row.style.display = status === selected ? "" : "none";
    }
  });
});

const updateButtons = document.querySelectorAll(".action-btn");

updateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest("tr");

    const select = row.querySelector(".status-select");

    const badge = row.querySelector(".status");

    badge.innerText = select.value;

    badge.className = "status";

    badge.classList.add(select.value.toLowerCase());

    alert("Order status updated.");
  });
});