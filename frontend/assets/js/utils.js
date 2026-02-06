const API_BASE_URL = 'https://project1-barber-dyy-website-reservasi-barbershop-l0xeswl4b.const API_URL = ''/api';

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 204) return { success: true };

        if (response.status === 401 || response.status === 403) {
            console.warn("Sesi habis atau token tidak valid.");
            
            if (!window.location.pathname.includes('login.html')) {
                alert("Sesi Anda telah habis. Silakan login kembali.");
                localStorage.clear();
                window.location.href = 'login.html';
            }
            return null;
        }

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
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
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } catch (e) {
            localStorage.clear();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const publicKeywords = ['login.html', 'register.html', 'index.html']; 
    
    const isPublic = (path === '/' || path.endsWith('/')) || 
                     publicKeywords.some(page => path.includes(page));

    if (!isPublic) {
        requireAuth(); 
    } else {
        if (path.includes('login.html') || path.includes('register.html')) {
            redirectIfLoggedIn(); 
        }
    }
});