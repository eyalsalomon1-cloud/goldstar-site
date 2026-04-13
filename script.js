const routes = ["home", "products", "product", "cart", "checkout", "club"];

const products = {
  lager: {
    name: "שישיית בירה לאגר",
    price: 42,
    description: "שישיית לאגר קלאסית, זמינה להזמנה ישירה, עם כל הווייב של גולדסטאר באריזה אחת נוחה.",
    badge: "נכנס חזק לעגלה",
  },
  classic: {
    name: "גולדסטאר קלאסי",
    price: 39,
    description: "הטעם האייקוני של הערב הישראלי, עם גוף מלא וסיומת קרמלית.",
    badge: "הכי נמכר",
  },
  unfiltered: {
    name: "גולדסטאר Unfiltered",
    price: 46,
    description: "גרסה עשירה יותר עם אופי עמוק ולא מתנצל.",
    badge: "מהדורת פרימיום",
  },
  worldcup: {
    name: "מארז מונדיאל 2026",
    price: 149,
    description: "מארז צפייה מושלם לערב משחקים, אירוח נוח ואווירת חבר מביא חבר.",
    badge: "משלוח מהיר",
  },
  hosting: {
    name: "מארז אירוח מושלם",
    price: 149,
    description: "כל מה שצריך לערב עם חברים – במקום אחד.",
    badge: "מארזים בלעדיים",
  },
  beach: {
    name: "מארז גולדסטאר לים",
    price: 99,
    description: "פחיות קרות וקלות לנשיאה, מושלם לים, לשקיעה ולחבר'ה שכבר תפסו צידנית.",
    badge: "קיץ על החוף",
  },
  bbq: {
    name: "מארז אירוח לעל האש",
    price: 129,
    description: "מארז עמוק וכבד יותר לערב בשר, אש וצחוקים, עם נוכחות שלא הולכת לאיבוד ליד הגריל.",
    badge: "לערב על האש",
  },
  limited: {
    name: "מארז בירות במהדורות מוגבלות",
    price: 159,
    description: "אוסף מיוחד למי שאוהב לתפוס מהדורה לפני כולם ולהביא משהו שאי אפשר למצוא בכל מקום.",
    badge: "מהדורה מוגבלת",
  },
};

const cart = {
  worldcup: 1,
  classic: 1,
};

const pageMap = Object.fromEntries(
  routes.map((route) => [route, document.getElementById(`page-${route}`)]),
);

const navLinks = Array.from(document.querySelectorAll("[data-route]"));
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const catalogCards = Array.from(document.querySelectorAll("#productsCatalog .product-card"));
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const summaryItemsEl = document.getElementById("summaryItems");
const summaryTotalEl = document.getElementById("summaryTotal");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");
const checkoutForm = document.getElementById("checkoutForm");
const formSuccess = document.getElementById("formSuccess");
const revealItems = Array.from(document.querySelectorAll(".reveal"));

function getCurrentRoute() {
  const hash = window.location.hash.replace("#", "");
  return routes.includes(hash) ? hash : "home";
}

function updateNavState(activeRoute) {
  navLinks.forEach((link) => {
    if (!link.classList.contains("nav-link")) return;
    link.classList.toggle("active", link.dataset.route === activeRoute);
  });
}

function showRoute(route) {
  routes.forEach((name) => {
    pageMap[name].classList.toggle("active", name === route);
  });
  updateNavState(route);
  mobileNav.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  requestAnimationFrame(observeReveals);
}

function renderCart() {
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const totalItems = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const totalPrice = entries.reduce(
    (sum, [id, qty]) => sum + products[id].price * qty,
    0,
  );

  cartCountEl.textContent = totalItems;
  summaryItemsEl.textContent = totalItems;
  summaryTotalEl.textContent = `₪${totalPrice}`;

  if (!entries.length) {
    cartItemsEl.innerHTML = `
      <article class="card cart-item">
        <div class="cart-item-copy">
          <span class="product-tag">העגלה ריקה</span>
          <h3>עוד לא בחרת מוצרים</h3>
          <p>זה הזמן לבחור מארז, שישייה או מהדורת Unfiltered ולמלא את הערב.</p>
        </div>
        <div class="cart-item-side">
          <button class="gold-btn" data-route="products">לעמוד המוצרים</button>
        </div>
      </article>
    `;
    return;
  }

  cartItemsEl.innerHTML = entries
    .map(([id, qty]) => {
      const product = products[id];
      return `
        <article class="card cart-item">
          <div class="cart-item-copy">
            <span class="product-tag">${product.badge}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
          <div class="cart-item-side">
            <div class="quantity-control">
              <button class="qty-btn qty-plus" data-qty-action="plus" data-product="${id}">+</button>
              <strong>${qty}</strong>
              <button class="qty-btn qty-minus" data-qty-action="minus" data-product="${id}">-</button>
            </div>
            <strong>₪${product.price * qty}</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  renderCart();
}

function updateQuantity(productId, delta) {
  cart[productId] = (cart[productId] || 0) + delta;
  if (cart[productId] <= 0) delete cart[productId];
  renderCart();
}

navLinks.forEach((button) => {
  button.addEventListener("click", () => {
    const route = button.dataset.route;
    if (!route) return;
    window.location.hash = route;
    showRoute(route);
  });
});

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => addToCart(button.dataset.product));
});

document.addEventListener("click", (event) => {
  const qtyButton = event.target.closest("[data-qty-action]");
  if (qtyButton) {
    const { product, qtyAction } = qtyButton.dataset;
    updateQuantity(product, qtyAction === "plus" ? 1 : -1);
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton && !routeButton.classList.contains("nav-link")) {
    const route = routeButton.dataset.route;
    if (!route) return;
    window.location.hash = route;
    showRoute(route);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));

    catalogCards.forEach((card) => {
      const category = card.dataset.category;
      const shouldShow = filter === "all" || category === filter;
      card.style.display = shouldShow ? "" : "none";
    });
  });
});

mobileMenuBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formSuccess.classList.add("show");
});

function observeReveals() {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const threshold = window.innerHeight * 0.88;
    if (rect.top < threshold) {
      item.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", observeReveals, { passive: true });
window.addEventListener("resize", observeReveals);

window.addEventListener("hashchange", () => showRoute(getCurrentRoute()));

renderCart();
showRoute(getCurrentRoute());
observeReveals();
