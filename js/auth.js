// =========================================================================
// AUTH.JS — Session & Authentication Manager
// Eco-SMAN 18 Bandung Dashboard
// =========================================================================

// Storage helper: localStorage → sessionStorage → Cookie (3 lapis fallback)
// Mengatasi "Tracking Prevention blocked access to storage" di Edge/Firefox
const Storage = {
    _cookieName: 'eco_data',

    set(key, value) {
        const str = JSON.stringify(value);
        try { localStorage.setItem(key, str); } catch(e) {}
        try { sessionStorage.setItem(key, str); } catch(e) {}
        try {
            const expires = new Date(Date.now() + 8*60*60*1000).toUTCString();
            const all = this._readCookie();
            all[key] = value;
            document.cookie = `${this._cookieName}=${encodeURIComponent(JSON.stringify(all))};expires=${expires};path=/;SameSite=Lax`;
        } catch(e) {}
    },

    get(key) {
        try { const v = localStorage.getItem(key); if (v) return JSON.parse(v); } catch(e) {}
        try { const v = sessionStorage.getItem(key); if (v) return JSON.parse(v); } catch(e) {}
        try { const all = this._readCookie(); if (all[key] !== undefined) return all[key]; } catch(e) {}
        return null;
    },

    remove(key) {
        try { localStorage.removeItem(key); } catch(e) {}
        try { sessionStorage.removeItem(key); } catch(e) {}
        try {
            const all = this._readCookie();
            delete all[key];
            document.cookie = `${this._cookieName}=${encodeURIComponent(JSON.stringify(all))};path=/;SameSite=Lax`;
        } catch(e) {}
    },

    _readCookie() {
        try {
            const match = document.cookie.split(';').find(c => c.trim().startsWith(this._cookieName + '='));
            if (!match) return {};
            return JSON.parse(decodeURIComponent(match.trim().substring(this._cookieName.length + 1)));
        } catch(e) { return {}; }
    }
};

const AuthEngine = {
    SESSION_KEY: 'eco_session',
    SESSION_MAX_AGE: 8 * 60 * 60 * 1000,

    IsLoggedIn() {
        const session = this.GetSession();
        if (!session) return false;
        const sessionAge = Date.now() - session.loginTime;
        if (sessionAge > this.SESSION_MAX_AGE) {
            this.ClearSession();
            return false;
        }
        return true;
    },

    GetSession() {
        return Storage.get(this.SESSION_KEY);
    },

    ClearSession() {
        Storage.remove(this.SESSION_KEY);
    },

    Guard() {
        if (!this.IsLoggedIn()) {
            window.location.replace('login.html');
            return false;
        }
        try {
            const theme = Storage.get('theme');
            if (theme === 'dark') document.documentElement.classList.add('dark');
        } catch(e) {}
        return true;
    },

    RenderUserInfo() {
        const session = this.GetSession();
        if (!session) return;

        const namaEl   = document.getElementById('user-nama');
        const roleEl   = document.getElementById('user-role');
        const avatarEl = document.getElementById('user-avatar');

        if (namaEl)   namaEl.textContent   = session.nama || session.username;
        if (roleEl)   roleEl.textContent   = session.role || 'Viewer';
        if (avatarEl) {
            const initials = (session.nama || session.username)
                .split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            avatarEl.textContent = initials;
        }

        if (session.role === 'Viewer') {
            const menuInput   = document.getElementById('menu-input');
            const mobileInput = document.querySelector('.mobile-nav-btn.nav-input');
            if (menuInput)   menuInput.style.display   = 'none';
            if (mobileInput) mobileInput.style.display = 'none';
        }
    },

    async Logout(scriptUrl) {
        const session = this.GetSession();
        const confirmed = confirm(`Keluar dari sistem?\nLogin sebagai: ${session?.nama || session?.username}`);
        if (!confirmed) return;

        if (session && scriptUrl) {
            try {
                fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: 'logout',
                        username: session.username,
                        logoutTime: new Date().toISOString()
                    })
                }).catch(() => {});
            } catch(_) {}
        }

        this.ClearSession();
        window.location.replace('login.html');
    }
};