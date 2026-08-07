document.addEventListener("DOMContentLoaded", () => {


    const products = document.querySelectorAll(".product-card");
    const filters = document.querySelectorAll(
        ".filter-group input[type='checkbox']"
    );

    const sortDropdown = document.querySelector(".sort-dropdown");



    function filterProducts() {


        let selectedCategories = [];
        let selectedBrands = [];
        let selectedSizes = [];
        let selectedColors = [];



        filters.forEach(filter => {


            if (filter.checked) {


                let value = filter.id;


                let group = filter.closest(".filter-group")
                    .querySelector("h3")
                    .innerText
                    .toLowerCase();



                if (group.includes("categorie")) {

                    selectedCategories.push(value);

                }


                else if (group.includes("brand")) {

                    selectedBrands.push(value);

                }


                else if (group.includes("size")) {

                    selectedSizes.push(value);

                }


                else if (group.includes("color")) {

                    selectedColors.push(value);

                }


            }


        });




        let visibleCount = 0;



        products.forEach(product => {



            let category = product.dataset.category;
            let brand = product.dataset.brand;
            let size = product.dataset.size;
            let color = product.dataset.color;



            let categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.includes(category);



            let brandMatch =
                selectedBrands.length === 0 ||
                selectedBrands.includes(brand);



            let sizeMatch =
                selectedSizes.length === 0 ||
                selectedSizes.includes(size);



            let colorMatch =
                selectedColors.length === 0 ||
                selectedColors.includes(color);





            if (
                categoryMatch &&
                brandMatch &&
                sizeMatch &&
                colorMatch
            ) {

                product.style.display = "flex";
                visibleCount++;

            }

            else {

                product.style.display = "none";

            }



        });



        updateProductCount(visibleCount);


    }







    // Add filter event

    filters.forEach(filter => {

        filter.addEventListener(
            "change",
            filterProducts
        );

    });








    // Sorting Function


    sortDropdown.addEventListener(
        "change",
        () => {


            let grid = document.querySelector(".product-grid");


            let cards = Array.from(
                grid.querySelectorAll(".product-card")
            );



            if(sortDropdown.value.includes("Low")){


                cards.sort((a,b)=>{

                    return getPrice(a)-getPrice(b);

                });


            }


            else if(sortDropdown.value.includes("High")){


                cards.sort((a,b)=>{

                    return getPrice(b)-getPrice(a);

                });


            }





            cards.forEach(card=>{

                grid.appendChild(card);

            });


        }
    );








    function getPrice(product){


        let price =
        product.querySelector(".price strong")
        .innerText
        .replace("Rs.","")
        .replace(",","");



        return Number(price);


    }








    // Product count

    function updateProductCount(count){


        let countText =
        document.querySelector(".page-header span");


        if(countText){

            countText.innerText =
            `- ${count} items`;

        }


    }




});