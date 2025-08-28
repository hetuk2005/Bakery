const apiCheckout = `http://localhost:3000/cart`;

let subTotal;
let grandTotal;

let pages = 1;
let pageLimits = 5;
let lengthsOfAPI;
let start;
let end;

const token = sessionStorage.getItem("token");

if (!token || token == "null" || token == "undefined") {
  alert("please login first....");
  window.location = "Login.html";
}

const showSkeleton = (count = 6) => {
  container.innerHTML = ""; // clear container

  // Create table skeleton
  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

  const tbody = table.querySelector("tbody");

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td><div class="skeleton skeleton-text long"></div></td>
            <td><div class="skeleton skeleton-text short"></div></td>
            <td><div class="skeleton skeleton-text short"></div></td>
            <td><div class="skeleton skeleton-text short"></div></td>
        `;
    tbody.appendChild(row);
  }
  container.appendChild(table);
};

const paginationFetch = async (limit = pageLimits, page = pages) => {
  const res = await fetch(`${apiCheckout}?_limit=${limit}&_page=${page}`);
  const data = await res.json();

  // Calculate total pages from header
  lengthsOfAPI = Math.ceil(+res.headers.get("x-total-count") / pageLimits);

  renderCheckout(data); // only pass data
};

const checkoutFunc = async () => {
  showSkeleton(6);
  paginationFetch(pageLimits, pages);
};

const renderCheckout = (value) => {
  const container = document.querySelector("#container");
  container.innerHTML = ""; // Remove skeletons
  // Create table

  subTotal = 0; // reset each render
  grandTotal = 0; // reset each render

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

  const tbody = table.querySelector("tbody");

  // Add rows dynamically
  value.forEach((el) => {
    subTotal += el.price * el.quantity;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${el.title}</td>
            <td>₹${el.price}</td>
            <td>
                <button class="btns neg" onclick="decrementCount(${el.id}, ${
      el.quantity
    })">-</button>
                ${el.quantity}
                <button class="btns pos" onclick="incrementCount(${el.id}, ${
      el.quantity
    })">+</button>
            </td>
            <td>₹${el.price * el.quantity}</td>
        `;
    tbody.appendChild(row);
  });

  // Now recalc grandTotal fresh
  let salesTax = 109.0;
  grandTotal = subTotal + salesTax;

  let deliveryDiplay = [
    { id: 1, title: "subtotal", price: subTotal },
    { id: 2, title: "sales tax", price: salesTax },
    { id: 3, title: "grand total", price: grandTotal },
  ];

  const amountDiv_main = document.createElement("section");
  amountDiv_main.classList.add("main_section_amount");

  const amountDiv_parent_1 = document.createElement("div");
  amountDiv_parent_1.classList.add("parent_1_div_amount");

  deliveryDiplay.map((els) => {
    const amountDiv_child_1 = document.createElement("div");
    amountDiv_child_1.classList.add("child_1_div_amount");

    amountDiv_child_1.innerHTML = `       
        <h3>${els.title}</h3>
        <p>₹${els.price}</p>               
        `;
    amountDiv_parent_1.append(amountDiv_child_1);
  });

  const amountDiv_parent_2 = document.createElement("section");

  amountDiv_parent_2.innerHTML = `
        <div class="checkout_second_section_child">
                <h5>congrats you're eligible for <b>free shiping</b> </h5>
                <img src="../utils/delivery.png" alt="delivery" />
            </div>
            <div class="checkout_btn"><button class="btns">Check out</button></div>
    `;
  amountDiv_parent_2.classList.add("section_second_amount");

  amountDiv_main.append(amountDiv_parent_1, amountDiv_parent_2);

  //  here i have to crate this ui -> https://pixso.net/tips/shopping-cart-design/

  const pagiDiv = document.createElement("div");
  pagiDiv.innerHTML = `
  <button class="btns" id="decrementBtn">Prev</button>
<span id="countPage">${pages} of ${lengthsOfAPI}</span>
<button class="btns" id="incrementBtn">Next</button>
  `;

  amountDiv_main.prepend(pagiDiv);

  container.append(table, amountDiv_main);

  const countPages = document.querySelector("#countPage");
  document.querySelector("#incrementBtn").addEventListener("click", () => {
    if (pages >= lengthsOfAPI) {
      document.querySelector("#incrementBtn").disabled = true;
      return;
    } else if (pages > 1) {
      document.querySelector("#decrementBtn").disabled = false;
    }
    pages++;
    countPages.innerText = pages;
    paginationFetch(pageLimits, pages);
  });
  document.querySelector("#decrementBtn").addEventListener("click", () => {
    if (pages <= 1) {
      document.querySelector("#decrementBtn").disabled = true;
      return;
    } else if (pages < lengthsOfAPI) {
      document.querySelector("#incrementBtn").disabled = false;
    }
    pages--;
    countPages.innerText = pages;
    paginationFetch(pageLimits, pages);
  });
};

const incrementCount = async (id, counts) => {
  try {
    await fetch(`${apiCheckout}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity: counts + 1 }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const decrementCount = async (id, counts) => {
  if (counts <= 1) {
    await fetch(`${apiCheckout}/${id}`, {
      method: "DELETE",
      Authorization: `Bearer ${token}`,
    });
    alert(`your items delete id number is ${id}`);
    return;
  }

  try {
    await fetch(`${apiCheckout}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity: counts - 1 }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const deleteToCart = async (id) => {
  try {
    await fetch(`${apiCheckout}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};
