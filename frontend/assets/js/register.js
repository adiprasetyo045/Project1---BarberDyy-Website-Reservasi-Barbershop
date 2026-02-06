const API_URL = ''; // ✅ Kosong supaya otomatis mendeteksi server sendiri

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Login (Kalau sudah login, usir ke dashboard)
    // Kita cek 'token' di localStorage (sesuai login.js)
    if (localStorage.getItem('token')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Tahan biar gak reload

            // 2. Ambil elemen input berdasarkan ID (Lebih Aman & Akurat)
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const btnSubmit = document.querySelector('button[type="submit"]');

            // 3. Validasi Sederhana
            if (passwordInput.value !== confirmPasswordInput.value) {
                alert("❌ Password dan Konfirmasi Password tidak sama!");
                return;
            }

            // 4. Ubah tombol jadi Loading
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Memproses...';
            btnSubmit.disabled = true;

            const formData = {
                name: nameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                password: passwordInput.value
            };

            try {
                // 5. Kirim ke Backend (Pakai standard fetch)
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await res.json();

                if (res.ok) {
                    alert("✅ Registrasi Berhasil! Silakan Login.");
                    window.location.href = 'login.html';
                } else {
                    throw new Error(data.message || "Gagal mendaftar");
                }

            } catch (err) {
                console.error('Error Register:', err);
                alert("❌ Error: " + err.message);
            } finally {
                // Kembalikan tombol
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }
});