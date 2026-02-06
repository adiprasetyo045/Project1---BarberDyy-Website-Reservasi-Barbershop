const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // [PENTING] Hapus sesi lama saat membuka halaman login
    // Ini mencegah user "nyangkut" di akun lama saat kembali ke halaman ini
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;
            const btnSubmit = loginForm.querySelector('button');
            
            // Simpan teks asli dan ubah status tombol jadi loading
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            btnSubmit.disabled = true;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const res = await response.json();

                if (res.success) {
                    // 1. Simpan Token & Data User
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));

                    alert(`Login Berhasil! Selamat datang, ${res.user.name}`);

                    // 2. Redirect Berdasarkan Role
                    if (res.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    alert(res.message || 'Login Gagal. Periksa email dan password Anda.');
                }
            } catch (err) {
                console.error("Login Error:", err);
                alert("Gagal terhubung ke server. Pastikan backend sudah menyala.");
            } finally {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }
});