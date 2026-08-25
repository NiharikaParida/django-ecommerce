/* Shared product catalog used by category cards and product-details.js. */
(function () {
  // Keep images tied to the product type so cards and the detail page show
  // relevant photos instead of cycling through one generic image pool.
  const productImages = {
    1: ["pw1.png", "pw1.1.png", "pw1.2.png"], 2: ["pw2.png", "pw2.1.png", "pw2.2.png"],
    3: ["pw3.png", "pw3.1.png", "pw3.2.png"], 4: ["pw4.png", "pw4.1.png", "pw4.2.png"],
    5: ["pw5.png", "pw5.1.png", "pw5.2.png"], 6: ["pw6.png", "pw6.1.png", "pw6.2.png"],
    7: ["pw7.png", "pw7.1.png", "pw7.2.png"], 8: ["pw8.png", "pw8.1.png", "pw8.2.png"],
    57: ["pm1.png", "pm1.1.png", "pm1.2.png"], 58: ["pm2.png", "pm2.1.png", "pm2.2.png"],
    59: ["pm3.png", "pm3.1.png", "pm3.2.png"], 60: ["pm4.png", "pm4.1.png", "pm4.2.png"],
    61: ["pm5.png", "pm5.1.png", "pm5.2.png"], 62: ["pm6.png", "pm6.1.png", "pm6.2.png"],
    63: ["pm7.png", "pm7.1.png", "pm7.2.png"], 64: ["pm8.png", "pm8.1.png", "pm8.2.png"],
    65: ["pm9.png", "pm9.1.png", "pm9.2.png"], 66: ["pm10.png", "pm10.1.png", "pm10.2.png"],
    67: ["pm11.png", "pm11.1.png", "pm11.2.png"], 68: ["pm12.png", "pm12.1.png", "pm12.2.png"],
    69: ["pm13.png", "pm13.1.png", "pm13.2.png"], 70: ["pm14.png", "pm14.1.png", "pm14.2.png"],
    71: ["pm15.png", "pm15.1.png", "pm15.2.png"], 72: ["pm16.png", "pm16.1.png", "pm16.2.png"],
    113: ["whiteshirt1.png", "whiteshirt2.png", "whiteshirt3.png"], 114: ["max1.jpg", "max2.jpg", "max3.jpg"],
    115: ["check1.jpg", "check2.jpg", "check3.jpg"], 116: ["pdd1.png", "pdd1.1.png", "pdd1.2.png"],
    117: ["maxp1.1.png", "maxp1.2.png", "maxp1.3.png"], 118: ["shots1.png", "shots1.1.png", "shots1.2.png"],
    119: ["casual1.png", "casual2.png", "casual.jpg"], 120: ["cott1.png", "cott2.png", "cott3.png"],

  };

  const rows = [
    [1, "Women", "Printed Cotton Kurta", "Biba", 799, 1499, 4.5],
    [2, "Women", "Women Embroidered Kurta", "Libas", 999, 1999, 4.6],
    [3, "Women", "Women Casual Crop Top", "H&M", 599, 999, 4.3],
    [4, "Women", "Women Printed Casual Top", "Roadster", 699, 1299, 4.4],
    [5, "Women", "Women Slim Fit Jeans", "Levi's", 1499, 2999, 4.6],
    [6, "Women", "Women High Rise Jeans", "ONLY", 1299, 2499, 4.5],
    [7, "Women", "Floral Party Wear Dress", "Libas", 1299, 2499, 4.7],
    [8, "Women", "Designer Silk Saree", "W", 1799, 3599, 4.8],
    [57, "Men", "Roadster Graphic T-shirt", "Roadster", 299, 599, 4.1],
    [58, "Men", "Puma Sports T-shirt", "Puma", 899, 1499, 4.5],
    [59, "Men", "HRX Yellow T-shirt", "HRX by Hrithik Roshan", 349, 699, 4.2],
    [60, "Men", "WROGN Slim Fit T-shirt", "WROGN", 650, 1299, 4.0],
    [61, "Men", "Levi's Blue Jeans", "Levi's", 1899, 3299, 4.6],
    [62, "Men", "Wrangler Black Jeans", "Wrangler", 1250, 2499, 4.3],
    [63, "Men", "Spykar Distressed Jeans", "Spykar", 1499, 2999, 4.1],
    [64, "Men", "Roadster Regular Jeans", "Roadster", 899, 1799, 3.9],
    [65, "Men", "Highlander Casual Shirt", "Highlander", 699, 1399, 4.4],
    [66, "Men", "Arrow Formal Shirt", "Arrow", 1299, 2599, 4.7],
    [67, "Men", "U.S. Polo Assn. Shirt", "U.S. Polo Assn.", 1149, 2299, 4.5],
    [68, "Men", "Tommy Hilfiger Shirt", "Tommy Hilfiger", 2499, 4999, 4.8],
    [69, "Men", "Nike Running Shoes", "Nike", 2995, 3695, 4.6],
    [70, "Men", "Adidas Sneakers", "Adidas", 2499, 4999, 4.4],
    [71, "Men", "Puma Sports Shoes", "Puma", 1899, 4499, 4.3],
    [72, "Men", "Woodland Leather Shoes", "Woodland", 3199, 3999, 4.5],
    [113, "Kids", "Boys Printed Cotton T-Shirt", "H&M", 499, 899, 4.5],
    [114, "Kids", "Girls Graphic Cotton T-Shirt", "Max", 399, 799, 4.4],
    [115, "Kids", "Boys Casual Checked Shirt", "U.S. Polo Kids", 799, 1499, 4.6],
    [116, "Kids", "Girls Floral Party Dress", "Zara Kids", 999, 1899, 4.7],
    [117, "Kids", "Boys Slim Fit Jeans", "Max", 899, 1699, 4.5],
    [118, "Kids", "Cotton Summer Shorts", "Mothercare", 499, 899, 4.3],
    [119, "Kids", "Kids Casual Sneakers", "H&M", 1199, 2199, 4.6],
    [120, "Kids", "Girls Casual Cotton Dress", "Mothercare", 799, 1499, 4.5],
  ];

  window.FASHION_PRODUCTS = rows.map(([id, category, name, brand, price, oldPrice, rating]) => ({
    id,
    name,
    category,
    brand,
    price,
    oldPrice,
    discount: Math.round((1 - price / oldPrice) * 100),
    rating,
    description: `${name} from the ${category.toLowerCase()} collection, made for comfortable everyday styling with a polished finish.`,
    sizes: category === "Kids" ? ["2-3Y", "4-5Y", "6-7Y", "8-9Y"] : ["S", "M", "L", "XL"],
    images: (productImages[id] || ["p1.jpg", "p2.jpg", "p3.jpg"]).map((image) => `../assets/image/${image}`),
  }));
})();
