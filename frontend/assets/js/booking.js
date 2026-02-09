const API_URL = '';

window.bookingData = {
    serviceId: null,
    serviceName: '',
    servicePrice: 0,
    barberId: null,
    barberName: '',
    date: null,
    time: null,
    paymentMethod: 'offline'
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoadUser();
    loadServices();
    loadBarbers(); 
    setupDateInput();
});

async function checkAuthAndLoadUser() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/users/profile`, { 
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            const json = await res.json();
            if (json.success) {
                const user = json.data;
                localStorage.setItem('user', JSON.stringify(user));
                renderUserHeader(user);
            }
        } else {
            const localUser = localStorage.getItem('user');
            if (localUser) renderUserHeader(JSON.parse(localUser));
        }
    } catch (e) {
        const localUser = localStorage.getItem('user');
        if (localUser) renderUserHeader(JSON.parse(localUser));
    }
}

function renderUserHeader(user) {
    const userNameEl = document.querySelector('.user-profile span');
    if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

    const avatarEl = document.querySelector('.user-profile .avatar');
    if (avatarEl) {
        const initial = user.name.charAt(0).toUpperCase();
        
        if (user.profile_pic && !user.profile_pic.includes('default')) {
            let imgUrl = user.profile_pic;
            if (!imgUrl.startsWith('http')) {
                imgUrl = `${API_URL}/${imgUrl}`;
            }
            imgUrl += `?t=${new Date().getTime()}`;

            avatarEl.innerHTML = `
                <img src="${imgUrl}" 
                     style="width:100%; height:100%; object-fit:cover; border-radius:50%;"
                     onerror="this.parentElement.innerHTML='${initial}'" 
                >
            `;
            avatarEl.classList.remove('avatar-initial'); 
        } else {
            avatarEl.style.backgroundColor = '#f1c40f';
            avatarEl.style.color = '#000';
            avatarEl.style.display = 'flex';
            avatarEl.style.alignItems = 'center';
            avatarEl.style.justifyContent = 'center';
            avatarEl.style.fontWeight = 'bold';
            avatarEl.innerHTML = initial;
        }
    }
}

window.submitBooking = async function() {
    const token = localStorage.getItem('token');
    const submitBtn = document.querySelector('#btnSubmitBooking');
    
    if (!window.bookingData.serviceId || !window.bookingData.barberId || !window.bookingData.date || !window.bookingData.time) {
        alert("Data booking tidak lengkap. Silakan ulangi pilih layanan.");
        window.location.reload();
        return;
    }

    if (window.bookingData.paymentMethod === 'online') {
        const name = document.getElementById('sender_name').value.trim();
        const num = document.getElementById('sender_number').value.trim();
        const file = document.getElementById('payment_proof').files[0];

        if (!name || !num) return alert("Mohon lengkapi Nama & Nomor Pengirim!");
        if (!file) return alert("Mohon upload Bukti Transfer!");
    }

    if(!confirm("Apakah data pesanan sudah benar?")) return;
    
    const originalText = submitBtn ? submitBtn.innerHTML : 'Konfirmasi Booking';
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    }

    const fd = new FormData();
    fd.append('service_id', window.bookingData.serviceId);
    fd.append('barber_id', window.bookingData.barberId);
    fd.append('booking_date', window.bookingData.date);
    fd.append('booking_time', window.bookingData.time);
    fd.append('payment_method', window.bookingData.paymentMethod);

    if (window.bookingData.paymentMethod === 'online') {
        fd.append('payment_provider', document.getElementById('sender_name').value);
        fd.append('payment_account', document.getElementById('sender_number').value);
        fd.append('payment_proof', document.getElementById('payment_proof').files[0]);
    }

    try {
        const res = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
        });

        const json = await res.json();

        if (json.success) {
            alert("Booking Berhasil Dibuat!");
            window.location.href = 'my-bookings.html';
        } else {
            throw new Error(json.message || "Gagal membuat booking");
        }

    } catch (err) {
        console.error("Error Submit:", err);
        alert("Terjadi kesalahan: " + err.message);
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
};

window.selectPayment = function(method, el) {
    window.bookingData.paymentMethod = method;

    document.querySelectorAll('.payment-card').forEach(c => {
        c.classList.remove('selected');
        c.style.border = '1px solid #444';
        c.style.background = '#252525';
    });
    
    if(el) {
        el.classList.add('selected');
        el.style.border = '2px solid #fbbf24'; 
        el.style.background = 'rgba(251, 191, 36, 0.1)';
    }

    const onlineArea = document.getElementById('online-payment-area');
    if (onlineArea) {
        if (method === 'online') {
            onlineArea.style.display = 'block';
            
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

window.selectService = function(el, id, name, price) {
    const cards = document.querySelectorAll('#services-container .selection-card');
    cards.forEach(c => c.classList.remove('selected'));
    
    el.classList.add('selected');
    window.bookingData.serviceId = id;
    window.bookingData.serviceName = name;
    window.bookingData.servicePrice = price;
};

window.selectBarber = function(el, id, name) {
    const cards = document.querySelectorAll('#barbers-container .selection-card');
    cards.forEach(c => c.classList.remove('selected'));
    
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
    // 1. Sembunyikan semua Form
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    
    // 2. Tampilkan Form yang dipilih
    const stepEl = document.getElementById(`step${step}`);
    if(stepEl) stepEl.classList.add('active');
    
    // 3. Update Indikator (Sekarang pakai ID indicatorX)
    document.querySelectorAll('.step').forEach((el, idx) => {
        el.classList.remove('active', 'completed'); // Reset dulu
        if (idx + 1 === step) el.classList.add('active');
        else if (idx + 1 < step) el.classList.add('completed');
    });
}

function updateSummary() {
    const sName = document.getElementById('summary-service-name');
    const sPrice = document.getElementById('summary-price-big');
    if(sName) sName.innerText = window.bookingData.serviceName;
    if(sPrice) sPrice.innerText = 'Rp ' + parseInt(window.bookingData.servicePrice).toLocaleString('id-ID');
}

async function loadServices() {
    const container = document.getElementById('services-container');
    if(!container) return;
    try {
        const res = await fetch(`${API_URL}/api/services`);
        const json = await res.json();
        
        if (json.data && json.data.length > 0) {
            container.innerHTML = json.data.map(s => {
                let imgSrc = s.image || 'assets/images/default-service.jpg';
                if(s.image && !s.image.startsWith('http')) {
                    imgSrc = `${API_URL}/${s.image}`;
                }
                
                return `
                <div class="selection-card" onclick="window.selectService(this, ${s.id}, '${s.name}', ${s.price})">
                    <div class="card-img-wrapper">
                        <img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='assets/images/default-service.jpg'" alt="${s.name}">
                    </div>
                    <div class="card-content">
                        <div class="card-title">${s.name}</div>
                        <div class="card-price">Rp ${parseInt(s.price).toLocaleString('id-ID')}</div>
                        <small>${s.duration} Menit</small>
                    </div>
                </div>
            `}).join('');
        } else {
            container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#888;">Belum ada layanan tersedia.</p>`;
        }
    } catch(e) { 
        console.error(e); 
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal memuat layanan. Coba refresh.</p>`;
    }
}

async function loadBarbers() {
    const container = document.getElementById('barbers-container');
    if(!container) return;
    try {
        const res = await fetch(`${API_URL}/api/barbers`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
            container.innerHTML = json.data.map(b => {
                let imgSrc = b.image || `https://ui-avatars.com/api/?name=${b.name}&background=random`;
                if(b.image && !b.image.startsWith('http')) {
                    imgSrc = `${API_URL}/${b.image}`;
                }

                return `
                <div class="selection-card" onclick="window.selectBarber(this, ${b.id}, '${b.name}')">
                    <div class="card-img-wrapper">
                        <img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=${b.name}'" alt="${b.name}">
                    </div>
                    <div class="card-content">
                        <div class="card-title">${b.name}</div>
                        <small>Barber Pro</small>
                    </div>
                </div>
            `}).join('');
        } else {
             container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#888;">Belum ada barber tersedia.</p>`;
        }
    } catch(e) { console.error(e); }
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
    if(!container) return;
    
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
        const res = await fetch(`${API_URL}/api/bookings/booked-slots?barber_id=${window.bookingData.barberId}&date=${date}`);
        const json = await res.json();
        if (json.success) json.data.forEach(t => {
            const el = document.getElementById(`slot-${t.substring(0,5).replace(':','-')}`);
            if (el) { el.classList.add('disabled'); el.onclick = null; }
        });
    } catch {}
}