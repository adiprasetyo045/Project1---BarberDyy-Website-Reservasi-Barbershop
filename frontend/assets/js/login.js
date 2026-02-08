const API_URL = ''; 

console.log("🚀 VERSI BARU: LOGIN SUDAH PAKAI /api"); // Penanda Wajib

document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Memproses...';
            btn.disabled = true;

            try {
                // 👇 PERHATIKAN: WAJIB ADA /api DI SINI
                const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    alert("✅ Login Berhasil!");
                    // Redirect sesuai role
                    if(data.user.role === 'admin') window.location.href = 'admin-dashboard.html';
                    else window.location.href = 'dashboard.html';
                } else {
                    throw new Error(data.message || "Login gagal");
                }
            } catch (err) {
                console.error(err);
                alert("❌ Error: " + err.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});