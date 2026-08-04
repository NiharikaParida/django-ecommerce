(function () {
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const state = {
    quantity: 1,
    size: "M",
    color: "Midnight Black",
    wishlist: false,
  };

  const mainImage = document.getElementById("mainProductImage");
  const selectedColorText = document.getElementById("selectedColorText");
  const selectedSizeText = document.getElementById("selectedSizeText");
  const quantityInput = document.getElementById("quantityInput");
  const selectionSummary = document.getElementById("selectionSummary");
  const wishlistBtn = document.getElementById("wishlistBtn");
  const toastMessage = document.getElementById("toastMessage");
  const toastText = document.getElementById("toastText");
  const deliveryForm = document.getElementById("deliveryForm");
  const pincodeInput = document.getElementById("pincodeInput");
  const deliveryStatus = document.getElementById("deliveryStatus");
  const bundleTotal = document.getElementById("bundleTotal");
  const bundleSavings = document.getElementById("bundleSavings");
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterEmail = document.getElementById("newsletterEmail");

  function updateSummary() {
    selectedColorText.textContent = state.color;
    selectedSizeText.textContent = state.size;
    quantityInput.value = String(state.quantity);
    selectionSummary.textContent = `Selected: ${state.color} | Size ${state.size} | Qty ${state.quantity}`;
  }

  function showToast(message) {
    toastText.textContent = message;
    toastMessage.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toastMessage.classList.remove("show");
    }, 2600);
  }

  function setActiveButton(buttons, activeButton, activeClass = "active") {
    buttons.forEach((button) => {
      const isActive = button === activeButton;
      button.classList.toggle(activeClass, isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function updateWishlistButton() {
    wishlistBtn.classList.toggle("wishlist-active", state.wishlist);
    wishlistBtn.setAttribute("aria-pressed", state.wishlist ? "true" : "false");
    wishlistBtn.innerHTML = state.wishlist
      ? '<span class="wishlist-heart">&#9829;</span><span>Saved to Wishlist</span>'
      : '<span class="wishlist-heart">&#9825;</span><span>Add to Wishlist</span>';
  }

  function updateBundleTotal() {
    const checkedItems = Array.from(document.querySelectorAll("[data-bundle-item]:checked"));
    const total = checkedItems.reduce((sum, item) => sum + Number(item.dataset.price || 0), 0);
    const savingsByCount = {
      0: 0,
      1: 90,
      2: 180,
      3: 300,
    };

    bundleTotal.textContent = currency.format(total);
    bundleSavings.textContent = currency.format(savingsByCount[checkedItems.length] || 0);
  }

  function setMainImage(src, alt) {
    mainImage.src = src;
    mainImage.alt = alt;
  }

  document.querySelectorAll(".thumb-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setMainImage(button.dataset.image, button.dataset.alt);
      setActiveButton(document.querySelectorAll(".thumb-btn"), button);
    });
  });

  document.querySelectorAll(".color-chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.color = button.dataset.color;
      setMainImage(button.dataset.image, `${button.dataset.color} jacket view`);
      setActiveButton(document.querySelectorAll(".color-chip"), button);
      updateSummary();
    });
  });

  document.querySelectorAll(".size-chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.size = button.dataset.size;
      setActiveButton(document.querySelectorAll(".size-chip"), button);
      updateSummary();
    });
  });

  document.getElementById("decreaseQty").addEventListener("click", () => {
    state.quantity = Math.max(1, state.quantity - 1);
    updateSummary();
  });

  document.getElementById("increaseQty").addEventListener("click", () => {
    state.quantity += 1;
    updateSummary();
  });

  wishlistBtn.addEventListener("click", () => {
    state.wishlist = !state.wishlist;
    updateWishlistButton();
    showToast(state.wishlist ? "Added to wishlist." : "Removed from wishlist.");
  });

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    showToast(`Added ${state.quantity} item(s) to cart.`);
  });

  document.getElementById("buyNowBtn").addEventListener("click", () => {
    showToast("Proceeding to secure checkout.");
  });

  document.getElementById("addBundleBtn").addEventListener("click", () => {
    const count = document.querySelectorAll("[data-bundle-item]:checked").length;
    showToast(`Added ${count} bundle item(s) to cart.`);
  });

  deliveryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const pincode = pincodeInput.value.trim();

    if (!/^\d{6}$/.test(pincode)) {
      deliveryStatus.textContent = "Please enter a valid 6-digit pincode.";
      deliveryStatus.className = "delivery-status is-error mt-3";
      return;
    }

    const firstDigit = Number(pincode[0]);
    let estimate = "3-5 business days";

    if (firstDigit <= 2) {
      estimate = "2-4 business days";
    } else if (firstDigit >= 7) {
      estimate = "4-6 business days";
    }

    deliveryStatus.textContent = `Great news: delivery is available to ${pincode}. Expected delivery in ${estimate}.`;
    deliveryStatus.className = "delivery-status is-success mt-3";
  });

  document.querySelectorAll("[data-faq-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item").forEach((faqItem) => {
        faqItem.classList.remove("is-open");
        const faqButton = faqItem.querySelector("[data-faq-toggle]");
        const answer = faqItem.querySelector(".faq-answer");
        faqButton.setAttribute("aria-expanded", "false");
        answer.hidden = true;
      });

      if (!isOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        item.querySelector(".faq-answer").hidden = false;
      }
    });
  });

  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = newsletterEmail.value.trim();

    if (!email || !newsletterEmail.checkValidity()) {
      newsletterEmail.reportValidity();
      return;
    }

    showToast("Subscribed to the Moda Studio newsletter.");
    newsletterEmail.value = "";
  });

  document.querySelectorAll("[data-bundle-item]").forEach((checkbox) => {
    checkbox.addEventListener("change", updateBundleTotal);
  });

  updateSummary();
  updateWishlistButton();
  updateBundleTotal();
})();
