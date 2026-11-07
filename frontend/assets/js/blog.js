// ================= MOBILE MENU =================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");


if(menuBtn){

    menuBtn.addEventListener("click",()=>{

        navLinks.classList.toggle("show");

    });

}





// ================= NEWSLETTER SUBSCRIBE =================


const subscribeBtn = document.querySelector(".subscribe-box button");


if(subscribeBtn){

    subscribeBtn.addEventListener("click",()=>{


        const email = document.querySelector(".subscribe-box input").value;


        if(email === ""){

            alert("Please enter your email.");

        }

        else if(!email.includes("@")){

            alert("Please enter a valid email.");

        }

        else{

            alert("Thank you for subscribing!");

            document.querySelector(".subscribe-box input").value = "";

        }


    });


}






// ================= BLOG READ MORE =================

const articleContent = [
    {
        title: "How Fashion Trends Are Changing This Season",
        paragraphs: [
            "This season is shaped by relaxed tailoring, expressive colour, and clothing that works across more than one occasion. Lightweight layers, softer silhouettes, and carefully chosen statement pieces are replacing outfits that can only be worn one way.",
            "To make the trend practical, begin with a dependable base such as a cotton shirt, straight-leg trousers, or a simple dress. Add one current detail—an interesting texture, a bright accent, or a sculptural accessory—so the outfit feels fresh without losing your personal style.",
        ],
    },
    {
        title: "Street Style Ideas Every Fashion Lover Should Try",
        paragraphs: [
            "Great street style starts with balance. Pair an oversized shirt or jacket with a cleaner, fitted shape below, or combine relaxed trousers with a neat top. This contrast gives a casual look structure and makes it easy to adapt throughout the day.",
            "Comfort is part of the look, not an afterthought. Choose breathable fabrics, practical footwear, and a small number of accessories that add character. A coordinated colour palette makes simple pieces look intentional and polished.",
        ],
    },
    {
        title: "Simple Beauty Tips For Everyday Look",
        paragraphs: [
            "An effective everyday routine is usually a consistent one. Cleanse gently, moisturise according to your skin’s needs, and use sunscreen whenever you are outside. These basics support a fresh appearance without requiring a complicated collection of products.",
            "For a quick finish, focus on one feature at a time: groomed brows, a soft lip colour, or a subtle blush. Keeping the rest light lets your natural features remain visible and makes the routine easy to repeat.",
        ],
    },
    {
        title: "Build A Wardrobe That Matches Your Lifestyle",
        paragraphs: [
            "A useful wardrobe reflects the way you actually spend your time. List the situations you dress for most often, then build around versatile pieces that can move between work, weekends, and social occasions.",
            "Start with dependable colours and comfortable fits, then add personality through prints, fabrics, and seasonal layers. Before buying something new, check whether it works with at least three pieces you already own; this keeps the wardrobe useful and reduces impulse purchases.",
        ],
    },
    {
        title: "Fashion Week Highlights 2026",
        paragraphs: [
            "The strongest runway ideas this year focus on craft, movement, and clothes that feel personal. Designers are combining clean lines with tactile fabrics, while earthy neutrals sit beside confident reds, blues, and sunny yellows.",
            "The most wearable way to translate runway inspiration is to borrow a single idea rather than copy a complete look. Try a new proportion, an unexpected colour pairing, or a refined layering technique with the pieces already in your wardrobe.",
        ],
    },
    {
        title: "How To Style One Outfit Differently",
        paragraphs: [
            "One well-fitting outfit can create several looks when the layers and accessories change. Wear a dress alone for a clean daytime style, add a shirt or knit over it for a different silhouette, and use a tailored jacket when the occasion calls for more structure.",
            "Shoes and small accessories can shift the mood quickly. Sneakers make the outfit relaxed, while loafers or heels make it more polished. Keep the base simple and let one change at a time define the new look.",
        ],
    },
];

const showArticle = (button, article) => {
    const content = button.closest(".blog-content");
    if (!content) return;
    let detail = content.querySelector(".blog-article-detail");
    if (!detail) {
        detail = document.createElement("div");
        detail.className = "blog-article-detail";
        detail.hidden = true;
        content.appendChild(detail);
    }
    if (detail.hidden) {
        detail.innerHTML = `<h4>${article.title}</h4>${article.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}`;
        detail.hidden = false;
        button.textContent = "Hide Article";
        detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
        detail.hidden = true;
        button.textContent = "Read More";
    }
};

document.querySelectorAll(".blog-content a").forEach((button, index) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        showArticle(button, articleContent[index]);
    });
});






// ================= IMAGE HOVER EFFECT =================


const images = document.querySelectorAll(
".instagram-grid img, .category-box img"
);


images.forEach(image=>{


    image.addEventListener("mouseenter",()=>{

        image.style.transform="scale(1.05)";
        image.style.transition="0.4s";

    });



    image.addEventListener("mouseleave",()=>{

        image.style.transform="scale(1)";

    });


});
