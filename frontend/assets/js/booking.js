const API_URL = '';

// State Global untuk menyimpan pilihan user
window.bookingData = {
    serviceId: null,
    serviceName: '',
    servicePrice: 0,
    barberId: null,
    barberName: '',
    date: null,
    time: null,
    paymentMethod: 'offline' // Default
};

console.log("✅ Booking Script Siap!");

// ==========================================
// 2. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadServices();
    loadBarbers(); 
    setupDateInput();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = 'login.html';
    }
}

// ==========================================
// 3. FUNGSI SUBMIT (UTAMA)
// ==========================================
// Dipanggil langsung dari tombol HTML onclick="submitBooking()"
window.submitBooking = async function() {
    console.log("🚀 Tombol Submit Ditekan!"); // Cek di Console (F12)

    const token = localStorage.getItem('token');
    const submitBtn = document.querySelector('button[onclick="submitBooking()"]');

    // 1. Validasi Data Booking Utama (Cegah data kosong jika user refresh)
    if (!window.bookingData.serviceId || !window.bookingData.barberId || !window.bookingData.date || !window.bookingData.time) {
        alert("Data booking tidak lengkap atau sesi habis. Silakan ulangi pilih layanan.");
        window.location.reload();
        return;
    }

    // 2. Validasi Khusus Pembayaran Online
    if (window.bookingData.paymentMethod === 'online') {
        const name = document.getElementById('sender_name').value.trim();
        const num = document.getElementById('sender_number').value.trim();
        const file = document.getElementById('payment_proof').files[0];

        if (!name || !num) return alert("Mohon lengkapi Nama & Nomor Pengirim!");
        if (!file) return alert("Mohon upload Bukti Transfer!");
    }

    // 3. Konfirmasi User
    if(!confirm("Apakah data pesanan sudah benar?")) return;
    
    // 4. Loading State
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    // 5. Siapkan Data (FormData)
    const fd = new FormData();
    fd.append('service_id', window.bookingData.serviceId);
    fd.append('barber_id', window.bookingData.barberId);
    fd.append('booking_date', window.bookingData.date);
    fd.append('booking_time', window.bookingData.time);
    fd.append('payment_method', window.bookingData.paymentMethod);

    // Kirim data tambahan jika online
    if (window.bookingData.paymentMethod === 'online') {
        fd.append('payment_provider', document.getElementById('sender_name').value);
        fd.append('payment_account', document.getElementById('sender_number').value);
        fd.append('payment_proof', document.getElementById('payment_proof').files[0]);
    }

    try {
        // 6. Kirim ke Backend
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Header Auth
            body: fd
        });

        const json = await res.json();

        if (json.success) {
            alert("✅ Booking Berhasil Dibuat!");
            window.location.href = 'my-bookings.html';
        } else {
            throw new Error(json.message || "Gagal membuat booking");
        }

    } catch (err) {
        console.error("Error Submit:", err);
        alert("❌ Terjadi kesalahan: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
};

// ==========================================
// 4. FUNGSI LOGIKA LAINNYA (Global Window)
// ==========================================

window.selectPayment = function(method, el) {
    window.bookingData.paymentMethod = method;

    // Reset Style
    document.querySelectorAll('.payment-card').forEach(c => {
        c.classList.remove('selected');
        c.style.border = '1px solid #444';
        c.style.background = '#252525';
    });
    
    // Highlight Pilihan
    if(el) {
        el.classList.add('selected');
        el.style.border = '2px solid #fbbf24'; 
        el.style.background = 'rgba(251, 191, 36, 0.1)';
    }

    // Toggle Area Online
    const onlineArea = document.getElementById('online-payment-area');
    if (onlineArea) {
        if (method === 'online') {
            onlineArea.style.display = 'block';
            
            // Update Harga Dinamis
            const priceEl = document.querySelector('.dynamic-price-display');
            if(priceEl) {
                const price = parseInt(window.bookingData.servicePrice || 0).toLocaleString('id-ID');
                priceEl.innerText = `Rp ${price}`;
            }
            window.switchTab('qris'); 
        } else {
            onlineArea.style.display = 'none';
        }
    }
};

window.switchTab = function(tabName) {
    const contentQris = document.getElementById('tab-qris');
    const contentTransfer = document.getElementById('tab-transfer');
    const btnQris = document.getElementById('btn-tab-qris'); 
    const btnTransfer = document.getElementById('btn-tab-transfer'); 

    if(contentQris) contentQris.style.display = 'none';
    if(contentTransfer) contentTransfer.style.display = 'none';
    if(btnQris) btnQris.classList.remove('active');
    if(btnTransfer) btnTransfer.classList.remove('active');

    if (tabName === 'qris') {
        if(contentQris) contentQris.style.display = 'block';
        if(btnQris) btnQris.classList.add('active');
    } else {
        if(contentTransfer) contentTransfer.style.display = 'block';
        if(btnTransfer) btnTransfer.classList.add('active');
    }
};

window.copyText = function(text) {
    navigator.clipboard.writeText(text).then(() => alert("Nomor disalin: " + text));
};

// --- Wizard Navigation Helpers ---

window.selectService = function(el, id, name, price) {
    document.querySelectorAll('#services-container .selection-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    window.bookingData.serviceId = id;
    window.bookingData.serviceName = name;
    window.bookingData.servicePrice = price;
};

window.selectBarber = function(el, id, name) {
    document.querySelectorAll('#barbers-container .selection-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    window.bookingData.barberId = id;
    window.bookingData.barberName = name;
};

window.selectTime = function(el, time) {
    if (el.classList.contains('disabled')) return;
    document.querySelectorAll('.time-slot').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    window.bookingData.time = time;
};

window.nextStep = function(step) {
    if (step === 2 && !window.bookingData.serviceId) return alert("Pilih layanan dulu!");
    if (step === 3) {
        if (!window.bookingData.barberId) return alert("Pilih barber dulu!");
        generateTimeSlots();
    }
    if (step === 4) {
        const dateInput = document.getElementById('bookingDate').value;
        if (!dateInput) return alert("Pilih tanggal!");
        if (!window.bookingData.time) return alert("Pilih jam!");
        window.bookingData.date = dateInput;
        updateSummary();
    }
    showStep(step);
};

window.prevStep = function(step) { showStep(step); };

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    document.querySelectorAll('.step').forEach((el, idx) => {
        if (idx + 1 <= step) el.classList.add('active');
        else el.classList.remove('active');
    });
}

function updateSummary() {
    const sName = document.getElementById('summary-service-name');
    const sPrice = document.getElementById('summary-price-big');
    if(sName) sName.innerText = window.bookingData.serviceName;
    if(sPrice) sPrice.innerText = 'Rp ' + parseInt(window.bookingData.servicePrice).toLocaleString('id-ID');
}

// --- Data Loading ---

async function loadServices() {
    const container = document.getElementById('services-container');
    try {
        const res = await fetch(`${API_URL}/services`);
        const json = await res.json();
        if (json.data) {
            container.innerHTML = json.data.map(s => `
                <div class="selection-card" onclick="window.selectService(this, ${s.id}, '${s.name}', ${s.price})">
                    <div class="card-img-wrapper">
                        <img src="${s.image ? s.image : 'assets/images/default-service.jpg'}" style="width:100%;height:100%;object-fit:cover;" alt="${s.name}">
                    </div>
                    <div class="card-content">
                        <div class="card-title">${s.name}</div>
                        <div class="card-price">Rp ${parseInt(s.price).toLocaleString('id-ID')}</div>
                        <small>${s.duration} Menit</small>
                    </div>
                </div>
            `).join('');
        }
    } catch {}
}

async function loadBarbers() {
    const container = document.getElementById('barbers-container');
    try {
        const res = await fetch(`${API_URL}/barbers`);
        const json = await res.json();
        if (json.data) {
            container.innerHTML = json.data.map(b => `
                <div class="selection-card" onclick="window.selectBarber(this, ${b.id}, '${b.name}')">
                    <div class="card-img-wrapper">
                        <img src="${b.image ? b.image : 'https://ui-avatars.com/api/?name='+b.name}" style="width:100%;height:100%;object-fit:cover;" alt="${b.name}">
                    </div>
                    <div class="card-content">
                        <div class="card-title">${b.name}</div>
                        <small>Barber Pro</small>
                    </div>
                </div>
            `).join('');
        }
    } catch {}
}

function setupDateInput() {
    const el = document.getElementById('bookingDate');
    if (el) {
        el.min = new Date().toISOString().split('T')[0];
        el.addEventListener('change', () => {
            window.bookingData.time = null;
            document.querySelectorAll('.time-slot').forEach(e => e.classList.remove('selected'));
            checkBookedSlots();
        });
    }
}

function generateTimeSlots() {
    const container = document.getElementById('time-slots-container');
    let html = '';
    for (let i = 10; i <= 21; i++) {
        const t = `${i}:00`;
        html += `<div class="time-slot" id="slot-${t.replace(':','-')}" onclick="window.selectTime(this, '${t}')">${t}</div>`;
    }
    container.innerHTML = html;
    if (document.getElementById('bookingDate').value) checkBookedSlots();
}

async function checkBookedSlots() {
    const date = document.getElementById('bookingDate').value;
    if (!date || !window.bookingData.barberId) return;
    try {
        const res = await fetch(`${API_URL}/bookings/booked-slots?barber_id=${window.bookingData.barberId}&date=${date}`);
        const json = await res.json();
        if (json.success) json.data.forEach(t => {
            const el = document.getElementById(`slot-${t.substring(0,5).replace(':','-')}`);
            if (el) { el.classList.add('disabled'); el.onclick = null; }
        });
    } catch {}
}