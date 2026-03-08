// script.js – full interactivity, services, order, history, local storage

/********** DATA (default services) **********/
const DEFAULT_CATEGORIES = [
  { name: 'Instagram', icon: 'fab fa-instagram' },
  { name: 'YouTube', icon: 'fab fa-youtube' },
  { name: 'TikTok', icon: 'fab fa-tiktok' },
  { name: 'Telegram', icon: 'fab fa-telegram' },
  { name: 'Other Services', icon: 'fas fa-globe' }
];

const DEFAULT_SERVICES = [
  // Instagram
  { id: 'i1', category: 'Instagram', name: 'IG Followers', min: 10, max: 10000, price: 0.35, icon: 'fab fa-instagram' },
  { id: 'i2', category: 'Instagram', name: 'IG Likes', min: 5, max: 5000, price: 0.15, icon: 'fab fa-instagram' },
  { id: 'y1', category: 'YouTube', name: 'YT Views', min: 100, max: 50000, price: 0.02, icon: 'fab fa-youtube' },
  { id: 'y2', category: 'YouTube', name: 'YT Subscribers', min: 10, max: 2000, price: 1.2, icon: 'fab fa-youtube' },
  { id: 't1', category: 'TikTok', name: 'TikTok Followers', min: 20, max: 5000, price: 0.5, icon: 'fab fa-tiktok' },
  { id: 'tg1', category: 'Telegram', name: 'Telegram Members', min: 20, max: 2000, price: 0.8, icon: 'fab fa-telegram' },
  { id: 'o1', category: 'Other Services', name: 'Website Clicks', min: 50, max: 5000, price: 0.1, icon: 'fas fa-mouse-pointer' }
];

// storage keys
const STORAGE_SERVICES = 'byso_services';
const STORAGE_ORDERS = 'byso_orders';
const STORAGE_THEME = 'byso_theme';

// ---------- global state ----------
let services = [];
let categories = [...DEFAULT_CATEGORIES];
let currentOrder = null; // { service, quantity, link, total }
let orderStep = 1; // 1:select qty, 2:link, 3:confirm
let selectedService = null;

// ---------- init / load from storage ----------
function loadServices() {
  const stored = localStorage.getItem(STORAGE_SERVICES);
  if (stored) {
    try { services = JSON.parse(stored); }
    catch { services = [...DEFAULT_SERVICES]; }
  } else {
    services = [...DEFAULT_SERVICES];
  }
}
function saveServices() {
  localStorage.setItem(STORAGE_SERVICES, JSON.stringify(services));
}
loadServices();

// ---------- render services by category ----------
function renderServices() {
  const container = document.querySelector('.services-container');
  if (!container) return;
  container.innerHTML = '';
  categories.forEach(cat => {
    const catServices = services.filter(s => s.category === cat.name);
    if (!catServices.length) return;
    const section = document.createElement('section');
    section.className = 'category-section';
    section.innerHTML = `
      <div class="category-title"><i class="${cat.icon}"></i>${cat.name}</div>
      <div class="cards-grid" data-category="${cat.name}"></div>
    `;
    const grid = section.querySelector('.cards-grid');
    catServices.forEach(svc => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-icon"><i class="${svc.icon}"></i></div>
        <div class="card-info">
          <div class="card-name">${svc.name}</div>
          <div class="card-details">
            <span>min ${svc.min}</span> · <span>max ${svc.max}</span> · <span>₹${svc.price}/unit</span>
          </div>
        </div>
        <button class="order-btn" data-id="${svc.id}">Order</button>
      `;
      grid.appendChild(card);
    });
    container.appendChild(section);
  });

  // attach order button events
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const service = services.find(s => s.id === id);
      if (service) openOrderModal(service);
    });
  });
}

// ---------- theme toggle ----------
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
if (localStorage.getItem(STORAGE_THEME) === 'dark') {
  body.classList.remove('light-theme');
  body.classList.add('dark-theme');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}
themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-theme');
  body.classList.toggle('dark-theme');
  const isDark = body.classList.contains('dark-theme');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem(STORAGE_THEME, isDark ? 'dark' : 'light');
});

// ---------- hamburger menu ----------
const hamburger = document.getElementById('hamburgerBtn');
const menuPanel = document.getElementById('menuPanel');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');
function openMenu() {
  menuPanel.classList.add('open');
  menuOverlay.classList.add('open');
}
function closeMenu() {
  menuPanel.classList.remove('open');
  menuOverlay.classList.remove('open');
}
hamburger.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);
document.getElementById('menuServices').addEventListener('click', (e) => {
  e.preventDefault();
  closeMenu();
  document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
});

// ---------- order history modal ----------
const historyModal = document.getElementById('historyModal');
const closeHistory = document.getElementById('closeHistoryModal');
document.getElementById('menuOrderHistory').addEventListener('click', (e) => {
  e.preventDefault();
  closeMenu();
  showOrderHistory();
});
function showOrderHistory() {
  const list = document.getElementById('historyList');
  const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS) || '[]');
  if (orders.length === 0) {
    list.innerHTML = '<p style="opacity:0.6; text-align:center;">No orders yet.</p>';
  } else {
    list.innerHTML = orders.reverse().map(o => `
      <div class="history-item">
        <div><strong>${o.service}</strong> · ${o.quantity} × ₹${o.pricePerUnit}</div>
        <div style="font-size:0.9rem;">Link: ${o.link.substring(0,30)}…</div>
        <div style="display:flex; justify-content:space-between; margin-top:0.5rem;">
          <span>₹${o.total}</span>
          <span style="opacity:0.5;">${new Date(o.date).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');
  }
  historyModal.classList.add('show');
}
closeHistory.addEventListener('click', () => historyModal.classList.remove('show'));

// ---------- order flow ----------
const orderModal = document.getElementById('orderModal');
const closeOrder = document.getElementById('closeOrderModal');
closeOrder.addEventListener('click', () => orderModal.classList.remove('show'));

function openOrderModal(service) {
  selectedService = service;
  currentOrder = { serviceId: service.id, quantity: service.min, link: '', step: 'qty' };
  renderOrderStep1();
  orderModal.classList.add('show');
}
function renderOrderStep1() {
  const bodyDiv = document.getElementById('orderModalBody');
  const s = selectedService;
  bodyDiv.innerHTML = `
    <div class="input-group">
      <label>Quantity (min ${s.min} / max ${s.max})</label>
      <input type="number" id="orderQty" min="${s.min}" max="${s.max}" value="${s.min}" step="1">
    </div>
    <p id="step1Price">Total: ₹${(s.min * s.price).toFixed(2)}</p>
    <button class="buy-btn" id="step1Next">Next <i class="fas fa-arrow-right"></i></button>
  `;
  const qtyInput = document.getElementById('orderQty');
  qtyInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || s.min;
    if (val < s.min) val = s.min;
    if (val > s.max) val = s.max;
    e.target.value = val;
    document.getElementById('step1Price').innerText = `Total: ₹${(val * s.price).toFixed(2)}`;
  });
  document.getElementById('step1Next').addEventListener('click', () => {
    const qty = parseInt(qtyInput.value);
    if (qty < s.min || qty > s.max) {
      showToast(`Please enter between ${s.min} and ${s.max}`);
      return;
    }
    currentOrder.quantity = qty;
    renderOrderStep2();
  });
}
function renderOrderStep2() {
  const bodyDiv = document.getElementById('orderModalBody');
  bodyDiv.innerHTML = `
    <div class="input-group">
      <label>Public link (Instagram/YouTube/TikTok/Telegram)</label>
      <input type="url" id="orderLink" placeholder="https://...">
    </div>
    <button class="buy-btn" id="step2Next">Continue <i class="fas fa-arrow-right"></i></button>
  `;
  document.getElementById('step2Next').addEventListener('click', () => {
    const link = document.getElementById('orderLink').value.trim();
    if (!link) { showToast('Please enter a link'); return; }
    // simple domain hint (just for demonstration)
    if (!link.match(/^(https?:\/\/)?(www\.)?(instagram\.com|youtube\.com|tiktok\.com|t\.me|telegram\.me)/i)) {
      showToast('Please use a link from Instagram, YouTube, TikTok, or Telegram');
      return;
    }
    currentOrder.link = link;
    renderOrderStep3();
  });
}
function renderOrderStep3() {
  const s = selectedService;
  const total = currentOrder.quantity * s.price;
  currentOrder.total = total;
  const bodyDiv = document.getElementById('orderModalBody');
  bodyDiv.innerHTML = `
    <div style="text-align:center;">
      <p><strong>${s.name}</strong> · ${currentOrder.quantity} × ₹${s.price}</p>
      <p>Link: ${currentOrder.link.substring(0,40)}…</p>
      <h2 style="margin:1rem 0;">Total: ₹${total.toFixed(2)}</h2>
      <button class="buy-btn" id="confirmBuy"><i class="fab fa-whatsapp"></i> BUY via WhatsApp</button>
    </div>
  `;
  document.getElementById('confirmBuy').addEventListener('click', () => {
    // save order to history
    const orderRecord = {
      service: s.name,
      quantity: currentOrder.quantity,
      link: currentOrder.link,
      pricePerUnit: s.price,
      total: total.toFixed(2),
      date: new Date().toISOString()
    };
    const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS) || '[]');
    orders.push(orderRecord);
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));

    // whatsapp message
    const message = `Hello BYSO Team,%0ANew Order Request%0AService: ${s.name}%0AQuantity: ${currentOrder.quantity}%0ALink: ${currentOrder.link}%0APrice: ₹${total.toFixed(2)}%0APlease confirm the order.`;
    const waLink = `https://wa.me/6282298431688?text=${message}`;
    window.open(waLink, '_blank');
    orderModal.classList.remove('show');
    showToast('Order placed! Check history.');
  });
}

// toast helper
function showToast(msg) {
  const t = document.getElementById('toastMsg');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ---------- initial render and helpers ----------
document.addEventListener('DOMContentLoaded', () => {
  renderServices();

  // close modal when click outside content
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('show');
    }
  });
});

// export for admin (used by admin.html via localStorage)
window.getServices = function() { return services; };
window.updateServices = function(newServices) {
  services = newServices;
  saveServices();
  renderServices();
};