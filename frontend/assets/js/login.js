const API_URL = ''; // Relative Path untuk Vercel

console.log("🚀 LOGIN SCRIPT LOADED");

document.addEventListener('DOMContentLoaded', () => {
    // 1. Bersihkan sesi lama biar bersih
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            
            // UX: Disable tombol biar gak dipencet 2x
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            btn.disabled = true;

            try {
                const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    // 2. Simpan Token & Data User
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // 3. LOGIKA REDIRECT (Admin/Owner vs User Biasa)
                    // Kita cek apakah role-nya 'admin' ATAU 'owner'
                    const role = data.user.role || 'user'; // Default ke user kalau null
                    
                    if (role === 'admin' || role === 'owner') {
                        // Redirect ke Panel Admin
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        // Redirect ke Booking User
                        window.location.href = 'dashboard.html';
                    }

                } else {
                    throw new Error(data.message || "Login gagal, periksa email/password.");
                }

            } catch (err) {
                console.error("Login Error:", err);
                alert("❌ Gagal Masuk: " + err.message);
            } finally {
                // Balikin tombol
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});