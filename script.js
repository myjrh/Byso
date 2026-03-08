// --- Initial Data Setup ---
const defaultServices = [
    { id: 1, category: 'Instagram', icon: '📸', name: 'Premium Followers', min: 100, max: 10000, price: 0.50 },
    { id: 2, category: 'Instagram', icon: '❤️', name: 'High Quality Likes', min: 50, max: 5000, price: 0.10 },
    { id: 3, category: 'YouTube', icon: '▶️', name: 'Real Subscribers', min: 50, max: 2000, price: 2.50 },
    { id: 4, category: 'TikTok', icon: '🎵', name: 'Video Views', min: 1000, max: 50000, price: 0.05 },
    { id: 5, category: 'Telegram', icon: '✈️', name: 'Channel Members', min: 100, max: 10000, price: 0.80 }
];

// Initialize Storage
if (!localStorage.getItem('byso_services')) localStorage.setItem('byso_services', JSON.stringify(defaultServices));
if (!localStorage.getItem('byso_history')) localStorage.setItem('byso_history', JSON.stringify([]));
if (!localStorage.getItem('byso_admin_pass')) localStorage.setItem('byso_admin_pass', 'md imran 90191123302 bhai sahab');

let currentService = null;

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Set theme based on attribute
    const theme = localStorage.getItem('byso_theme') || 'dark';
    document.body.setAttribute('data-theme', theme);

    if (document.getElementById('services-container')) {
        renderServices();
    }
    
    // Hash routing for history
    window.addEventListener('hashchange', handleRouting);
    handleRouting();

    if (window.location.pathname.includes('admin')) {
        loadAdminData();
    }
});

// --- UI & Navigation ---
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('byso_theme', newTheme);
}

function handleRouting() {
    const hash = window.location.hash;
    if (hash === '#history-section') {
        document.getElementById('home').style.display = 'none';
        document.getElementById('services-section').style.display = 'none';
        document.getElementById('history-section').style.display = 'block';
        renderHistory();
    } else if (hash === '#services-section' || hash === '#home' || hash === '') {
        if(document.getElementById('home')){
            document.getElementById('home').style.display = 'flex';
            document.getElementById('services-section').style.display = 'block';
            document.getElementById('history-section').style.display = 'none';
        }
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- Render Services (Client) ---
function renderServices() {
    const container = document.getElementById('services-container');
    const services = JSON.parse(localStorage.getItem('byso_services'));
    container.innerHTML = '';

    // Group by category
    const categories = [...new Set(services.map(s => s.category))];

    categories.forEach(cat => {
        const catServices = services.filter(s => s.category === cat);
        const iconMap = { 'Instagram': '📸', 'YouTube': '▶️', 'TikTok': '🎵', 'Telegram': '✈️', 'Other Services': '🚀' };
        const catIcon = iconMap[cat] || '✨';

        let html = `
            <div class="category-block">
                <div class="category-header">
                    <span>${catIcon}</span>
                    <h3>${cat}</h3>
                </div>
                <div class="services-grid">
        `;

        catServices.forEach(s => {
            html += `
                <div class="service-card glass">
                    <div class="card-header">
                        <span class="card-icon">${s.icon}</span>
                        <h3 class="card-title">${s.name}</h3>
                    </div>
                    <div class="card-details">
                        <span>Min: ${s.min} | Max: ${s.max}</span>
                    </div>
                    <div class="price-tag">₹${s.price.toFixed(2)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-color);">/ unit</span></div>
                    <button class="cta-btn mt-20" onclick="openOrderModal(${s.id})">Order Now</button>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML += html;
    });
}

// --- Order Flow ---
function openOrderModal(id) {
    const services = JSON.parse(localStorage.getItem('byso_services'));
    currentService = services.find(s => s.id === id);
    
    document.getElementById('modal-service-name').innerText = currentService.name;
    document.getElementById('modal-service-limits').innerText = `Min: ${currentService.min} | Max: ${currentService.max}`;
    
    // Reset inputs
    document.getElementById('order-qty').value = '';
    document.getElementById('order-link').value = '';
    document.getElementById('price-display').style.display = 'none';
    document.getElementById('calculate-btn').style.display = 'block';
    document.getElementById('buy-btn').style.display = 'none';

    document.getElementById('order-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('order-modal').classList.remove('active');
    currentService = null;
}

function validateAndCalculate() {
    const qty = parseInt(document.getElementById('order-qty').value);
    const link = document.getElementById('order-link').value.trim();

    if (!qty || isNaN(qty)) { showToast("Please enter a valid quantity."); return; }
    if (!link) { showToast("Please enter a valid public link."); return; }

    if (qty < currentService.min || qty > currentService.max) {
        showToast(`Please enter a quantity between ${currentService.min} and ${currentService.max}`);
        return;
    }
    
    // Basic domain validation based on category (Optional safety check)
    const catLower = currentService.category.toLowerCase();
    if (catLower !== 'other services' && !link.toLowerCase().includes(catLower.replace(' ', ''))) {
        showToast(`Warning: Link doesn't look like a valid ${currentService.category} URL.`);
    }

    const total = (qty * currentService.price).toFixed(2);
    document.getElementById('total-price').innerText = `₹${total}`;
    
    document.getElementById('calculate-btn').style.display = 'none';
    document.getElementById('price-display').style.display = 'block';
    document.getElementById('buy-btn').style.display = 'block';
}

function processOrder() {
    const qty = parseInt(document.getElementById('order-qty').value);
    const link = document.getElementById('order-link').value.trim();
    const total = (qty * currentService.price).toFixed(2);
    
    // Save to history
    const history = JSON.parse(localStorage.getItem('byso_history'));
    history.unshift({
        service: currentService.name,
        quantity: qty,
        link: link,
        price: total,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('byso_history', JSON.stringify(history));

    // Format WhatsApp Message
    const waNumber = "+6282298431688";
    const text = `Hello BYSO Team,%0A%0ANew Order Request%0A%0AService: ${currentService.name}%0AQuantity: ${qty}%0ALink: ${link}%0APrice: ₹${total}%0A%0APlease confirm the order.`;
    
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
    closeModal();
    showToast("Redirecting to WhatsApp...");
}

function renderHistory() {
    const container = document.getElementById('history-container');
    const history = JSON.parse(localStorage.getItem('byso_history'));
    
    if(history.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.7;">No orders yet.</p>';
        return;
    }

    container.innerHTML = history.map(h => `
        <div class="glass p-30 mb-30">
            <h3>${h.service}</h3>
            <p class="mt-20">Quantity: ${h.quantity}</p>
            <p>Link: <a href="${h.link}" target="_blank" style="color:var(--secondary-color);">${h.link.substring(0,30)}...</a></p>
            <p>Date: ${h.date}</p>
            <h3 class="price-tag mt-20">₹${h.price}</h3>
        </div>
    `).join('');
}

// --- Admin Panel Logic ---
function checkAdminPassword() {
    const pass = document.getElementById('admin-pass').value;
    const correctPass = localStorage.getItem('byso_admin_pass');
    
    if (pass === correctPass) {
        document.getElementById('admin-login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        loadAdminData();
    } else {
        showToast("Incorrect Password");
    }
}

function loadAdminData() {
    const services = JSON.parse(localStorage.getItem('byso_services'));
    const list = document.getElementById('admin-service-list');
    const select = document.getElementById('check-service');
    
    list.innerHTML = '';
    select.innerHTML = '<option value="">Select Service to Check</option>';

    services.forEach(s => {
        // Populate list
        list.innerHTML += `
            <div class="admin-card glass">
                <div>
                    <strong>${s.name}</strong> (${s.category})
                    <div style="font-size:0.8rem; opacity:0.8;">Min: ${s.min} | Max: ${s.max} | ₹${s.price}</div>
                </div>
                <button class="delete-btn icon-btn" onclick="deleteService(${s.id})">🗑</button>
            </div>
        `;
        // Populate dropdown
        select.innerHTML += `<option value="${s.id}">${s.name} (₹${s.price})</option>`;
    });
}

function addService() {
    const cat = document.getElementById('add-cat').value;
    const icon = document.getElementById('add-icon').value || '✨';
    const name = document.getElementById('add-name').value;
    const min = parseInt(document.getElementById('add-min').value);
    const max = parseInt(document.getElementById('add-max').value);
    const price = parseFloat(document.getElementById('add-price').value);

    if(!cat || !name || isNaN(min) || isNaN(max) || isNaN(price)) {
        showToast("Please fill all fields correctly."); return;
    }

    const services = JSON.parse(localStorage.getItem('byso_services'));
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    
    services.push({ id: newId, category: cat, icon: icon, name: name, min: min, max: max, price: price });
    localStorage.setItem('byso_services', JSON.stringify(services));
    
    showToast("Service Added Successfully");
    loadAdminData();
    
    // Clear inputs
    document.querySelectorAll('.form-grid input').forEach(i => i.value = '');
}

function deleteService(id) {
    if(confirm("Are you sure you want to delete this service?")) {
        let services = JSON.parse(localStorage.getItem('byso_services'));
        services = services.filter(s => s.id !== id);
        localStorage.setItem('byso_services', JSON.stringify(services));
        showToast("Service Deleted");
        loadAdminData();
    }
}

function checkPrice() {
    const id = document.getElementById('check-service').value;
    const qty = parseInt(document.getElementById('check-qty').value);
    const resultDisplay = document.getElementById('check-result');

    if(!id || isNaN(qty) || qty <= 0) {
        resultDisplay.innerText = "₹0.00";
        return;
    }

    const services = JSON.parse(localStorage.getItem('byso_services'));
    const service = services.find(s => s.id == id);
    
    if(service) {
        resultDisplay.innerText = `₹${(service.price * qty).toFixed(2)}`;
    }
}

function updatePassword() {
    const newPass = document.getElementById('new-pass').value.trim();
    if(newPass.length < 5) {
        showToast("Password must be at least 5 characters.");
        return;
    }
    localStorage.setItem('byso_admin_pass', newPass);
    showToast("Password Updated Successfully");
    document.getElementById('new-pass').value = '';
}
