const API_URL = 'https://project1-barber-dyy-website-reservasi-barbershop-l0xeswl4b.const API_URL = ''/api';

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
}

// Helper: Tampilkan Avatar
function renderAvatar(user) {
    const container = document.getElementById('avatarContainer');
    const preview = document.getElementById('avatarPreview'); // ID image tag di HTML

    // Jika user punya foto dan bukan null
    if (user.profile_pic && !user.profile_pic.includes('default')) {
        const imgUrl = `https://project1-barber-dyy-website-reservasi-barbershop-l0xeswl4b.const API_URL = ''/${user.profile_pic}?t=${new Date().getTime()}`;
        
        if (preview) {
            preview.src = imgUrl; // Update src img yang sudah ada
        } else if (container) {
            // Jika container kosong, buat img baru
            container.innerHTML = `<img src="${imgUrl}" class="avatar-preview" id="avatarPreview">`;
        }
    } else {
        // Tampilkan Inisial
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
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
            btn.disabled = true;

            try {
                // Gunakan FormData untuk kirim File + Text
                const formData = new FormData();
                
                const name = document.getElementById('name').value;
                const phone = document.getElementById('phone').value;
                const password = document.getElementById('password').value;
                const file = document.getElementById('imageUpload').files[0];

                formData.append('name', name);
                formData.append('phone', phone);
                if (password) formData.append('password', password);
                if (file) formData.append('profile_pic', file);

                const token = localStorage.getItem('token');

                // Fetch ke Endpoint PUT /update-profile
                const res = await fetch(`${API_URL}/auth/update-profile`, {
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
                    localStorage.setItem('user', JSON.stringify(json.user));
                    
                    alert("✅ Profil berhasil diperbarui!");
                    
                    // Reset field password & reload tampilan
                    document.getElementById('password').value = '';
                    loadProfileData(); 
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
}