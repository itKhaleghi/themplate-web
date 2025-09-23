(function () {
    "use strict";

    const openMenuButton = document.getElementById("show-menu");
    const menuModal = document.getElementById("menu-modal");
    const menuGrid = document.getElementById("menu-items-grid");
    const cartContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const checkoutToggleButton = document.getElementById("checkout-toggle");
    const checkoutForm = document.getElementById("checkout-form");

    if (!openMenuButton || !menuModal || !menuGrid) return;

    const currency = "تومان";

    const menuItems = [
        { id: "espresso", title: "اسپرسو", description: "قهوه غلیظ تک شات", price: 65000, ingredients: ["قهوه عربیکا"], image: "asset/images/coffee.svg" },
        { id: "latte", title: "لاته", description: "قهوه با شیر فوم گرفته", price: 95000, ingredients: ["اسپرسو", "شیر"], image: "asset/images/coffee-cup-with-heart.svg" },
        { id: "cappuccino", title: "کاپوچینو", description: "اسپرسو، شیر و کف", price: 90000, ingredients: ["اسپرسو", "شیر"], image: "asset/images/coffee.svg" },
        { id: "ice-latte", title: "آیس لاته", description: "نوشیدنی سرد قهوه و شیر", price: 105000, ingredients: ["اسپرسو", "شیر", "یخ"], image: "asset/images/coffee.svg" },
        { id: "brownie", title: "براونی شکلاتی", description: "کیک شکلاتی داغ", price: 120000, ingredients: ["شکلات", "گردو"], image: "asset/images/banner-1-1360x605.jpg" },
        { id: "cheese-cake", title: "چیزکیک", description: "کیک پنیری خامه ای", price: 135000, ingredients: ["پنیر خامه ای"], image: "asset/images/banner-2-1-1360x605.jpg" }
    ];

    let cartById = {};

    function formatPrice(amount) {
        try {
            return amount.toLocaleString("fa-IR") + " " + currency;
        } catch (e) {
            return amount + " " + currency;
        }
    }

    function openModal() {
        menuModal.classList.remove("d-none");
        menuModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        menuModal.classList.add("d-none");
        menuModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function renderMenuGrid() {
        const html = menuItems.map(function (item) {
            return (
                '<div class="menu-card">' +
                '  <div class="menu-card__image" style="background-image:url(' + JSON.stringify(item.image) + ');"></div>' +
                '  <div class="menu-card__body">' +
                '    <h4 class="menu-card__title">' + item.title + '</h4>' +
                '    <p class="menu-card__desc">' + item.description + '</p>' +
                '    <div class="menu-card__ingredients">' + item.ingredients.map(function (i) { return '<span class="chip">' + i + '</span>'; }).join("") + '</div>' +
                '    <div class="menu-card__footer">' +
                '      <span class="menu-card__price">' + formatPrice(item.price) + '</span>' +
                '      <button class="btn btn-add" data-add-to-cart="' + item.id + '">افزودن</button>' +
                '    </div>' +
                '  </div>' +
                '</div>'
            );
        }).join("");
        menuGrid.innerHTML = html;
    }

    function calculateCartTotal() {
        let total = 0;
        Object.keys(cartById).forEach(function (id) {
            const entry = cartById[id];
            total += entry.item.price * entry.qty;
        });
        return total;
    }

    function renderCart() {
        if (!cartContainer) return;
        const ids = Object.keys(cartById);
        if (ids.length === 0) {
            cartContainer.innerHTML = '<div class="cart-empty">سبد خرید خالی است.</div>';
        } else {
            cartContainer.innerHTML = ids.map(function (id) {
                const entry = cartById[id];
                return (
                    '<div class="cart-row">' +
                    '  <div class="cart-row__info">' +
                    '    <strong>' + entry.item.title + '</strong>' +
                    '    <span class="cart-row__price">' + formatPrice(entry.item.price) + '</span>' +
                    '  </div>' +
                    '  <div class="cart-row__actions">' +
                    '    <button class="qty-btn" data-decrease="' + id + '">−</button>' +
                    '    <span class="qty">' + entry.qty + '</span>' +
                    '    <button class="qty-btn" data-increase="' + id + '">+</button>' +
                    '    <button class="remove-btn" data-remove="' + id + '">حذف</button>' +
                    '  </div>' +
                    '</div>'
                );
            }).join("");
        }
        if (cartTotalElement) cartTotalElement.textContent = formatPrice(calculateCartTotal());
    }

    function addItemToCart(id) {
        const item = menuItems.find(function (m) { return m.id === id; });
        if (!item) return;
        if (!cartById[id]) cartById[id] = { item: item, qty: 0 };
        cartById[id].qty += 1;
        renderCart();
    }

    function changeCartQuantity(id, delta) {
        if (!cartById[id]) return;
        cartById[id].qty += delta;
        if (cartById[id].qty <= 0) delete cartById[id];
        renderCart();
    }

    function removeItemFromCart(id) {
        if (!cartById[id]) return;
        delete cartById[id];
        renderCart();
    }

    function toggleCheckout() {
        if (!checkoutForm) return;
        const isHidden = checkoutForm.classList.contains("d-none");
        if (isHidden) {
            checkoutForm.classList.remove("d-none");
            if (checkoutToggleButton) checkoutToggleButton.textContent = "بازگشت به سبد";
        } else {
            checkoutForm.classList.add("d-none");
            if (checkoutToggleButton) checkoutToggleButton.textContent = "ادامه سفارش";
        }
    }

    function validatePhone(phone) {
        return /^09\d{9}$/.test(phone);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const ids = Object.keys(cartById);
        if (ids.length === 0) {
            alert("سبد خرید خالی است.");
            return;
        }
        const name = document.getElementById("customer-name").value.trim();
        const phone = document.getElementById("customer-phone").value.trim();
        if (!name) {
            alert("نام و نام خانوادگی را وارد کنید");
            return;
        }
        if (!validatePhone(phone)) {
            alert("شماره تماس معتبر نیست. مثال: 09xxxxxxxxx");
            return;
        }
        const order = {
            customer: { name: name, phone: phone },
            items: ids.map(function (id) {
                const entry = cartById[id];
                return { id: id, title: entry.item.title, qty: entry.qty, price: entry.item.price };
            }),
            total: calculateCartTotal(),
            createdAt: new Date().toISOString()
        };

        console.log("Order submitted", order);
        alert("سفارش با موفقیت ثبت شد!\nجمع کل: " + formatPrice(order.total));
        cartById = {};
        renderCart();
        checkoutForm.reset();
        toggleCheckout();
        closeModal();
    }

    // Wire events
    openMenuButton.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
    });

    menuModal.addEventListener("click", function (e) {
        const target = e.target;
        if (target.hasAttribute("data-close-modal")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (!menuModal.classList.contains("d-none")) closeModal();
        }
    });

    menuGrid.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-add-to-cart]");
        if (!btn) return;
        addItemToCart(btn.getAttribute("data-add-to-cart"));
    });

    cartContainer.addEventListener("click", function (e) {
        const inc = e.target.closest("[data-increase]");
        const dec = e.target.closest("[data-decrease]");
        const rem = e.target.closest("[data-remove]");
        if (inc) changeCartQuantity(inc.getAttribute("data-increase"), 1);
        if (dec) changeCartQuantity(dec.getAttribute("data-decrease"), -1);
        if (rem) removeItemFromCart(rem.getAttribute("data-remove"));
    });

    if (checkoutToggleButton) checkoutToggleButton.addEventListener("click", toggleCheckout);
    if (checkoutForm) checkoutForm.addEventListener("submit", handleSubmit);

    // Initial renders
    renderMenuGrid();
    renderCart();
})();
