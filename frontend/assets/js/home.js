const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:0.2
});

cards.forEach(card => {
    observer.observe(card);
});
const buttons = document.querySelectorAll(".btn");

buttons.forEach(button => {

    button.addEventListener("click", function(e){

        e.preventDefault();

        alert("Redirecting to Shop Page...");

        // Later you can use:
        // window.location.href = "shop.html";

    });

});

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transition = "0.4s";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transition = "0.4s";

    });

});
// ===============================
// Mobile Menu
// ===============================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {

    if(navLinks.style.display === "flex"){

        navLinks.style.display = "none";

    }else{

        navLinks.style.display = "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.position = "absolute";
        navLinks.style.top = "80px";
        navLinks.style.left = "0";
        navLinks.style.width = "100%";
        navLinks.style.background = "#fff";
        navLinks.style.padding = "20px";
    }

});
// ================= HERO SLIDER =================

const slides = document.querySelectorAll(".slide");

const next = document.querySelector(".next");

const prev = document.querySelector(".prev");

let index = 0;

function showSlide(i){

    slides.forEach(slide=>slide.classList.remove("active"));

    slides[i].classList.add("active");

}

// Next

next.addEventListener("click",()=>{

    index++;

    if(index>=slides.length){

        index=0;

    }

    showSlide(index);

});

// Previous

prev.addEventListener("click",()=>{

    index--;

    if(index<0){

        index=slides.length-1;

    }

    showSlide(index);

});

// Auto Slider

setInterval(()=>{

    index++;

    if(index>=slides.length){

        index=0;

    }

    showSlide(index);

},5000);

// ==========================================
// SUMMER SALE COUNTDOWN TIMER
// ==========================================

const endDate = new Date();
endDate.setDate(endDate.getDate() + 30);

function updateCountdown() {

    const now = new Date().getTime();
    const distance = endDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dayEl = document.getElementById("days");
    const hourEl = document.getElementById("hours");
    const minuteEl = document.getElementById("minutes");
    const secondEl = document.getElementById("seconds");

    if(dayEl && hourEl && minuteEl && secondEl){

        dayEl.textContent = days;
        hourEl.textContent = hours;
        minuteEl.textContent = minutes;
        secondEl.textContent = seconds;

    }

}

updateCountdown();

setInterval(updateCountdown,1000);

