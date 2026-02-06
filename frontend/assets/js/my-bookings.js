// Konfigurasi URL API
const API_URL = 'https://project1-barber-dyy-website-reservasi-barbershop-l0xeswl4b.const API_URL = ''/api';

document.addEventListener('DOMContentLoaded', () => {
    // 1. CEK LOGIN (GUNAKAN localStorage)
    const token = localStorage.getItem('token');
    
    // Jika token tidak ada, tendang ke login
    if (!token) {
        alert("Sesi habis. Silakan login kembali.");
        window.location.href = 'login.html';
        return;
    }

    // 2. LOAD DATA USER (Avatar & Nama)
    loadUserData();

    // 3. LOAD DATA TABLE
    loadBookingHistory(token);
});

// --- FUNGSI 1: LOAD USER DATA ---
function loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            
            // Update Nama
            const nameEl = document.getElementById('navUserName'); 
            if (nameEl) nameEl.textContent = user.name.split(' ')[0];

            // Update Avatar
            const avatarEl = document.getElementById('navAvatar');
            if (avatarEl) {
                if (user.profile_pic && !user.profile_pic.includes('default')) {
                    const imgSrc = user.profile_pic.startsWith('http') ? user.profile_pic : `https://project1-barber-dyy-website-reservasi-barbershop-l0xeswl4b.const API_URL = ''/${user.profile_pic}`;
                    avatarEl.innerHTML = `<img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover; border-radius: 50%;">`;
                } else {
                    avatarEl.textContent = user.name.charAt(0).toUpperCase();
                }
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    }
}

// --- FUNGSI 2: AMBIL DATA HISTORY ---
function loadBookingHistory(token) {
    const tableBody = document.getElementById('bookingsTableBody');

    // Show loading state initially (Adjusted colspan to 7)
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center; padding: 50px; color: #666;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 10px; color: #f1c40f;"></i>
                <br>Sedang memuat data...
            </td>
        </tr>
    `;

    fetch(`${API_URL}/bookings/my-bookings`, { 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) {
            if(res.status === 401 || res.status === 403) {
                alert("Sesi habis. Silakan login ulang.");
                localStorage.clear();
                window.location.href = 'login.html';
                return; 
            }
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(response => {
        if (response.success && response.data.length > 0) {
            tableBody.innerHTML = ''; 
            
            // Urutkan dari yang terbaru (berdasarkan ID descending)
            const sortedData = response.data.sort((a, b) => b.id - a.id);

            sortedData.forEach(booking => {
                // A. Format Tanggal (Indonesia)
                const dateObj = new Date(booking.booking_date);
                const formattedDate = dateObj.toLocaleDateString('id-ID', { 
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                });
                
                // B. Format Jam
                const formattedTime = booking.booking_time ? booking.booking_time.slice(0, 5) : '-';

                // C. Tentukan Class Badge Status
                let badgeClass = 'badge-pending'; 
                const status = booking.status ? booking.status.toLowerCase() : 'pending';

                if (status === 'confirmed') badgeClass = 'badge-confirmed';
                else if (status === 'completed') badgeClass = 'badge-completed';
                else if (status === 'canceled' || status === 'cancelled') badgeClass = 'badge-cancelled';

                // D. Format Harga
                let rawPrice = booking.total_price || booking.price || 0;
                if (!rawPrice && booking.service_price) rawPrice = booking.service_price;
                let formattedPrice = "Rp " + parseInt(rawPrice).toLocaleString('id-ID');

                // E. Badge Pembayaran (NEW)
                let paymentBadge = '';
                if(booking.payment_method === 'online') {
                    paymentBadge = `<span style="color:#3b82f6; font-weight:600; font-size:0.85rem;"><i class="fas fa-university"></i> Transfer</span>`;
                } else {
                    paymentBadge = `<span style="color:#94a3b8; font-size:0.85rem;"><i class="fas fa-money-bill"></i> Cash</span>`;
                }

                // F. Tombol Aksi (Hanya muncul jika Pending)
                let actionBtn = '';
                if(status === 'pending') {
                    actionBtn = `
                        <button class="btn-cancel-booking" onclick="cancelBooking(${booking.id})">
                            <i class="fas fa-times"></i> Batal
                        </button>
                    `;
                }

                // G. Render Baris Tabel (KOLOM SESUAI HTML HEADER)
                const row = `
                    <tr>
                        <td>
                            <div style="font-weight:600; color:#fff;">${formattedDate}</div>
                            <div style="font-size:0.85rem; color:#888; margin-top:4px;">
                                <i class="fas fa-clock"></i> ${formattedTime} WIB
                            </div>
                        </td>
                        <td style="color:#fff; font-weight:500;">${booking.service_name || '-'}</td>
                        <td style="color:#aaa;">${booking.barber_name || '-'}</td>
                        <td style="font-weight:bold; color:#f1c40f;">${formattedPrice}</td>
                        
                        <td>${paymentBadge}</td>
                        
                        <td>
                            <span class="badge ${badgeClass}">
                                ${status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                        </td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } else {
            // Tampilan Jika Kosong (Adjusted colspan to 7)
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:60px 20px; color:#666;">
                        <i class="fas fa-calendar-times" style="font-size:3rem; margin-bottom:15px; opacity:0.3;"></i>
                        <p style="font-size:1rem;">Belum ada riwayat booking.</p>
                        <a href="booking.html" style="color:#f1c40f; font-weight:bold; text-decoration:none; margin-top:10px; display:inline-block;">
                            Buat Booking Baru &rarr;
                        </a>
                    </td>
                </tr>`;
        }
    })
    .catch(err => {
        console.error("Error fetching booking history:", err);
        // Adjusted colspan to 7
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:#ef4444; padding:30px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:1.5rem; margin-bottom:10px;"></i><br>
                    Gagal memuat data. Pastikan server backend menyala.<br>
                    <small>${err.message}</small>
                </td>
            </tr>`;
    });
}

// --- FUNGSI 3: INTERAKSI NAVBAR (Dropdown & Logout) ---
// Exposed to window so HTML onclick works
window.toggleDropdown = function() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    }
};

window.logout = function() {
    if(confirm("Yakin ingin keluar?")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
};

// Fungsi Batal Booking
window.cancelBooking = function(id) {
    if(!confirm("Yakin ingin membatalkan booking ini?")) return;

    const token = localStorage.getItem('token');
    fetch(`${API_URL}/bookings/${id}/cancel`, { 
        method: 'PUT', 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(json => {
        if(json.success) {
            alert("Booking berhasil dibatalkan.");
            loadBookingHistory(token); // Reload data
        } else {
            alert("Gagal: " + json.message);
        }
    })
    .catch(err => {
        alert("Fitur pembatalan belum tersedia di server atau terjadi kesalahan.");
        console.error(err);
    });
};

// Tutup dropdown jika klik di luar
window.onclick = function(event) {
    if (!event.target.closest('.user-dropdown')) {
        const menu = document.getElementById('userMenu');
        if (menu) menu.style.display = 'none';
    }
};