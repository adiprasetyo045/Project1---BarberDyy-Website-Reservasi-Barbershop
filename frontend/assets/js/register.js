const API_URL = '';

console.log("🚀 VERSI BARU: REGISTER SUDAH PAKAI /api"); // Penanda Wajib

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value; // Pastikan ID di HTML adalah 'phone'
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;
            const btn = registerForm.querySelector('button');

            if (password !== confirm) return alert("❌ Password tidak sama!");

            const originalText = btn.innerHTML;
            btn.innerHTML = 'Memproses...';
            btn.disabled = true;

            try {
                // 👇 PERHATIKAN: WAJIB ADA /api DI SINI
                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert("✅ Registrasi Berhasil! Silakan login.");
                    window.location.href = 'login.html';
                } else {
                    throw new Error(data.message || "Gagal mendaftar");
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