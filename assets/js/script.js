/**
 * Toggles the visibility of a menu with a smooth slide effect.
 * @param {string} id - The ID of the menu to toggle.
 */
function toggleMenu(id) {
    var menu = document.getElementById(id);
    var menus = document.querySelectorAll('.menu-items');

    if (!menu) {
        console.error("Menu not found: " + id);
        return;
    }

    menus.forEach(function (otherMenu) {
        if (otherMenu.id !== id) {
            otherMenu.style.maxHeight = null;
        }
    });

    if (menu.style.maxHeight) {
        menu.style.maxHeight = null;
    } else {
        menu.style.maxHeight = menu.scrollHeight + "px";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let cart = [];  // 🚨 Always start with an empty cart
    let totalPrice = 0;  // 🚨 Reset total price on page load

    localStorage.removeItem("cart");  // ❌ Clear saved cart
    localStorage.removeItem("totalPrice");  // ❌ Clear saved total price

    function saveCartToLocalStorage() {
        localStorage.setItem("cart", JSON.stringify(cart));
        localStorage.setItem("totalPrice", totalPrice.toFixed(2));
    }

    function addToCart(item, price) {
        let existingItem = cart.find(order => order.item === item);
        if (existingItem) {
            existingItem.quantity++;
            existingItem.totalPrice += price;
        } else {
            cart.push({ item, unitPrice: price, totalPrice: price, quantity: 1 });
        }
        totalPrice += price;
        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function updateCartDisplay() {
        let cartList = document.getElementById("cart-list");
        let totalDisplay = document.getElementById("total-price");

        cartList.innerHTML = ""; // Clear previous cart list

        cart.forEach((order, index) => {
            let li = document.createElement("li");

            li.innerHTML = `
                <span class="item-name">${order.item} ${order.quantity > 1 ? `x${order.quantity}` : ""}</span>
                <span class="item-price">${order.totalPrice.toFixed(2)} €</span>
                <div class="cart-controls">
                    <button data-index="${index}" class="decrease-qty small-btn">-</button>
                    <button data-index="${index}" class="increase-qty small-btn">+</button>
                    <button data-index="${index}" class="delete-item small-btn">X</button>
                </div>
            `;

            cartList.appendChild(li);
        });

        totalDisplay.textContent = `Total: ${totalPrice.toFixed(2)} €`;

        saveCartToLocalStorage();
    }

    function increaseQuantity(index) {
        cart[index].quantity++;
        cart[index].totalPrice = cart[index].unitPrice * cart[index].quantity;
        totalPrice += cart[index].unitPrice;
        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function decreaseQuantity(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
            cart[index].totalPrice = cart[index].unitPrice * cart[index].quantity;
            totalPrice -= cart[index].unitPrice;
        } else {
            removeFromCart(index);
            return;
        }
        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function removeFromCart(index) {
        totalPrice -= cart[index].totalPrice;
        cart.splice(index, 1);
        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function showBill() {
        if (cart.length === 0) return alert("Your cart is empty!");
        let billItems = document.getElementById("bill-items");
        let billTotal = document.getElementById("bill-total");
        billItems.innerHTML = "";
        cart.forEach(order => {
            let li = document.createElement("li");
            li.innerHTML = `<span>${order.item} x${order.quantity}</span> <span>${order.totalPrice.toFixed(2)} €</span>`;
            billItems.appendChild(li);
        });
        billTotal.innerHTML = `<strong>Total:</strong> ${totalPrice.toFixed(2)} €`;
        document.getElementById("bill").style.display = "block";
    }

    function printBill() {
        if (cart.length === 0) return alert("Your cart is empty!");

        const { jsPDF } = window.jspdf; // ✅ Load jsPDF correctly
        let doc = new jsPDF(); // ✅ Create a new PDF document

        // 📌 Set title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Your Bill", 80, 20);

        // 📌 Add bill items
        let y = 40; // Set starting position for items
        cart.forEach(order => {
            doc.setFontSize(12);
            doc.text(`${order.item} x${order.quantity} - ${order.totalPrice.toFixed(2)} €`, 20, y);
            y += 10; // Move down for the next item
        });

        // 📌 Add total price
        doc.setFontSize(14);
        doc.text(`Total: ${totalPrice.toFixed(2)} €`, 20, y + 10);

        // 📌 Save and download as "Bill.pdf"
        doc.save("Bill.pdf");
    }


    function closeBill() {
        document.getElementById("bill").style.display = "none";
    }

    function resetOrder() {
        cart = [];
        totalPrice = 0;
        updateCartDisplay();
        saveCartToLocalStorage();
        closeBill();
    }

    document.querySelectorAll(".menu-items tbody tr").forEach(row => {
        row.addEventListener("click", function () {
            let item = this.cells[0]?.textContent.trim();
            let price = parseFloat(this.cells[1]?.textContent.trim().replace("€", ""));
            if (!isNaN(price)) addToCart(item, price);
            else console.error("Invalid price format");
        });
    });

    document.getElementById("cart-list").addEventListener("click", function (event) {
        let index = parseInt(event.target.getAttribute("data-index"));
        if (event.target.classList.contains("delete-item")) removeFromCart(index);
        else if (event.target.classList.contains("increase-qty")) increaseQuantity(index);
        else if (event.target.classList.contains("decrease-qty")) decreaseQuantity(index);
    });

    document.getElementById("send-order").addEventListener("click", showBill);
    document.getElementById("print-bill").addEventListener("click", printBill);
    document.getElementById("close-bill").addEventListener("click", closeBill);
    document.getElementById("reset-order").addEventListener("click", resetOrder);
});
