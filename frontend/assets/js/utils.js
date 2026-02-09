// ✅ GUNAKAN STRING KOSONG (Relative Path untuk Vercel)
const API_BASE_URL = ''; 

console.log("🚀 UTILS.JS: LOADED - SMART API PREFIX");

/**
 * Fungsi Fetch Wrapper "Pintar"
 * Otomatis menangani Token, JSON Header, dan Prefix /api
 */
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    // 1. SETUP HEADER (Otomatis isi token jika ada)
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Jika kirim file (FormData), hapus Content-Type biar browser yang atur
    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    };

    // 2. LOGIKA PINTAR URL (Auto-fix /api)
    // Jika endpoint tidak dimulai dengan '/api' dan bukan link eksternal (http),
    // kita tambahkan '/api' otomatis.
    // Contoh: '/auth/login' -> '/api/auth/login'
    let finalEndpoint = endpoint;
    if (!finalEndpoint.startsWith('/api') && !finalEndpoint.startsWith('http')) {
        // Pastikan ada slash di depan
        if (!finalEndpoint.startsWith('/')) {
            finalEndpoint = '/' + finalEndpoint;
        }
        finalEndpoint = '/api' + finalEndpoint;
    }

    try {
        // 3. EKSEKUSI FETCH
        const response = await fetch(`${API_BASE_URL}${finalEndpoint}`, config);
        
        // Handle 204 No Content (Sukses tapi kosong)
        if (response.status === 204) return { success: true };

        // Handle Sesi Habis (401/403)
        if (response.status === 401 || response.status === 403) {
            console.warn("Sesi habis atau token tidak valid.");
            
            // Cek agar tidak looping alert di halaman login sendiri
            if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
                alert("Sesi Anda telah habis. Silakan login kembali.");
                localStorage.clear();
                window.location.href = 'login.html';
            }
            return null;
        }

        // Handle Response Data
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { success: response.ok, message: text }; 
        }

        if (!response.ok) {
            throw new Error(data.message || 'Terjadi kesalahan pada server');
        }

        return data;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// --- HELPER FUNCTIONS ---

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function formatTime(timeString) {
    if (!timeString) return '-';
    return timeString.substring(0, 5); 
}

function logout() {
    if(confirm("Yakin ingin keluar?")) {
        localStorage.clear();
        window.location.href = 'login.html'; 
    }
}

// --- AUTH GUARDS (Proteksi Halaman) ---

function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

function redirectIfLoggedIn() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            // Redirect sesuai role
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } catch (e) {
            console.error("Data user corrupt, logout paksa.");
            localStorage.clear();
        }
    }
}

// --- AUTO EXECUTE ON LOAD ---
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    
    // Halaman yang boleh diakses tanpa login (Public)
    const publicPages = ['login.html', 'register.html', 'index.html', '/']; 
    
    // Cek apakah halaman saat ini adalah halaman public
    const isPublic = publicPages.some(page => path.endsWith(page) || path === page || path.endsWith('/'));

    if (!isPublic) {
        // Kalau halaman private (dashboard, booking, dll), WAJIB LOGIN
        requireAuth(); 
    } else {
        // Kalau halaman Login/Register, jika sudah login LEMPAR ke Dashboard
        if (path.includes('login.html') || path.includes('register.html')) {
            redirectIfLoggedIn(); 
        }
    }
});