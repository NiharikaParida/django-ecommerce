// Mobile Menu Toggle
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll(".nav-links a");

// Toggle menu when hamburger is clicked
menuBtn.addEventListener("click", () => {
  nav.classList.toggle("active");
});

// Close menu when a link is clicked
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
  });
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".navbar")) {
    nav.classList.remove("active");
  }
});

const sidebarLinks = document.querySelectorAll(".sidebar_menu a");
const sections = document.querySelectorAll(".user_sidebar_section");

sidebarLinks.forEach((link, index) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Remove active class from all links and sections
    sidebarLinks.forEach((l) => l.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));

    // Add active class to clicked link and corresponding section
    link.classList.add("active");
    sections[index].classList.add("active");
  });
});

// reviews section
const reviews = [
  {
    id: 1,
    name: "Sophia Khan",
    profile: "images/users/user1.jpg",
    verified: true,
    rating: 5,
    date: "12 May 2026",
    product: "Classic Oversized Hoodie",
    review:
      "The fabric quality is amazing and the fit is exactly as shown. Delivery was quick and the packaging felt premium. Definitely buying again!",
    helpful: 24,
  },

  {
    id: 2,
    name: "Arjun Mehta",
    profile: "images/users/user2.jpg",
    verified: true,
    rating: 5,
    date: "08 May 2026",
    product: "Minimal Black T-Shirt",
    review:
      "Super comfortable and perfect for daily wear. The material feels soft and durable, and the fit is exactly what I expected.",
    helpful: 18,
  },

  {
    id: 3,
    name: "Zara Ali",
    profile: "images/users/user3.jpg",
    verified: true,
    rating: 5,
    date: "03 May 2026",
    product: "Wide Leg Denim Jeans",
    review:
      "The denim quality is excellent and the fit is very flattering. Worth every penny and matches the product photos perfectly.",
    helpful: 15,
  },

  {
    id: 4,
    name: "Rohan Das",
    profile: "images/users/user4.jpg",
    verified: true,
    rating: 4,
    date: "28 Apr 2026",
    product: "Checked Flannel Shirt",
    review:
      "Looks even better in person. The color and stitching are impressive. Great choice for casual outings.",
    helpful: 12,
  },

  {
    id: 5,
    name: "Meera Iyer",
    profile: "images/users/user5.jpg",
    verified: true,
    rating: 5,
    date: "24 Apr 2026",
    product: "Beige Trench Coat",
    review:
      "Absolutely in love with this coat! Premium quality, perfect stitching, and it instantly elevates every outfit.",
    helpful: 20,
  },

  {
    id: 6,
    name: "Kabir Singh",
    profile: "images/users/user6.jpg",
    verified: true,
    rating: 4,
    date: "19 Apr 2026",
    product: "White Sneakers",
    review:
      "Stylish, lightweight, and comfortable enough for everyday wear. They pair well with almost every outfit.",
    helpful: 9,
  },

  {
    id: 7,
    name: "Ananya Roy",
    profile: "images/users/user7.jpg",
    verified: true,
    rating: 5,
    date: "15 Apr 2026",
    product: "Slim Fit Blazer",
    review:
      "Excellent craftsmanship and a perfect fit. The blazer looks premium and is ideal for both office and formal events.",
    helpful: 27,
  },

  {
    id: 8,
    name: "Rahul Verma",
    profile: "images/users/user8.jpg",
    verified: false,
    rating: 4,
    date: "10 Apr 2026",
    product: "Cargo Joggers",
    review:
      "Comfortable with plenty of pockets. The material is breathable, though I wish there were more color options.",
    helpful: 11,
  },

  {
    id: 9,
    name: "Priya Sharma",
    profile: "images/users/user9.jpg",
    verified: true,
    rating: 5,
    date: "05 Apr 2026",
    product: "Leather Handbag",
    review:
      "Beautiful finish and spacious enough for daily essentials. It feels luxurious and looks even better in person.",
    helpful: 32,
  },

  {
    id: 10,
    name: "Aman Patel",
    profile: "images/users/user10.jpg",
    verified: true,
    rating: 4,
    date: "01 Apr 2026",
    product: "Sports Performance Jacket",
    review:
      "Very comfortable during workouts. The fabric stretches well and keeps me warm without feeling heavy.",
    helpful: 14,
  },
];
const reviewGrid = document.getElementById("reviewGrid");
reviewGrid.innerHTML = reviews.map((item) => {
  return `<div class="review-card">
                        <div class="review-header">
                            <div class="review-user">
                                <img src="https://i.pinimg.com/736x/34/5c/6d/345c6d52234bbc72407ea25d49ad945e.jpg" alt="User">
                                <div>
                                    <h3>${item.name}</h3>
                                    <span>Verified uyer</span>
                                </div>
                            </div>
                            <div class="review-rating">
                                <div class="stars">
                                    ★★★★★
                                </div>
                                <small>${item.date}</small>
                            </div>
                        </div>
                        <div class="review-product">
                            Purchased:
                            <strong>${item.product}</strong>
                        </div>
                        <p class="review-text">
                            ${item.review}
                        </p>
                        <div class="review-footer">
                            <button>
                                <i class="ri-thumb-up-line"></i>
                                Helpful (${item.helpful})
                            </button>
                            <button>
                                <i class="ri-chat-1-line"></i>
                                Reply
                            </button>
                        </div>
                    </div>  
  `
}).join("");
