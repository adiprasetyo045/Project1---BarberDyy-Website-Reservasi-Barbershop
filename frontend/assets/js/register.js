document.addEventListener('DOMContentLoaded', () => {
    // 1. CEK LOGIN (PENTING: Pakai sessionStorage)
    // Jika user sudah login, jangan biarkan mereka daftar lagi. Lempar ke dashboard.
    const token = sessionStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
        return;
    }

    const registerForm = document.querySelector('form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Tahan biar halaman GAK reload

            // 2. Ambil data dari inputan
            // Menggunakan querySelectorAll sesuai kode Kakak
            const inputs = registerForm.querySelectorAll('input');
            
            // Pastikan urutan input di HTML Kakak sesuai:
            // [0]=Nama, [1]=HP, [2]=Email, [3]=Password, [4]=Confirm
            const name = inputs[0].value;       
            const phone = inputs[1].value;      
            const email = inputs[2].value;      
            const password = inputs[3].value;   
            const confirm = inputs[4].value;    
            
            const btnSubmit = registerForm.querySelector('button');

            // 3. Validasi Sederhana
            if (password !== confirm) {
                alert("❌ Password dan Konfirmasi Password tidak sama!");
                return;
            }

            if (password.length < 6) {
                alert("❌ Password minimal 6 karakter!");
                return;
            }

            // 4. Ubah tombol jadi Loading
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Memproses...';
            btnSubmit.disabled = true;

            try {
                // 5. Kirim ke Backend (Pakai fetchAPI dari utils.js)
                const res = await fetchAPI('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        password, 
                        phone 
                    })
                });

                if (res.success) {
                    alert("✅ Registrasi Berhasil! Silakan Login.");
                    window.location.href = 'login.html';
                } else {
                    alert("❌ Gagal: " + (res.message || "Email mungkin sudah terdaftar"));
                }

            } catch (err) {
                console.error(err);
                alert("❌ Error: Gagal terhubung ke server");
            } finally {
                // Kembalikan tombol
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }
});