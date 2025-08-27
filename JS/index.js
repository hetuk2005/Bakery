const apiProducts = `http://localhost:3000/products`;
const apiCart = `http://localhost:3000/cart`;

const token = sessionStorage.getItem("token");
let path = window.location.pathname;
console.log("🚀 ~ path:", path);

const container = document.querySelector("#container");

let allProducts;
let cartLengths;

setTimeout(() => {
  let cartDisplay = document.querySelector(".cartDisplay");

  if (path == `../index.html` || path == `../index.html`) {
    cartDisplay.style.display = "block";
    cartDisplay.style.opacity = 1;
  }
}, 100);

// Show skeleton placeholders
const showSkeleton = (count = 6) => {
  container.innerHTML = ""; // clear container
  for (let i = 0; i < count; i++) {
    const skeletonCard = document.createElement("div");
    skeletonCard.classList.add("card_div");
    skeletonCard.innerHTML = `
            <div class="skeleton skeleton-image"></div>
            <div class="info">
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text long"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text long"></div>
            </div>
        `;
    container.appendChild(skeletonCard);
  }
};

const renderTheUI = (value) => {
  container.innerHTML = ""; // Remove skeletons
  value.forEach((el) => {
    const card = document.createElement("div");
    card.classList.add("card_div");

    card.innerHTML = ` 
            <div class="img-wrapper">
        <div class="skeleton skeleton-image"></div>
        <img class="image blur" src="${el.image}" loading="lazy" alt="product" />
      </div>
            <div class="info">
                <h3 class="id">id : ${el.id}</h3>
                <p class="category">category : ${el.category}</p>
                <p class="price">price : ${el.price}</p>
                <div class="rating">
                    <p>rate : ${el.rating.rate}</p>
                    </div>
                    <button onclick="addToCart(${el.id})" class="btns">add</button>
            </div>
        `;

    const img = card.querySelector("img");

    if (img.complete) {
      img.classList.add("loaded");
      const skeleton = card.querySelector(".skeleton-image");
      skeleton.style.opacity = 0;
      setTimeout(() => skeleton.remove(), 400);
    } else {
      img.addEventListener("load", () => {
        img.classList.add("loaded");
        const skeleton = card.querySelector(".skeleton-image");
        skeleton.style.opacity = 0;
        setTimeout(() => skeleton.remove(), 400);
      });
    }

    container.appendChild(card);
  });
};

const addToCart = async (id) => {
  let product = allProducts.find((el) => el.id === id);

  try {
    // check if product already exists in cart
    let res = await fetch(`${apiCart}?id=${id}`);
    let data = await res.json();

    if (data.length > 0) {
      // already in cart → increment count
      let existing = data[0];
      await fetch(`${apiCart}/${existing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count: existing.count + 1 }),
      });
      alert("Quantity updated ✔");
    } else {
      // not in cart → add new with count = 1
      await fetch(apiCart, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...product, count: 1 }),
      });

      alert("Added to cart ✔");
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const searchFunc = async () => {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  if (!query) return;

  try {
    let [searchFetch] = await Promise.all([fetch(apiProducts)]);

    const [data1] = await Promise.all([searchFetch.json()]);

    const filtered = await data1.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
    renderTheUI(filtered);
    document.querySelector("#search").value = "";
  } catch (err) {
    console.error("Search failed:", err);
  }
};

let pages = 1;
let pageLimits = 10;

const pagiDiv = document.querySelector("#pagination");

pagiDiv.innerHTML = `
<button class="btns" id="decrementBtn">-</button>
<span id="countPage">${pages}</span>
<button class="btns" id="incrementBtn">+</button>
`;

const paginationFetch = async (limit, page) => {
  let paginationApi = `http://localhost:3000/products?_limit=${limit}&_page=${page}`;

  showSkeleton(6); // Show skeletons while loading
  let cartDisplay = document.querySelector(".cartDisplay");

  try {
    const [res1, res2] = await Promise.all([
      fetch(paginationApi),
      fetch(apiCart),
    ]);
    // we have to apply loader into this....
    console.log("🚀 ~ res1:", res1.ok);
    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
    let data = await data1;
    cartLengths = data2.length;
    if (cartLengths) {
      cartDisplay.style.display = "block";
      cartDisplay.textContent = `${cartLengths}`;
    } else {
      cartDisplay.style.display = "none";
      cartDisplay.style.opacity = 0;
    }

    allProducts = data;
    renderTheUI(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

const countPages = document.querySelector("#countPage");
document.querySelector("#incrementBtn").addEventListener("click", () => {
  pages++;
  countPages.innerText = pages;
  paginationFetch(pageLimits, pages);
});
document.querySelector("#decrementBtn").addEventListener("click", () => {
  pages--;
  countPages.innerText = pages;
  paginationFetch(pageLimits, pages);
});

let allProductsGlobal = [];

const fetchAllProducts = async () => {
  try {
    const res = await fetch(apiProducts);
    allProductsGlobal = await res.json();
  } catch (err) {
    console.error("Error fetching all products:", err);
  }
};

import { sortHigh, sortLow } from "./import_export.js";

document.addEventListener("DOMContentLoaded", () => {
  const highBtn = document.querySelector("#filterHigh");
  const lowBtn = document.querySelector("#filterLow");

  function filterHigh(arr) {
    return [...arr].sort((a, b) => b.price - a.price);
  }

  function filterLow(arr) {
    return [...arr].sort((a, b) => a.price - b.price);
  }

  if (highBtn) {
    highBtn.addEventListener("click", () => {
      let filtered = filterHigh(allProductsGlobal);
      renderTheUI(filtered);

      // show span with close
      activeFilter.innerHTML = `<span class="high">High to Low <span style="cursor:pointer;" id="closeFilter">✕</span></span>`;

      // add close event
      document.querySelector("#closeFilter").addEventListener("click", () => {
        activeFilter.innerHTML = "";
        renderTheUI(allProducts); // reset to normal products
      });
    });
  }

  if (lowBtn) {
    lowBtn.addEventListener("click", () => {
      let filtered = filterLow(allProductsGlobal);
      renderTheUI(filtered);

      // show span with close
      activeFilter.innerHTML = `<span class="high">Low to High <span style="cursor:pointer;" id="closeFilter">✕</span></span>`;

      // add close event
      document.querySelector("#closeFilter").addEventListener("click", () => {
        activeFilter.innerHTML = "";
        renderTheUI(allProducts); // reset to normal products
      });
    });
  }
});

const filterFunc = async () => {
  let filter = document.querySelector("#filter").value;
  // e.g. "electronics", "jewelery", etc.

  try {
    let res = await fetch(apiProducts);
    let data = await res.json();

    // filter products by category
    let filterArr = data.filter((el) => el.category === filter);

    console.log("FilterArr: ", filterArr); // now works

    renderTheUI(filterArr); // no need for await unless it's async
  } catch (error) {
    console.log("Error: ", error);
  }
};

window.filterFunc = filterFunc;

document.addEventListener("DOMContentLoaded", async () => {
  paginationFetch(pageLimits, pages);
  fetchAllProducts();

  try {
    let res = await fetch(apiProducts);
    let data = await res.json();
    let categories = [...new Set(data.map((el) => el.category))];

    let filterSelect = document.querySelector("#filter");
    filterSelect.innerHTML = `<option value="" class="filterOption">   Select Category   </option>`;
    categories.forEach((cat) => {
      let opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      filterSelect.appendChild(opt);
    });
  } catch (error) {
    console.log("Error populating categories:", error);
  }
});
