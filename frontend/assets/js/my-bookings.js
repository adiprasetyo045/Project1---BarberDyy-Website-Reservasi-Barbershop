const API_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoadUser();
    loadBookings();
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
    const userNameEl = document.getElementById('navUserName');
    if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

    const avatarEl = document.getElementById('navAvatar');
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
            avatarEl.style.background = 'transparent';
            avatarEl.style.border = 'none';
        } else {
            avatarEl.textContent = initial;
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

async function loadBookings() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('bookingsTableBody');

    try {
        const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const json = await res.json();

        if (json.success) {
            if (json.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; padding: 40px; color: #888;">
                            <i class="far fa-calendar-times" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
                            Belum ada riwayat booking.<br>
                            <a href="booking.html" style="color:var(--primary); text-decoration:none;">Buat Booking Sekarang</a>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = json.data.map(b => {
                const dateObj = new Date(b.booking_date);
                const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                
                let statusClass = 'badge-pending';
                if (b.status === 'confirmed') statusClass = 'badge-confirmed';
                if (b.status === 'completed') statusClass = 'badge-completed';
                if (b.status === 'cancelled') statusClass = 'badge-cancelled';

                let paymentInfo = '<span style="color:#aaa;"><i class="fas fa-money-bill-wave"></i> Cash</span>';
                if (b.payment_method === 'online') {
                    paymentInfo = '<span style="color:#3498db;"><i class="fas fa-university"></i> Transfer</span>';
                }

                // Tombol Batalkan hanya muncul jika status Pending
                let actionBtn = '';
                if (b.status === 'pending') {
                    actionBtn = `
                        <button class="btn-cancel-booking" onclick="cancelBooking(${b.id})">
                            <i class="fas fa-times"></i> Batal
                        </button>
                    `;
                }

                return `
                    <tr>
                        <td>
                            <div style="font-weight:bold; color:#fff;">${dateStr}</div>
                            <div style="font-size:0.85rem; color:#888;"><i class="far fa-clock"></i> ${b.booking_time} WIB</div>
                        </td>
                        <td>${b.service_name}</td>
                        <td>${b.barber_name}</td>
                        <td style="color:var(--primary); font-weight:bold;">Rp ${parseInt(b.price).toLocaleString('id-ID')}</td>
                        <td>${paymentInfo}</td>
                        <td><span class="badge ${statusClass}">${b.status}</span></td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat data.</td></tr>`;
        }

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Terjadi kesalahan koneksi.</td></tr>`;
    }
}

async function cancelBooking(id) {
    if (!confirm("Yakin ingin membatalkan booking ini?")) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/api/bookings/cancel/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const json = await res.json();
        if (json.success) {
            alert("Booking berhasil dibatalkan.");
            loadBookings(); // Reload data
        } else {
            alert("Gagal: " + json.message);
        }
    } catch (e) {
        alert("Terjadi kesalahan server.");
    }
}

function logout() {
    if(confirm("Yakin ingin keluar?")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}