// =========================================================================
// AUTH.JS — Session, Authentication & Access Control Manager
// Eco-SMAN 18 Bandung Dashboard
// v2.0 — Public View Mode (Guest dapat melihat dashboard tanpa login)
// =========================================================================

// ── Storage Helper (localStorage → sessionStorage → Cookie fallback) ──────
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

// ── AuthEngine ────────────────────────────────────────────────────────────
const AuthEngine = {
    SESSION_KEY:     'eco_session',
    SESSION_MAX_AGE: 8 * 60 * 60 * 1000, // 8 jam

    // Roles yang diizinkan untuk aksi tulis/admin
    ADMIN_ROLES: ['Admin', 'Editor'],

    // ── Cek apakah session valid ─────────────────────────────────────────
    IsLoggedIn() {
        const session = this.GetSession();
        if (!session || !session.loginTime) return false;
        if (Date.now() - session.loginTime > this.SESSION_MAX_AGE) {
            this.ClearSession();
            return false;
        }
        return true;
    },

    // ── Cek apakah user punya akses admin/editor ─────────────────────────
    IsAdmin() {
        if (!this.IsLoggedIn()) return false;
        const session = this.GetSession();
        return this.ADMIN_ROLES.includes(session?.role);
    },

    GetSession()    { return Storage.get(this.SESSION_KEY); },
    ClearSession()  { Storage.remove(this.SESSION_KEY); },

    // ── Guard PUBLIK: tidak redirect, hanya terapkan tema ────────────────
    // Panggil ini di index.html — dashboard tetap terbuka untuk semua
    GuardPublic() {
        try {
            const theme = Storage.get('theme');
            if (theme === 'dark') document.documentElement.classList.add('dark');
        } catch(e) {}
        this.RenderUserInfo();   // render info user atau "Mode Pengunjung"
        this.ApplyAccessUI();    // sembunyikan/tampilkan elemen sesuai role
    },

    // ── Guard PRIVAT: redirect ke login jika belum login ─────────────────
    // Gunakan ini HANYA di halaman yang memang full-private (opsional)
    Guard() {
        if (!this.IsLoggedIn()) {
            window.location.replace('login.html');
            return false;
        }
        try {
            const theme = Storage.get('theme');
            if (theme === 'dark') document.documentElement.classList.add('dark');
        } catch(e) {}
        this.RenderUserInfo();
        this.ApplyAccessUI();
        return true;
    },

    // ── Render info user di sidebar ───────────────────────────────────────
    RenderUserInfo() {
        const session  = this.GetSession();
        const isLogged = this.IsLoggedIn();

        const namaEl   = document.getElementById('user-nama');
        const roleEl   = document.getElementById('user-role');
        const avatarEl = document.getElementById('user-avatar');
        const avatarMiniEl = document.getElementById('user-avatar-mini');

        if (isLogged && session) {
            const nama = session.nama || session.username || 'Pengguna';
            const role = session.role || 'Viewer';
            const initials = nama.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

            if (namaEl)        namaEl.textContent   = nama;
            if (roleEl)        roleEl.textContent   = role;
            if (avatarEl)      avatarEl.textContent = initials;
            if (avatarMiniEl)  avatarMiniEl.textContent = initials;
        } else {
            // Mode Pengunjung
            if (namaEl)        namaEl.textContent   = 'Mode Pengunjung';
            if (roleEl)        roleEl.textContent   = 'Publik · Hanya lihat';
            if (avatarEl)      { avatarEl.textContent = '👁'; avatarEl.classList.add('text-lg'); }
            if (avatarMiniEl)  avatarMiniEl.textContent = '👁';
        }
    },

    // ── Terapkan UI berdasarkan status login & role ───────────────────────
    ApplyAccessUI() {
        const isLogged = this.IsLoggedIn();
        const isAdmin  = this.IsAdmin();

        // Tombol logout — tampil hanya jika login
        const btnLogout  = document.getElementById('btn-logout');
        const sheetLogout = document.getElementById('sheet-logout');
        if (btnLogout)   btnLogout.style.display   = isLogged ? '' : 'none';
        if (sheetLogout) sheetLogout.style.display = isLogged ? '' : 'none';

        // Tombol login (di sidebar/sheet, jika ada)
        const btnLoginSidebar = document.getElementById('btn-login-sidebar');
        const btnLoginSheet   = document.getElementById('btn-login-sheet');
        if (btnLoginSidebar) btnLoginSidebar.style.display = isLogged ? 'none' : '';
        if (btnLoginSheet)   btnLoginSheet.style.display   = isLogged ? 'none' : '';

        // Menu Input — sembunyikan jika bukan admin
        const menuInput   = document.getElementById('menu-input');
        const mobileInput = document.querySelector('.mobile-nav-btn.nav-input');
        if (menuInput)   menuInput.style.display   = isAdmin ? '' : 'none';
        if (mobileInput) mobileInput.style.display = isAdmin ? '' : 'none';
    },

    // ── Gate: panggil sebelum aksi admin ─────────────────────────────────
    // Kembalikan true jika boleh lanjut, false jika harus login dulu
    RequireAdmin(reason = '') {
        if (this.IsAdmin()) return true;
        // Simpan URL saat ini untuk redirect-back setelah login
        try { sessionStorage.setItem('eco_redirect_back', window.location.href); } catch(e) {}
        LoginModal.show(reason);
        return false;
    },

    // ── Logout ────────────────────────────────────────────────────────────
    async Logout(scriptUrl) {
        const session   = this.GetSession();
        const confirmed = confirm(`Keluar dari sistem?\nLogin sebagai: ${session?.nama || session?.username}`);
        if (!confirmed) return;

        if (session && scriptUrl) {
            try {
                fetch(scriptUrl, {
                    method: 'POST', mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ action: 'logout', username: session.username, logoutTime: new Date().toISOString() })
                }).catch(() => {});
            } catch(_) {}
        }

        this.ClearSession();
        // Tidak redirect — cukup refresh UI agar kembali ke mode pengunjung
        this.RenderUserInfo();
        this.ApplyAccessUI();

        // Jika sedang di tab Input, pindah ke Dashboard
        if (typeof switchTab === 'function') switchTab('dashboard');
        else window.location.reload();
    }
};

// =========================================================================
// LOGIN MODAL — Muncul di atas dashboard saat aksi admin diblokir
// =========================================================================
const LoginModal = {
    _el: null,
    _apiUrl: 'https://script.google.com/macros/s/AKfycbw8_qdCUnO85U1LSMJXSJv7RxMt83FQEnWGVYCtjJRgOaYgr3yi5ONcSEcz4aypd3dM/exec',

    _LOCAL_USERS: [
        { Username:'admin',  Password:'admin123',  Nama:'Administrator',   Role:'Admin',  Status:'Aktif' },
        { Username:'guru',   Password:'guru2026',  Nama:'Guru Pembimbing', Role:'Editor', Status:'Aktif' },
        { Username:'siswa',  Password:'siswa2026', Nama:'Petugas Kelas',   Role:'Viewer', Status:'Aktif' },
    ],

    // Buat dan sisipkan modal ke DOM (dipanggil sekali)
    _inject() {
        if (document.getElementById('auth-modal')) return;
        const el = document.createElement('div');
        el.id = 'auth-modal';
        el.innerHTML = `
        <!-- Backdrop -->
        <div id="auth-modal-backdrop"
            class="fixed inset-0 z-[200] bg-gray-900/60 backdrop-blur-sm
                   flex items-end sm:items-center justify-center p-0 sm:p-4
                   transition-opacity duration-300 opacity-0 pointer-events-none">

            <!-- Panel -->
            <div id="auth-modal-panel"
                class="w-full sm:max-w-md bg-white dark:bg-gray-800
                       rounded-t-3xl sm:rounded-3xl shadow-2xl
                       border border-gray-100 dark:border-gray-700
                       translate-y-8 sm:scale-95 opacity-0
                       transition-all duration-300
                       overflow-hidden">

                <!-- Header -->
                <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                <i class="fa-solid fa-shield-halved text-lg"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-base leading-tight">Login Diperlukan</h3>
                                <p id="auth-modal-reason" class="text-xs text-emerald-100 mt-0.5">Masuk untuk mengakses fitur ini</p>
                            </div>
                        </div>
                        <button id="auth-modal-close"
                            class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 transition-colors">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Body -->
                <div class="px-6 py-5 space-y-4">

                    <!-- Alert Error -->
                    <div id="auth-modal-error"
                        class="hidden flex items-center gap-3 px-4 py-3
                               bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800
                               rounded-xl text-sm text-red-700 dark:text-red-400">
                        <i class="fa-solid fa-triangle-exclamation flex-shrink-0"></i>
                        <span id="auth-modal-error-text">Username atau password salah.</span>
                    </div>

                    <!-- Username -->
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Username
                        </label>
                        <div class="relative">
                            <i class="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 text-sm"></i>
                            <input id="auth-modal-username" type="text"
                                placeholder="Masukkan username..."
                                autocomplete="username"
                                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600
                                       rounded-xl pl-10 pr-4 py-2.5 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-emerald-400
                                       text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600
                                       transition-all">
                        </div>
                    </div>

                    <!-- Password -->
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Password
                        </label>
                        <div class="relative">
                            <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 text-sm"></i>
                            <input id="auth-modal-password" type="password"
                                placeholder="Masukkan password..."
                                autocomplete="current-password"
                                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600
                                       rounded-xl pl-10 pr-11 py-2.5 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-emerald-400
                                       text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600
                                       transition-all">
                            <button id="auth-modal-toggle-pw"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 hover:text-emerald-500 transition-colors">
                                <i id="auth-modal-eye" class="fa-solid fa-eye text-sm"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Tombol Masuk -->
                    <button id="auth-modal-submit"
                        class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
                               text-white font-semibold rounded-xl transition-all duration-200
                               flex items-center justify-center gap-2 shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-emerald-400">
                        <i id="auth-modal-btn-icon" class="fa-solid fa-right-to-bracket"></i>
                        <span id="auth-modal-btn-text">Masuk</span>
                    </button>

                    <!-- Link ke login page penuh -->
                    <p class="text-center text-xs text-gray-400 dark:text-gray-500">
                        Atau buka
                        <a href="login.html" class="text-emerald-500 hover:underline font-medium">halaman login penuh</a>
                    </p>
                </div>

                <!-- Info guest -->
                <div class="px-6 pb-5">
                    <div class="flex items-start gap-3 p-3.5
                               bg-blue-50 dark:bg-blue-950/30
                               border border-blue-100 dark:border-blue-900/50
                               rounded-xl text-xs text-blue-600 dark:text-blue-400">
                        <i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
                        <span>Dashboard monitoring tetap dapat dilihat oleh siapa saja. Login hanya diperlukan untuk menambah atau mengubah data.</span>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.appendChild(el);
        this._el = el;
        this._bindEvents();
    },

    _bindEvents() {
        // Close button
        document.getElementById('auth-modal-close')?.addEventListener('click', () => this.hide());
        // Backdrop click
        document.getElementById('auth-modal-backdrop')?.addEventListener('click', e => {
            if (e.target.id === 'auth-modal-backdrop') this.hide();
        });
        // Toggle password
        document.getElementById('auth-modal-toggle-pw')?.addEventListener('click', () => {
            const inp  = document.getElementById('auth-modal-password');
            const eye  = document.getElementById('auth-modal-eye');
            const hide = inp.type === 'password';
            inp.type   = hide ? 'text' : 'password';
            eye.className = hide ? 'fa-solid fa-eye-slash text-sm' : 'fa-solid fa-eye text-sm';
        });
        // Submit
        document.getElementById('auth-modal-submit')?.addEventListener('click', () => this._doLogin());
        // Enter key
        ['auth-modal-username','auth-modal-password'].forEach(id => {
            document.getElementById(id)?.addEventListener('keydown', e => {
                if (e.key === 'Enter') this._doLogin();
            });
        });
        // ESC key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.hide();
        });
    },

    show(reason = 'Masuk untuk mengakses fitur ini') {
        this._inject();
        const reasonEl = document.getElementById('auth-modal-reason');
        if (reasonEl) reasonEl.textContent = reason;

        const backdrop = document.getElementById('auth-modal-backdrop');
        const panel    = document.getElementById('auth-modal-panel');
        const errEl    = document.getElementById('auth-modal-error');
        const usrEl    = document.getElementById('auth-modal-username');

        if (errEl) errEl.classList.add('hidden');

        // Animasi masuk
        backdrop.style.pointerEvents = 'auto';
        requestAnimationFrame(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            panel.classList.remove('translate-y-8', 'sm:scale-95', 'opacity-0');
            panel.classList.add('translate-y-0', 'sm:scale-100', 'opacity-100');
        });

        setTimeout(() => usrEl?.focus(), 350);
        document.body.style.overflow = 'hidden';
    },

    hide() {
        const backdrop = document.getElementById('auth-modal-backdrop');
        const panel    = document.getElementById('auth-modal-panel');
        if (!backdrop) return;

        backdrop.classList.add('opacity-0');
        backdrop.classList.remove('opacity-100');
        panel.classList.add('translate-y-8', 'sm:scale-95', 'opacity-0');
        panel.classList.remove('translate-y-0', 'sm:scale-100', 'opacity-100');
        backdrop.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    },

    _setLoading(loading) {
        const btn  = document.getElementById('auth-modal-submit');
        const icon = document.getElementById('auth-modal-btn-icon');
        const text = document.getElementById('auth-modal-btn-text');
        if (!btn) return;
        btn.disabled   = loading;
        icon.className = loading ? 'fa-solid fa-circle-notch animate-spin' : 'fa-solid fa-right-to-bracket';
        text.textContent = loading ? 'Memverifikasi...' : 'Masuk';
    },

    _showError(msg) {
        const errEl   = document.getElementById('auth-modal-error');
        const errText = document.getElementById('auth-modal-error-text');
        if (errEl)   errEl.classList.remove('hidden');
        if (errText) errText.textContent = msg;
        // Shake panel
        const panel = document.getElementById('auth-modal-panel');
        panel?.classList.add('animate-shake');
        setTimeout(() => panel?.classList.remove('animate-shake'), 400);
    },

    async _doLogin() {
        const username = document.getElementById('auth-modal-username')?.value.trim().toLowerCase() || '';
        const password = document.getElementById('auth-modal-password')?.value.trim() || '';

        if (!username || !password) {
            this._showError('Username dan password tidak boleh kosong.');
            return;
        }

        this._setLoading(true);
        document.getElementById('auth-modal-error')?.classList.add('hidden');

        const onSuccess = (nama, role) => {
            Storage.set('eco_session', { username, nama, role, loginTime: Date.now() });
            this.hide();
            this._setLoading(false);
            // Re-render UI
            AuthEngine.RenderUserInfo();
            AuthEngine.ApplyAccessUI();
            // Tampilkan konfirmasi singkat
            this._toast(`✅ Selamat datang, ${nama}!`);
            // Jika role admin, buka tab Input
            if (AuthEngine.IsAdmin() && typeof switchTab === 'function') switchTab('input');
        };

        const onFail = msg => {
            this._setLoading(false);
            this._showError(msg || 'Username atau password salah.');
        };

        // Coba Apps Script
        try {
            const res = await fetch(this._apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    action: 'login', username, password,
                    loginTime: new Date().toISOString(),
                    userAgent: navigator.userAgent.substring(0, 80)
                }),
                redirect: 'follow'
            });
            const raw = await res.text();
            let result = null;
            try { result = JSON.parse(raw.trim().replace(/^\)\]\}'/, '')); } catch(_) {}

            if (result && typeof result.success !== 'undefined') {
                if (result.success) onSuccess(result.nama, result.role);
                else onFail(result.message);
                return;
            }
        } catch(e) {
            console.warn('Apps Script tidak bisa dihubungi, pakai fallback lokal.', e.message);
        }

        // Fallback lokal
        const found = this._LOCAL_USERS.find(u =>
            u.Username.toLowerCase() === username && u.Password === password && u.Status === 'Aktif'
        );
        if (found) onSuccess(found.Nama, found.Role);
        else onFail('Username atau password salah.');
    },

    _toast(msg) {
        const t = document.createElement('div');
        t.className = `fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[300]
                       bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium
                       px-5 py-3 rounded-2xl shadow-xl
                       transition-all duration-300 opacity-0 translate-y-4`;
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => {
            t.classList.remove('opacity-0', 'translate-y-4');
        });
        setTimeout(() => {
            t.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => t.remove(), 400);
        }, 2800);
    }
};