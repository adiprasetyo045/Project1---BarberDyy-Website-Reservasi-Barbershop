const API_URL = ''; // ✅ Link kosong

console.log("🚀 VERSI BARU - SUDAH ADA API"); // Penanda kalau file ini sudah update

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const btnSubmit = document.querySelector('button[type="submit"]');

            if (passwordInput.value !== confirmPasswordInput.value) {
                alert("❌ Password tidak sama!");
                return;
            }

            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Memproses...';
            btnSubmit.disabled = true;

            try {
                // 👇 PASTIKAN ADA /api DI SINI
                const res = await fetch(`${API_URL}/api/auth/register`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameInput.value,
                        email: emailInput.value,
                        phone: phoneInput.value,
                        password: passwordInput.value
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    alert("✅ Registrasi Berhasil!");
                    window.location.href = 'login.html';
                } else {
                    throw new Error(data.message || "Gagal mendaftar");
                }
            } catch (err) {
                console.error(err);
                alert("❌ Error: " + err.message);
            } finally {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }
});