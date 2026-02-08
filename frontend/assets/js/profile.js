const API_URL = ''; // ✅ Link kosong agar otomatis ke server sendiri

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfileData();
    setupFormListener();
});

// 1. CEK AUTH
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Sesi habis, silakan login kembali.");
        window.location.href = 'login.html';
    }
}

// 2. LOAD DATA USER (Isi Form & Avatar)
function loadProfileData() {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        
        // Isi Input Form
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        if(nameInput) nameInput.value = user.name || '';
        if(emailInput) emailInput.value = user.email || '';
        if(phoneInput) phoneInput.value = user.phone || '';
        
        // Load Avatar
        renderAvatar(user);
    } catch (e) {
        console.error("Gagal load profile:", e);
    }
}

// Helper: Tampilkan Avatar
function renderAvatar(user) {
    const container = document.getElementById('avatarContainer');
    const preview = document.getElementById('avatarPreview'); // ID image tag di HTML

    // Jika user punya foto dan bukan null/default
    if (user.profile_pic && !user.profile_pic.includes('default')) {
        // 👇 PERBAIKAN: Membersihkan URL gambar
        // Kita asumsikan path dari database sudah 'uploads/...' atau path relatif yang benar
        // Tambahkan timestamp ?t=... agar browser tidak cache gambar lama
        const imgUrl = `${API_URL}/${user.profile_pic}?t=${new Date().getTime()}`;
        
        if (preview) {
            preview.src = imgUrl; // Update src img yang sudah ada
        } else if (container) {
            // Jika container kosong, buat img baru
            container.innerHTML = `<img src="${imgUrl}" class="avatar-preview" id="avatarPreview">`;
        }
    } else {
        // Tampilkan Inisial jika tidak ada foto
        if (container) {
            const initial = (user.name || 'U').charAt(0).toUpperCase();
            container.innerHTML = `<span class="avatar-initial">${initial}</span>`;
        }
    }
}

// 3. SETUP FORM & PREVIEW GAMBAR
function setupFormListener() {
    // A. Preview Gambar saat file dipilih
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const container = document.getElementById('avatarContainer');
                    // Ganti isi container dengan gambar preview lokal
                    container.innerHTML = `<img src="${e.target.result}" class="avatar-preview" id="avatarPreview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // B. Submit Form (Gabungan Data & Foto)
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.querySelector('.btn-save');
            // Pastikan tombol ada sebelum diakses
            if (!btn) return;

            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
            btn.disabled = true;

            try {
                // Gunakan FormData untuk kirim File + Text
                const formData = new FormData();
                
                const name = document.getElementById('name').value;
                const phone = document.getElementById('phone').value;
                const password = document.getElementById('password').value;
                const fileElement = document.getElementById('imageUpload');
                const file = fileElement ? fileElement.files[0] : null;

                formData.append('name', name);
                formData.append('phone', phone);
                if (password) formData.append('password', password);
                if (file) formData.append('profile_pic', file);

                const token = localStorage.getItem('token');

                // 👇 PERBAIKAN: Tambahkan '/api' di sini
                const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                        // JANGAN set Content-Type, biar browser set multipart/form-data otomatis
                    },
                    body: formData
                });

                const json = await res.json();

                if (json.success) {
                    // Update LocalStorage dengan data user terbaru
                    // Pastikan json.user atau json.data sesuai respon backend
                    const userData = json.user || json.data; 
                    if (userData) {
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                    
                    alert("✅ Profil berhasil diperbarui!");
                    
                    // Reset field password & reload tampilan
                    const passInput = document.getElementById('password');
                    if(passInput) passInput.value = '';
                    
                    loadProfileData(); 
                    window.location.reload(); // Reload halaman agar avatar di navbar juga berubah
                } else {
                    alert("Gagal: " + (json.message || "Terjadi kesalahan"));
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
}