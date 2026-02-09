const API_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfileData();
    setupFormListener();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Sesi habis, silakan login kembali.");
        window.location.href = 'login.html';
    }
}

function loadProfileData() {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        if(nameInput) nameInput.value = user.name || '';
        if(emailInput) emailInput.value = user.email || '';
        if(phoneInput) phoneInput.value = user.phone || '';
        
        renderAvatar(user);
    } catch (e) {
        console.error(e);
    }
}

function renderAvatar(user) {
    const container = document.getElementById('avatarContainer');
    const preview = document.getElementById('avatarPreview');

    if (user.profile_pic && !user.profile_pic.includes('default')) {
        const imgUrl = `${API_URL}/${user.profile_pic}?t=${new Date().getTime()}`;
        
        if (preview) {
            preview.src = imgUrl;
        } else if (container) {
            container.innerHTML = `<img src="${imgUrl}" class="avatar-preview" id="avatarPreview">`;
        }
    } else {
        if (container) {
            const initial = (user.name || 'U').charAt(0).toUpperCase();
            container.innerHTML = `<span class="avatar-initial">${initial}</span>`;
        }
    }
}

function setupFormListener() {
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const container = document.getElementById('avatarContainer');
                    container.innerHTML = `<img src="${e.target.result}" class="avatar-preview" id="avatarPreview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.querySelector('.btn-save');
            if (!btn) return;

            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
            btn.disabled = true;

            try {
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

                const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: formData
                });

                const json = await res.json();

                if (json.success) {
                    const userData = json.user || json.data; 
                    if (userData) {
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                    
                    alert("✅ Profil berhasil diperbarui!");
                    
                    const passInput = document.getElementById('password');
                    if(passInput) passInput.value = '';
                    
                    loadProfileData(); 
                    window.location.reload(); 
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