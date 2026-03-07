// script.js — complete functionality

// ---------- GLOBAL DATA (services) ----------
let servicesData = null; // will be loaded from localStorage or default

const DEFAULT_SERVICES = [
  { id: 'cat1', name: 'Instagram', icon: 'fab fa-instagram', services: [
    { id: 's1', name: 'Instagram Followers', min: 10, max: 10000, price: 0.008, icon: 'fas fa-user-plus' },
    { id: 's2', name: 'Instagram Likes', min: 5, max: 5000, price: 0.005, icon: 'fas fa-heart' }
  ] },
  { id: 'cat2', name: 'YouTube', icon: 'fab fa-youtube', services: [
    { id: 's3', name: 'YouTube Views', min: 100, max: 50000, price: 0.002, icon: 'fas fa-eye' },
    { id: 's4', name: 'YouTube Subscribers', min: 10, max: 10000, price: 0.02, icon: 'fas fa-users' }
  ] },
  { id: 'cat3', name: 'TikTok', icon: 'fab fa-tiktok', services: [
    { id: 's5', name: 'TikTok Followers', min: 20, max: 20000, price: 0.009, icon: 'fas fa-user' }
  ] },
  { id: 'cat4', name: 'Telegram', icon: 'fab fa-telegram', services: [
    { id: 's6', name: 'Telegram Members', min: 30, max: 10000, price: 0.015, icon: 'fas fa-user-plus' }
  ] },
  { id: 'cat5', name: 'Other Services', icon: 'fas fa-globe', services: [
    { id: 's7', name: 'Website Traffic', min: 100, max: 50000, price: 0.001, icon: 'fas fa-chart-line' }
  ] }
];

// load from localStorage or set default
function loadServices() {
  const stored = localStorage.getItem('bysoservices');
  if (stored) {
    servicesData = JSON.parse(stored);
  } else {
    servicesData = DEFAULT_SERVICES;
    localStorage.setItem('bysoservices', JSON.stringify(DEFAULT_SERVICES));
  }
}
loadServices();

// ---------- RENDER SERVICES ----------
function renderServices() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;
  let html = '';
  servicesData.forEach(cat => {
    html += `<div class="category-block"><div class="category-title"><i class="${cat.icon}"></i> ${cat.name}</div><div class="services-grid">`;
    cat.services.forEach(svc => {
      html += `
        <div class="service-card" data-service-id="${svc.id}" data-cat-id="${cat.id}">
          <i class="service-icon ${svc.icon || 'fas fa-star'}"></i>
          <div class="service-name">${svc.name}</div>
          <div class="service-detail"><span>min</span> <span class="service-minmax"><span>${svc.min}</span> / <span>${svc.max}</span></span></div>
          <div class="service-price">$${svc.price.toFixed(4)}/unit</div>
          <button class="order-btn" data-service='${JSON.stringify(svc).replace(/'/g, "&apos;")}' data-cat="${cat.name}">Order now</button>
        </div>
      `;
    });
    html += '</div></div>';
  });
  container.innerHTML = html;

  // attach order button listeners
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = JSON.parse(btn.dataset.service);
      startOrderFlow(service);
    });
  });
}
renderServices();

// ---------- ORDER FLOW ----------
let currentService = null;
let step = 1, quantity = 0, link = '', total = 0;
const modal = document.getElementById('orderModal');
const stepContent = document.getElementById('stepContent');
const modalServiceName = document.getElementById('modalServiceName');

function startOrderFlow(service) {
  currentService = service;
  step = 1;
  quantity = 0; link = '';
  modalServiceName.innerText = service.name;
  updateStep();
  modal.style.display = 'flex';
}

function updateStep() {
  if (!currentService) return;
  const s = currentService;
  if (step === 1) {
    stepContent.innerHTML = `
      <div class="step-input"><label>🔢 Quantity (min ${s.min} / max ${s.max})</label><input type="number" id="qtyInput" min="${s.min}" max="${s.max}" value="${s.min}"></div>
      <div class="step-actions"><button class="step-btn" id="stepNext">Next</button></div>
    `;
    document.getElementById('stepNext')?.addEventListener('click', () => {
      const qty = parseInt(document.getElementById('qtyInput').value);
      if (qty < s.min || qty > s.max) {
        alert(`Please enter a quantity between ${s.min} and ${s.max}`);
        return;
      }
      quantity = qty;
      step = 2;
      updateStep();
    });
  } else if (step === 2) {
    stepContent.innerHTML = `
      <div class="step-input"><label>🔗 Public link (Instagram/YouTube etc)</label><input type="url" id="linkInput" placeholder="https://..."></div>
      <div class="step-actions"><button class="step-btn outline" id="stepBack">Back</button><button class="step-btn" id="stepNext2">Next</button></div>
    `;
    document.getElementById('stepBack').addEventListener('click', () => { step = 1; updateStep(); });
    document.getElementById('stepNext2').addEventListener('click', () => {
      link = document.getElementById('linkInput').value.trim();
      if (!link) { alert('Enter a valid link'); return; }
      step = 3;
      updateStep();
    });
  } else if (step === 3) {
    total = quantity * s.price;
    stepContent.innerHTML = `
      <div class="total-price">💰 $${total.toFixed(4)}</div>
      <p><i class="fas fa-check-circle" style="color:var(--accent);"></i> Quantity: ${quantity}, Link: ${link.substring(0,30)}…</p>
      <div class="step-actions"><button class="step-btn outline" id="stepBack2">Back</button><button class="step-btn" id="confirmBuy">Buy via WhatsApp</button></div>
    `;
    document.getElementById('stepBack2').addEventListener('click', () => { step = 2; updateStep(); });
    document.getElementById('confirmBuy').addEventListener('click', () => {
      // save order history
      const order = {
        service: currentService.name,
        quantity, link, total: total.toFixed(4),
        date: new Date().toLocaleString()
      };
      let history = JSON.parse(localStorage.getItem('bsohistory') || '[]');
      history.unshift(order);
      localStorage.setItem('bsohistory', JSON.stringify(history));

      // whatsapp
      const message = `Hello BYSO Team,%0A%0ANew Order Request%0AService: ${currentService.name}%0AQuantity: ${quantity}%0ALink: ${encodeURIComponent(link)}%0APrice: $${total.toFixed(4)}%0A%0APlease confirm the order.`;
      window.open(`https://wa.me/6282298431688?text=${message}`, '_blank');
      modal.style.display = 'none';
    });
  }
}

// close modal
document.querySelector('.modal-close').addEventListener('click', () => { modal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// ---------- ORDER HISTORY MODAL ----------
const historyModal = document.getElementById('historyModal');
document.getElementById('historyLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showHistory();
  historyModal.style.display = 'flex';
});
document.getElementById('closeHistory').addEventListener('click', () => { historyModal.style.display = 'none'; });
function showHistory() {
  const history = JSON.parse(localStorage.getItem('bsohistory') || '[]');
  const listDiv = document.getElementById('historyList');
  if (history.length === 0) { listDiv.innerHTML = '<p>✨ No orders yet</p>'; return; }
  let html = '';
  history.forEach(o => {
    html += `<div class="history-item"><strong>${o.service}</strong> x${o.quantity}<br>💰 $${o.total} · 🔗 ${o.link.substring(0,20)}…<br><small>${o.date}</small></div>`;
  });
  listDiv.innerHTML = html;
}

// ---------- HAMBURGER MENU ----------
const hamBtn = document.getElementById('hamburgerBtn');
const sideMenu = document.getElementById('sideMenu');
const backdrop = document.getElementById('menuBackdrop');
const closeMenu = document.getElementById('closeMenu');
function openMenu() { sideMenu.classList.add('open'); backdrop.classList.add('active'); }
function closeMenuFunc() { sideMenu.classList.remove('open'); backdrop.classList.remove('active'); }
hamBtn.addEventListener('click', openMenu);
closeMenu.addEventListener('click', closeMenuFunc);
backdrop.addEventListener('click', closeMenuFunc);
document.querySelectorAll('.menu-link').forEach(link => { link.addEventListener('click', closeMenuFunc); });

// terms link
document.getElementById('termsLink').addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'terms.html'; });

// ---------- THEME TOGGLE ----------
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
  localStorage.setItem('bysotheme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});
// load saved theme
if (localStorage.getItem('bysotheme') === 'dark') document.body.classList.replace('light-theme', 'dark-theme');

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a[href="#services"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
  });
});

// ---------- ADMIN PANEL (in admin.html) will use same localStorage ----------
// we must also ensure that any changes made in admin are reflected when index loads.
// that's already via loadServices + render on load.

// export for admin? no need, but we need to keep servicesData in sync with localStorage
window.refreshServicesFromStorage = function() {
  loadServices();
  renderServices();
};