const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        alert("Sesi habis atau Anda belum login.");
        window.location.href = 'login.html';
        return;
    }

    const localUser = JSON.parse(userStr);

    loadUserData(localUser);
    loadUserStats(token);
    
    syncLatestUserData(token); 

    const btnJoin = document.getElementById('btnJoinMember');
    if (btnJoin) {
        btnJoin.onclick = openPaymentModal;
    }
});

async function syncLatestUserData(token) {
    try {
        const res = await fetch(`${API_URL}/users/profile`, { 
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            const json = await res.json();
            if (json.success) {
                localStorage.setItem('user', JSON.stringify(json.data));
                loadUserData(json.data);
            }
        }
    } catch (e) {
        console.error("Gagal sinkronisasi data user:", e);
    }
}

function loadUserData(user) {
    try {
        setText('navUserName', user.name.split(' ')[0]);
        setText('dashboardUserName', user.name);
        setText('dashboardUserEmail', user.email);
        setText('dashboardUserPhone', user.phone || '-');

        if (user.profile_pic && !user.profile_pic.includes('default')) {
            const imgHTML = `<img src="http://localhost:3000/${user.profile_pic}" style="width:100%; height:100%; object-fit:cover;">`;
            setHTML('navAvatar', imgHTML);
            setHTML('cardAvatar', imgHTML);
        } else {
            const initial = user.name.charAt(0).toUpperCase();
            setText('navAvatar', initial);
            setHTML('cardAvatar', `<span class="avatar-text">${initial}</span>`);
        }

        const status = (user.membership_status || 'inactive').toLowerCase();

        const badge = document.getElementById('memberBadgeStatus');
        const statusText = document.getElementById('memberStatusText');
        const joinArea = document.getElementById('joinMemberArea');
        const activeArea = document.getElementById('activeMemberArea');

        if (joinArea) joinArea.style.display = 'none';
        if (activeArea) activeArea.style.display = 'none';

        if (status === 'active') {
            if (badge) {
                badge.textContent = "GOLD MEMBER";
                badge.style.background = "linear-gradient(45deg, #d4af37, #f1c40f)";
                badge.style.color = "#000";
                badge.style.border = "none";
            }
            if (statusText) statusText.innerHTML = '<span style="color:#f1c40f; font-weight:bold;">Premium</span>';
            if (activeArea) activeArea.style.display = 'block';

            if (user.membership_expiry) {
                const expDate = new Date(user.membership_expiry);
                setText('memberExpiryText', "Berlaku s.d: " + expDate.toLocaleDateString('id-ID'));
            }

        } else if (status === 'pending') {
            if (badge) {
                badge.textContent = "MENUNGGU KONFIRMASI";
                badge.style.background = "rgba(52, 152, 219, 0.2)";
                badge.style.color = "#3498db";
                badge.style.border = "1px solid #3498db";
            }
            if (statusText) statusText.innerHTML = '<span style="color:#3498db;">Verifikasi Admin</span>';

            if (joinArea) {
                joinArea.style.display = 'block';
                joinArea.innerHTML = `
                    <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px; border: 1px dashed #3498db; color: #ccc; font-size: 0.9rem;">
                        <i class="fas fa-envelope" style="color: #3498db; font-size: 1.2rem; margin-bottom: 5px;"></i><br>
                        Bukti sedang diperiksa. <b>Cek email Anda</b> untuk notifikasi persetujuan.
                    </div>
                `;
            }

        } else if (status === 'rejected') {
            if (badge) {
                badge.textContent = "PENGAJUAN DITOLAK";
                badge.style.background = "rgba(231, 76, 60, 0.2)"; 
                badge.style.color = "#e74c3c";
                badge.style.border = "1px solid #e74c3c";
            }
            if (statusText) statusText.innerHTML = '<span style="color:#e74c3c; font-weight:bold;">Ditolak</span>';

            if (joinArea) {
                joinArea.style.display = 'block';
                joinArea.innerHTML = `
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 15px; border-radius: 8px; border: 1px dashed #e74c3c; color: #e74c3c; font-size: 0.9rem; margin-bottom: 15px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 1.2rem; margin-bottom: 5px;"></i><br>
                        Mohon maaf, bukti pembayaran Anda <b>tidak valid atau ditolak admin</b>.<br>Silakan upload ulang bukti yang benar.
                    </div>
                    <button class="btn-primary" style="width: 100%; padding: 10px; font-size: 0.9rem; border:none; cursor:pointer; background: #e74c3c; color: #fff; border-radius: 8px; font-weight: bold;" onclick="openPaymentModal()">
                        <i class="fas fa-redo"></i> Ajukan Kembali
                    </button>
                `;
            }

        } else {
            if (badge) {
                badge.textContent = "NON MEMBER";
                badge.style.background = "#2a2a2a";
                badge.style.color = "#888";
                badge.style.border = "1px solid #444";
            }
            if (statusText) statusText.textContent = "Regular User";

            if (joinArea) {
                joinArea.style.display = 'block';
                joinArea.innerHTML = `
                    <p style="font-size: 0.8rem; color: #aaa; margin-bottom: 10px;">Diskon 20% & Prioritas Booking!</p>
                    <button class="btn-primary" style="width: 100%; padding: 10px; font-size: 0.9rem; border:none; cursor:pointer; background: #f1c40f; color: #000; border-radius: 8px; font-weight: bold;" onclick="openPaymentModal()">Upgrade Member (Rp 50k)</button>
                `;
            }
        }

    } catch (e) {
        console.error("Gagal memuat data user:", e);
    }
}

function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    }
}

function selectMethod(method, element) {
    document.querySelectorAll('.method-item').forEach(el => el.classList.remove('active'));
    document.getElementById('qrisContent').style.display = 'none';
    document.getElementById('bankContent').style.display = 'none';

    element.classList.add('active');

    if (method === 'qris') {
        document.getElementById('qrisContent').style.display = 'block';
    } else if (method === 'bank') {
        document.getElementById('bankContent').style.display = 'block';
    }

    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('btnConfirmPayment').style.display = 'block';
}

async function processPayment() {
    const fileInput = document.getElementById('paymentProofInput');
    const btn = document.getElementById('btnConfirmPayment');

    if (fileInput.files.length === 0) {
        alert("Harap upload foto bukti transfer terlebih dahulu!");
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim Bukti...';
    btn.disabled = true;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('payment_proof', fileInput.files[0]);

    try {
        const res = await fetch(`${API_URL}/auth/buy-membership`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const json = await res.json();

        if (json.success) {
            closePaymentModal();
            alert("✅ Bukti Terkirim!\nSilakan cek email Anda untuk konfirmasi penerimaan.");
            localStorage.setItem('user', JSON.stringify(json.user));
            loadUserData(json.user);
        } else {
            alert("Gagal: " + json.message);
        }

    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan koneksi.");
    } finally {
        btn.innerHTML = 'Kirim Bukti Pembayaran <i class="fas fa-paper-plane"></i>';
        btn.disabled = false;
    }
}

async function loadUserStats(token) {
    try {
        const res = await fetch(`${API_URL}/bookings/my-bookings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                alert("Sesi kadaluarsa. Silakan login ulang.");
                logout();
                return;
            }
            return;
        }

        const json = await res.json();

        if (json.success) {
            const bookings = json.data;
            const total = bookings.length;
            const upcoming = bookings.filter(b => {
                const s = b.status ? b.status.toLowerCase() : '';
                return s === 'pending' || s === 'confirmed';
            }).length;
            const completed = bookings.filter(b =>
                b.status && b.status.toLowerCase() === 'completed'
            ).length;

            animateValue("totalBookings", 0, total, 1000);
            animateValue("activeBookings", 0, upcoming, 1000);
            animateValue("completedBookings", 0, completed, 1000);

            renderUpcomingBooking(bookings);
        }
    } catch (err) {
        console.error("❌ Gagal load stats:", err);
    }
}

function renderUpcomingBooking(bookings) {
    const container = document.getElementById('upcomingBookingsContainer');
    if (!container) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeBookings = bookings.filter(b => {
        const s = b.status ? b.status.toLowerCase() : '';
        const bDate = new Date(b.booking_date);
        return (s === 'confirmed' || s === 'pending') && bDate >= today;
    }).sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));

    if (activeBookings.length > 0) {
        const next = activeBookings[0];
        const dateObj = new Date(next.booking_date);
        const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        let badgeStyle = "background: rgba(243, 156, 18, 0.2); color: #f39c12;";
        if (next.status.toLowerCase() === 'confirmed') {
            badgeStyle = "background: rgba(46, 204, 113, 0.2); color: #2ecc71;";
        }

        const primaryColor = '#f1c40f';

        container.innerHTML = `
            <div style="background: #252525; padding: 25px; border-radius: 12px; border-left: 5px solid ${primaryColor}; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h4 style="color:#fff; margin:0 0 5px 0; font-size:1.3rem;">${next.service_name}</h4>
                        <p style="color:#aaa; font-size:0.9rem; margin:0;">
                            <i class="fas fa-user-tie" style="color:${primaryColor}; margin-right:5px;"></i> Barber: <strong>${next.barber_name}</strong>
                        </p>
                    </div>
                    <span style="${badgeStyle} padding:5px 12px; border-radius:50px; font-weight:700; font-size:0.75rem; text-transform:uppercase;">
                        ${next.status}
                    </span>
                </div>
                <div style="background:#2a2a2a; padding:15px; border-radius:8px; display:flex; gap:20px; align-items:center; color:#ddd; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-calendar-alt" style="color:${primaryColor};"></i> ${dateStr}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-clock" style="color:${primaryColor};"></i> Jam ${next.booking_time}
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; border: 2px dashed #333; border-radius: 12px; color: #666;">
                <i class="fas fa-cut" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p style="margin-bottom:20px;">Belum ada jadwal cukur mendatang.</p>
                <a href="booking.html" style="background:${'#f1c40f'}; color:#000; text-decoration:none; padding: 10px 20px; border-radius:5px; font-weight:bold; display:inline-block;">+ Booking Sekarang</a>
            </div>
        `;
    }
}

function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function logout() {
    if (confirm("Yakin ingin keluar?")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}