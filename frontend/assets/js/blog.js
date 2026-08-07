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


const readButtons = document.querySelectorAll(".blog-content a");


readButtons.forEach(button=>{


    if (button.getAttribute("href") !== "#") return;
    button.addEventListener("click", () => {
        alert("Full article page coming soon!");
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
