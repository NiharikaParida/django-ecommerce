(function () {
  "use strict";
  const products = window.FASHION_PRODUCTS || [];
  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  const message = document.getElementById("checkoutMessage");
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("fashionCart") || "[]");
  } catch {
    cart = [];
  }
  const normalizeProduct = (product) => ({
    ...product,
    id: Number(product.id),
    price: Number(product.price) || 0,
    sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
  });
  const localProducts = products.map(normalizeProduct);
  const apiOrigin = "";
  const loadProducts = async () => {
    const byId = new Map(localProducts.map((product) => [product.id, product]));
    const missingIds = [
      ...new Set(
        cart
          .map((entry) => Number(entry.id))
          .filter((id) => Number.isInteger(id) && !byId.has(id)),
      ),
    ];
    if (missingIds.length) {
      try {
        const response = await fetch(`${apiOrigin}/api/products/`, {
          headers: { Accept: "application/json" },
        });
        if (response.ok)
          (await response.json())
            .map(normalizeProduct)
            .forEach((product) => byId.set(product.id, product));
      } catch {
        /* Local cart items remain usable if the API is unavailable. */
      }
    }
    return cart
      .map((entry) => {
        const product = byId.get(Number(entry.id));
        return product
          ? {
              ...product,
              selectedSize: entry.size || product.sizes[0] || "",
              quantity: Math.max(1, Number(entry.quantity) || 1),
            }
          : null;
      })
      .filter(Boolean);
  };
  let currentItems = [];
  let shipping = 0;
  let discount = 0;
  let tax = 0;
  let submitButton;
  let onlinePaymentDetails = null;

  const renderCheckout = (items) => {
    currentItems = items;
    shipping = Number(localStorage.getItem("fashionShipping") || 0);
    const discountRate = Number(
      localStorage.getItem("fashionDiscountRate") || 0,
    );
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    discount = subtotal * discountRate;
    tax = (subtotal - discount) * 0.06;
    const total = subtotal - discount + shipping + tax;
    document.getElementById("checkoutItems").innerHTML = items
      .map(
        (item) =>
          `<div class="checkout-item" data-id="${item.id}" data-size="${item.selectedSize}"><span>${item.name}<small>Size: ${item.selectedSize} · ${item.quantity} × ${money.format(item.price)}</small><span class="checkout-item-actions"><button type="button" data-action="save">Save for Later</button><button type="button" data-action="remove">Remove Item</button></span></span><b>${money.format(item.price * item.quantity)}</b></div>`,
      )
      .join("");
    document.getElementById("checkoutSubtotal").textContent =
      money.format(subtotal);
    document.getElementById("checkoutDiscount").textContent =
      `−${money.format(discount)}`;
    document.getElementById("checkoutShipping").textContent =
      money.format(shipping);
    document.getElementById("checkoutTax").textContent = money.format(tax);
    document.getElementById("checkoutTotal").textContent = money.format(total);
    const form = document.getElementById("checkoutForm");
    submitButton = form.querySelector("button[type=submit]");
    if (!items.length) {
      message.textContent =
        "Your cart is empty. Please add a product before checkout.";
      message.classList.add("show");
      submitButton.disabled = true;
    }
  };

  const updateCheckoutCart = async (itemId, selectedSize, saveForLater) => {
    cart = cart.filter((entry) => !(Number(entry.id) === itemId && (entry.size || "") === (selectedSize || "")));
    localStorage.setItem("fashionCart", JSON.stringify(cart));
    if (saveForLater) {
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem("fashionSavedForLater") || "[]"); } catch { saved = []; }
      if (!saved.includes(itemId)) saved.push(itemId);
      localStorage.setItem("fashionSavedForLater", JSON.stringify(saved));
    }
    renderCheckout(await loadProducts());
  };

  document.getElementById("checkoutItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    const item = button?.closest(".checkout-item");
    if (!item) return;
    updateCheckoutCart(Number(item.dataset.id), item.dataset.size, button.dataset.action === "save");
  });

  loadProducts().then((items) => {
    renderCheckout(items);
    const form = document.getElementById("checkoutForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentItems.length) return;
      const paymentMethod = form.elements.namedItem("payment")?.value || "cod";
      const fieldValue = (name) => String(form.elements.namedItem(name)?.value || "").trim();
      const customer = {
        name: fieldValue("name"),
        email: fieldValue("email"),
        phone: fieldValue("phone"),
        address: fieldValue("address"),
        city: fieldValue("city"),
        state: fieldValue("state"),
        postal_code: fieldValue("postal_code"),
      };
      const normalizedPhone = customer.phone.replace(/\D/g, "");
      if (
        !customer.name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
        !/^\+?\d{10,15}$/.test(normalizedPhone) ||
        !customer.address.trim() ||
        !customer.city.trim() ||
        !customer.state.trim() ||
        !/^[A-Za-z0-9-]{4,10}$/.test(customer.postal_code)
      ) {
        message.textContent =
          "Please enter valid name, email, phone, address, city, state, and PIN/ZIP code.";
        message.classList.add("show");
        return;
      }
      submitButton.disabled = true;
      submitButton.textContent = "Placing Order...";
      try {
        if (paymentMethod === "online" && !onlinePaymentDetails) {
          const csrfResponse = await fetch("/api/payments/csrf/", { credentials: "same-origin" });
          const csrfData = await csrfResponse.json();
          const paymentOrderResponse = await fetch("/api/payments/razorpay/order/", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRFToken": csrfData.csrf_token }, body: JSON.stringify({ amount: total }) });
          const paymentOrder = await paymentOrderResponse.json();
          if (!paymentOrderResponse.ok) throw new Error(paymentOrder.detail || "Online payment is unavailable.");
          if (!window.Razorpay) throw new Error("Online payment checkout could not be loaded.");
          submitButton.disabled = false;
          new window.Razorpay({ key: paymentOrder.key_id || "", amount: paymentOrder.amount, currency: paymentOrder.currency || "INR", order_id: paymentOrder.id, name: "Fashion Store", handler: (response) => { onlinePaymentDetails = response; form.requestSubmit(); }, modal: { ondismiss: () => { submitButton.disabled = false; submitButton.textContent = "Place Order"; } } }).open();
          return;
        }
        const response = await fetch(`${apiOrigin}/api/orders/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            customer,
            items: currentItems.map((item) => ({
              product_id: item.id,
              quantity: item.quantity,
              size: item.selectedSize,
            })),
            discount,
            shipping,
            tax,
            payment_method: paymentMethod,
            ...(paymentMethod === "online" ? onlinePaymentDetails : {}),
          }),
        });
        const order = await response.json();
        if (!response.ok)
          throw new Error(order.detail || "Unable to place order.");
        localStorage.setItem("fashionLastOrder", JSON.stringify(order));
        localStorage.removeItem("fashionCart");
        localStorage.removeItem("fashionShipping");
        localStorage.removeItem("fashionDiscountRate");
        window.location.href = "order-success.html?placed=1";
      } catch (error) {
        message.textContent =
          error.message || "Unable to place order. Please try again.";
        message.classList.add("show");
        submitButton.disabled = false;
        submitButton.textContent = "Place Order";
      }
    });
  });
})();
