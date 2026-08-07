/* ===============================
   PRODUCT IMAGE GALLERY
================================= */

const mainImage = document.getElementById("mainImage");
const thumbnails = document.querySelectorAll(".thumb");

thumbnails.forEach((thumb) => {

    thumb.addEventListener("click", () => {

        mainImage.src = thumb.src;

        thumbnails.forEach((item) => {
            item.classList.remove("active");
        });

        thumb.classList.add("active");

    });

});


/* ===============================
   QUANTITY
================================= */

const minusBtn = document.getElementById("minus");
const plusBtn = document.getElementById("plus");
const qtyInput = document.getElementById("qty");

let quantity = 1;

plusBtn.addEventListener("click", () => {

    quantity++;

    qtyInput.value = quantity;

});

minusBtn.addEventListener("click", () => {

    if (quantity > 1) {

        quantity--;

        qtyInput.value = quantity;

    }

});


/* ===============================
   SIZE SELECT
================================= */

const sizes = document.querySelectorAll(".size button");

sizes.forEach((btn) => {

    btn.addEventListener("click", () => {

        sizes.forEach((item) => {
            item.classList.remove("active");
        });

        btn.classList.add("active");

    });

});


/* ===============================
   COLOR SELECT
================================= */

const colors = document.querySelectorAll(".color span");

colors.forEach((color) => {

    color.addEventListener("click", () => {

        colors.forEach((item) => {
            item.classList.remove("active");
        });

        color.classList.add("active");

    });

});


/* ===============================
   WISHLIST
================================= */

const wishlist = document.querySelector(".wishlist");

wishlist.addEventListener("click", () => {

    wishlist.classList.toggle("active");

    const icon = wishlist.querySelector("i");

    if (wishlist.classList.contains("active")) {

        icon.classList.remove("fa-regular");

        icon.classList.add("fa-solid");

        icon.style.color = "#D72638";

    } else {

        icon.classList.remove("fa-solid");

        icon.classList.add("fa-regular");

        icon.style.color = "";

    }

});


/* ===============================
   DELIVERY CHECK
================================= */

const checkBtn = document.querySelector(".check-btn");
const pinInput = document.querySelector(".delivery input");

checkBtn.addEventListener("click", () => {

    const pin = pinInput.value.trim();

    if (pin === "") {

        alert("Please enter your pincode.");

    }

    else if (pin.length === 6) {

        alert("Delivery is available to your location.");

    }

    else {

        alert("Please enter a valid 6-digit pincode.");

    }

});


/* ===============================
   ADD TO CART
================================= */

const cartBtn = document.querySelector(".cart-btn");

cartBtn.addEventListener("click", () => {

    alert("Product added to cart!");

});


/* ===============================
   BUY NOW
================================= */

const buyBtn = document.querySelector(".buy-btn");

buyBtn.addEventListener("click", () => {

    alert("Proceeding to checkout...");

});