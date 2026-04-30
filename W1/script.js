const products = [
    {img: "https://via.placeholder.com/80", name: "Headphones", price: 7999, desc: "Noise cancelling"},
    {img: "https://via.placeholder.com/80", name: "Smartwatch", price: 12999, desc: "Fitness tracking"},
    {img: "https://via.placeholder.com/80", name: "Mouse", price: 2499, desc: "Gaming mouse"},
    {img: "https://via.placeholder.com/80", name: "Laptop Stand", price: 1999, desc: "Adjustable"},
    {img: "https://via.placeholder.com/80", name: "Keyboard", price: 3499, desc: "Mechanical"},
    {img: "https://via.placeholder.com/80", name: "Speaker", price: 5999, desc: "Bluetooth"},
    {img: "https://via.placeholder.com/80", name: "Camera", price: 45999, desc: "HD camera"},
    {img: "https://via.placeholder.com/80", name: "Mobile", price: 20999, desc: "Android phone"},
    {img: "https://via.placeholder.com/80", name: "Tablet", price: 15999, desc: "Portable"},
    {img: "https://via.placeholder.com/80", name: "Charger", price: 999, desc: "Fast charging"},
    {img: "https://via.placeholder.com/80", name: "Power Bank", price: 1999, desc: "10000mAh"}
];

let currentPage = 1;
const rowsPerPage = 5;

function displayData() {
    const tableBody = document.querySelector("#productTable tbody");
    tableBody.innerHTML = "";

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;

    let paginatedItems = products.slice(start, end);

    paginatedItems.forEach(p => {
        let row = `
            <tr>
                <td><img src="${p.img}"></td>
                <td>${p.name}</td>
                <td>₹${p.price}</td>
                <td>${p.desc}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function nextPage() {
    if (currentPage * rowsPerPage < products.length) {
        currentPage++;
        displayData();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayData();
    }
}

// Initial Load
displayData();