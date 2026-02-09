const API_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadAdminHeader(); 
    setupGlobalEvents(); 
    setupAdminProfile(); 

    checkNotifications(); 
    setInterval(checkNotifications, 30000); 

    const path = window.location.pathname;

    if (path.includes('admin-dashboard.html')) {
        loadDashboardData();
    } 
    else if (path.includes('admin-services.html')) {
        loadServicesData();
        setupServiceForm();
    } 
    else if (path.includes('admin-barbers.html')) {
        loadBarbersData();
        setupBarberForm();
    }
    else if (path.includes('admin-users.html')) {
        loadUsersData();
    }
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Akses ditolak. Silakan login.");
        window.location.href = '../login.html';
    }
}

function loadAdminHeader() {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            
            document.querySelectorAll('.user-name').forEach(el => {
                if (user.name) el.innerText = user.name;
            });

            if (user.profile_pic) {
                let imgUrl = user.profile_pic;
                if (!imgUrl.startsWith('http')) {
                    imgUrl = `${API_URL}/${user.profile_pic}`;
                }
                imgUrl += `?t=${new Date().getTime()}`;
                
                document.querySelectorAll('.user-profile img').forEach(img => {
                    img.src = imgUrl;
                });
                
                const preview = document.getElementById('previewPhoto');
                if (preview) preview.src = imgUrl;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

async function fetchAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            localStorage.clear();
            alert("Sesi berakhir. Silakan login kembali.");
            window.location.href = '../login.html';
            return null;
        }
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function setupAdminProfile() {
    const form = document.getElementById('editProfileForm');
    if (!form) return; 

    window.previewImage = function(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('previewPhoto').src = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('.btn-save');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            const name = document.getElementById('editName').value;
            const password = document.getElementById('editPassword').value;
            const file = document.getElementById('profilePhotoInput').files[0];

            if (name) formData.append('name', name);
            if (password) formData.append('password', password);
            if (file) formData.append('profile_pic', file);

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const json = await res.json();

            if (json.success) {
                localStorage.setItem('user', JSON.stringify(json.user));
                
                alert("Profil Admin Berhasil Diperbarui!");
                loadAdminHeader(); 
                
                document.getElementById('editPassword').value = '';
                closeModal('profileModal');
            } else {
                alert("Gagal: " + json.message);
            }

        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan koneksi.");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

async function checkNotifications() {
    try {
        const res = await fetchAuth(`${API_URL}/api/bookings/admin/notifications`);
        if (res) {
            const json = await res.json();
            const badge = document.getElementById('notif-badge');
            if (badge) {
                if (json.success && json.count > 0) {
                    badge.style.display = 'block'; 
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadDashboardData() {
    const tableBody = document.getElementById('recent-orders-table');
    if(!tableBody) return;

    try {
        const res = await fetchAuth(`${API_URL}/api/bookings/admin/all`);
        if (!res) return;
        const json = await res.json();

        if (json.success) {
            const bookings = json.data;
            updateStats(bookings);
            renderBookingTable(bookings, tableBody);
            renderCharts(bookings);
        }
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal koneksi server.</td></tr>`;
    }
}

function updateStats(bookings) {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const active = bookings.filter(b => b.status === 'confirmed').length;
    
    if(document.getElementById('val-total')) document.getElementById('val-total').innerText = total;
    if(document.getElementById('val-pending')) document.getElementById('val-pending').innerText = pending;
    if(document.getElementById('val-active')) document.getElementById('val-active').innerText = active;
}

function renderBookingTable(bookings, tableBody) {
    if (bookings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada data booking.</td></tr>`;
        return;
    }

    tableBody.innerHTML = bookings.map(b => {
        const dateStr = new Date(b.booking_date).toLocaleDateString('id-ID');
        const timeStr = b.booking_time ? b.booking_time.slice(0, 5) : '-';
        
        let statusClass = 'badge-pending';
        if (b.status === 'confirmed') statusClass = 'badge-confirmed';
        else if (b.status === 'completed') statusClass = 'badge-completed';
        else if (b.status === 'cancelled' || b.status === 'canceled') statusClass = 'badge-cancelled';

        let payMethod = '<span style="color:#7f8c8d"><i class="fas fa-money-bill"></i> Cash</span>';
        let proofBtn = '<span style="color:#ccc">-</span>';

        if (b.payment_method === 'online') {
            payMethod = '<span style="color:#3498db; font-weight:bold"><i class="fas fa-university"></i> Transfer</span>';
            if (b.payment_proof) {
                let imgUrl = b.payment_proof;
                if (!imgUrl.startsWith('http')) {
                    imgUrl = `${API_URL}/${b.payment_proof}`;
                }
                proofBtn = `<button class="btn-view-proof" onclick="showProof('${imgUrl}')"><i class="fas fa-eye"></i> Lihat</button>`;
            } else {
                proofBtn = '<span class="text-danger small">No Proof</span>';
            }
        }

        let actions = '-';
        if (b.status === 'pending') {
            actions = `
                <button class="btn-action btn-approve" onclick="updateStatus(${b.id}, 'confirmed')" title="Terima"><i class="fas fa-check"></i></button>
                <button class="btn-action btn-reject" onclick="updateStatus(${b.id}, 'cancelled')" title="Tolak"><i class="fas fa-times"></i></button>
            `;
        } else if (b.status === 'confirmed') {
            actions = `
                <button class="btn-action btn-approve" onclick="updateStatus(${b.id}, 'completed')" title="Selesai"><i class="fas fa-check-double"></i></button>
            `;
        }

        return `
            <tr>
                <td><strong>${dateStr}</strong><br><small>${timeStr}</small></td>
                <td>${b.customer_name || 'Guest'}<br><small>${b.customer_phone || '-'}</small></td>
                <td>${b.service_name}</td>
                <td>${payMethod}</td>
                <td>${proofBtn}</td>
                <td><span class="${statusClass}">${b.status}</span></td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function renderCharts(bookings) {
    if (!document.getElementById('weeklyChart') || typeof Chart === 'undefined') return;

    const dateCounts = {};
    bookings.forEach(b => {
        const d = new Date(b.booking_date).toISOString().split('T')[0];
        dateCounts[d] = (dateCounts[d] || 0) + 1;
    });
    const labels = Object.keys(dateCounts).sort().slice(-7);
    const data = labels.map(d => dateCounts[d]);

    const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
    if(window.myWeeklyChart) window.myWeeklyChart.destroy();

    window.myWeeklyChart = new Chart(ctxWeekly, {
        type: 'bar',
        data: {
            labels: labels.map(d => new Date(d).toLocaleDateString('id-ID', {day:'numeric', month:'short'})),
            datasets: [{
                label: 'Jumlah Booking',
                data: data,
                backgroundColor: '#f1c40f',
                borderRadius: 5
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const counts = {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status.includes('cancel')).length,
        completed: bookings.filter(b => b.status === 'completed').length
    };

    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    if(window.myStatusChart) window.myStatusChart.destroy();

    window.myStatusChart = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
            datasets: [{
                data: [counts.pending, counts.confirmed, counts.cancelled, counts.completed],
                backgroundColor: ['#f39c12', '#2ecc71', '#e74c3c', '#3498db'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
    });
}

async function loadServicesData() {
    const tbody = document.getElementById('services-table-body');
    if(!tbody) return;

    try {
        const res = await fetchAuth(`${API_URL}/api/services`);
        if (!res) return;
        const json = await res.json();
        if(json.data) {
            tbody.innerHTML = json.data.map(s => `
                <tr>
                    <td>#${s.id}</td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.description || '-'}</td>
                    <td>Rp ${parseInt(s.price).toLocaleString('id-ID')}</td>
                    <td>
                        <button class="btn-action btn-reject" onclick="deleteService(${s.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch(e) { console.error(e); }
}

function setupServiceForm() {
    const form = document.getElementById('addServiceForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('serviceName').value,
                price: document.getElementById('servicePrice').value,
                duration: document.getElementById('serviceDuration').value,
                description: document.getElementById('serviceDesc').value
            };

            try {
                const res = await fetchAuth(`${API_URL}/api/services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if(res && res.ok) {
                    alert("Service ditambahkan!");
                    closeModal('serviceModal');
                    loadServicesData();
                    form.reset();
                }
            } catch(e) { alert("Gagal tambah service"); }
        });
    }
}

window.deleteService = async function(id) {
    if(!confirm("Hapus layanan ini?")) return;
    try {
        const res = await fetchAuth(`${API_URL}/api/services/${id}`, {
            method: 'DELETE'
        });
        if(res && res.ok) loadServicesData();
    } catch(e) { alert("Gagal hapus"); }
};

async function loadBarbersData() {
    const tbody = document.getElementById('barbers-table-body');
    if(!tbody) return;

    try {
        const res = await fetchAuth(`${API_URL}/api/barbers`);
        if (!res) return;
        const json = await res.json();
        if(json.data) {
            tbody.innerHTML = json.data.map(b => `
                <tr>
                    <td>#${b.id}</td>
                    <td><strong>${b.name}</strong></td>
                    <td>${b.specialization || 'General'}</td>
                    <td>${b.experience || '1'} Tahun</td>
                    <td>
                        <button class="btn-action btn-reject" onclick="deleteBarber(${b.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch(e) { console.error(e); }
}

function setupBarberForm() {
    const form = document.getElementById('addBarberForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('barberName').value,
                specialization: document.getElementById('barberSpec').value,
                experience: document.getElementById('barberExp').value
            };

            try {
                const res = await fetchAuth(`${API_URL}/api/barbers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if(res && res.ok) {
                    alert("Barber ditambahkan!");
                    closeModal('barberModal');
                    loadBarbersData();
                    form.reset();
                }
            } catch(e) { alert("Gagal tambah barber"); }
        });
    }
}

window.deleteBarber = async function(id) {
    if(!confirm("Hapus barber ini?")) return;
    try {
        const res = await fetchAuth(`${API_URL}/api/barbers/${id}`, {
            method: 'DELETE'
        });
        if(res && res.ok) loadBarbersData();
    } catch(e) { alert("Gagal hapus"); }
};

async function loadUsersData() {
    const tbody = document.getElementById('users-table-body');
    if(!tbody) return;

    try {
        const res = await fetchAuth(`${API_URL}/api/auth`);
        if (!res) return;
        const json = await res.json();

        if (json.success && json.data) {
            tbody.innerHTML = json.data.map(u => `
                <tr>
                    <td>
                        <div style="font-weight:bold;">${u.name}</div>
                        <small style="color:#aaa;">${u.email}</small>
                    </td>
                    <td>${u.phone || '-'}</td>
                    <td>
                        <span style="background:${u.membership_status === 'active' ? '#2ecc7120' : '#f39c1220'}; color:${u.membership_status === 'active' ? '#2ecc71' : '#f39c12'}; padding:4px 8px; border-radius:4px; font-size:0.8rem;">
                            ${u.membership_status === 'active' ? 'Member VIP' : 'Regular'}
                        </span>
                    </td>
                    <td>${new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4">Belum ada user.</td></tr>';
        }
    } catch(e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Gagal memuat data user.</td></tr>';
    }
}

function setupGlobalEvents() {
    window.toggleDropdown = function(id) {
        const el = document.getElementById(id);
        if(el) el.style.display = (el.style.display === 'block') ? 'none' : 'block';
    };
    
    window.onclick = function(event) {
        if (!event.target.closest('.user-profile')) {
            const dd = document.getElementById('profileDropdown');
            if (dd) dd.style.display = 'none';
        }
    };

    window.openModal = function(id) { 
        const modal = document.getElementById(id);
        if(modal) modal.style.display = 'flex'; 
    };
    window.closeModal = function(id) { 
        const modal = document.getElementById(id);
        if(modal) modal.style.display = 'none'; 
    };
    
    window.logout = function() {
        if(confirm("Yakin ingin keluar?")) {
            localStorage.clear();
            window.location.href = '../login.html';
        }
    };

    window.showProof = function(url) {
        const img = document.getElementById('proofImgDisplay');
        const modal = document.getElementById('proofModal');
        if(img && modal) {
            img.src = url;
            modal.style.display = 'flex';
        }
    };
    
    window.updateStatus = async function(id, status) {
        if(!confirm(`Ubah status jadi ${status}?`)) return;
        try {
            const res = await fetchAuth(`${API_URL}/api/bookings/admin/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if(res && res.ok) {
                alert("Berhasil!");
                loadDashboardData();
                checkNotifications(); 
            } else {
                alert("Gagal update.");
            }
        } catch(e) { console.error(e); }
    };

    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        if (tabName === 'booking') {
            const btn = document.querySelector('.tab-btn:nth-child(1)');
            if(btn) btn.classList.add('active');
            document.getElementById('tab-booking').classList.add('active');
        } else {
            const btn = document.querySelector('.tab-btn:nth-child(2)');
            if(btn) btn.classList.add('active');
            document.getElementById('tab-membership').classList.add('active');
            loadMembershipRequests();
        }
    };
    
    window.loadMembershipRequests = async function() {
        const tbody = document.getElementById('membership-request-list');
        if(!tbody) return;
        try {
            const res = await fetchAuth(`${API_URL}/api/auth/pending-memberships`);
            if (!res) return;
            const json = await res.json();

            if (json.success && json.data.length > 0) {
                tbody.innerHTML = json.data.map(u => {
                    let imgPath = u.payment_proof;
                    if (imgPath && !imgPath.startsWith('http')) {
                        imgPath = `${API_URL}/${u.payment_proof}`;
                    }
                    
                    return `
                        <tr>
                            <td>${new Date(u.updated_at).toLocaleDateString('id-ID')}</td>
                            <td>${u.name}<br><small>${u.email}</small></td>
                            <td>
                                <button class="btn-view-proof" onclick="showProof('${imgPath}')">
                                    <i class="fas fa-eye"></i> Lihat
                                </button>
                            </td>
                            <td><span class="badge-pending">Menunggu</span></td>
                            <td>
                                <button class="btn-action btn-approve" onclick="processMembership(${u.id}, 'approve')"><i class="fas fa-check"></i></button>
                                <button class="btn-action btn-reject" onclick="processMembership(${u.id}, 'reject')"><i class="fas fa-times"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Tidak ada pengajuan membership.</td></tr>';
            }
        } catch(e) { console.error(e); }
    };
    
    window.processMembership = async function(userId, action) {
        if(!confirm(`Proses membership user ini?`)) return;
        
        try {
            const res = await fetchAuth(`${API_URL}/api/auth/verify-membership`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action })
            });
            if(res && res.ok) { alert("Berhasil!"); loadMembershipRequests(); }
        } catch(e) { alert("Error."); }
    };

    window.refreshData = function() {
        const path = window.location.pathname;
        if (path.includes('dashboard')) {
            loadDashboardData();
            checkNotifications();
            if (document.getElementById('tab-membership').classList.contains('active')) loadMembershipRequests();
        } else if (path.includes('services')) {
            loadServicesData();
        } else if (path.includes('barbers')) {
            loadBarbersData();
        } else if (path.includes('users')) {
            loadUsersData();
        }
    };
}