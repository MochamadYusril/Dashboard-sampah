// =========================================================================
// APP.JS — Main Dashboard Controller
// Eco-SMAN 18 Bandung Dashboard  v2.0 — Public View Mode
// =========================================================================
document.addEventListener('DOMContentLoaded', async () => {

    // ── Auth: public mode, tidak redirect ─────────────────────────────────
    if (typeof AuthEngine !== 'undefined') AuthEngine.GuardPublic();

    // ── DOM ───────────────────────────────────────────────────────────────
    const loader           = document.getElementById('loading-overlay');
    const refreshBtn       = document.getElementById('btn-refresh');
    const btnLogout        = document.getElementById('btn-logout');
    const btnLoginSidebar  = document.getElementById('btn-login-sidebar');
    const sidebar          = document.getElementById('sidebar');
    const btnDesktopToggle = document.getElementById('btn-desktop-toggle');
    const btnHeaderToggle  = document.getElementById('btn-header-toggle');
    const menuDashboard    = document.getElementById('menu-dashboard');
    const menuDataSampah   = document.getElementById('menu-data-sampah');
    const menuStatistik    = document.getElementById('menu-statistik');
    const menuInput        = document.getElementById('menu-input');
    const viewDashboard    = document.getElementById('view-dashboard');
    const viewDataSampah   = document.getElementById('view-data-sampah');
    const viewStatistik    = document.getElementById('view-statistik');
    const viewInput        = document.getElementById('view-input');

    // =========================================================================
    // SIDEBAR COLLAPSE (Desktop)
    // =========================================================================
    const SIDEBAR_KEY = 'eco18_sidebar_collapsed';
    let isCollapsed   = localStorage.getItem(SIDEBAR_KEY) === 'true';

    function applyDesktopCollapse() {
        if (sidebar) sidebar.classList.toggle('collapsed', isCollapsed);
    }
    function toggleDesktopSidebar() {
        isCollapsed = !isCollapsed;
        localStorage.setItem(SIDEBAR_KEY, isCollapsed);
        applyDesktopCollapse();
    }

    if (btnDesktopToggle) btnDesktopToggle.addEventListener('click', toggleDesktopSidebar);
    if (btnHeaderToggle)  btnHeaderToggle.addEventListener('click', toggleDesktopSidebar);
    applyDesktopCollapse();

    // =========================================================================
    // DARK MODE
    // =========================================================================
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark')  document.documentElement.classList.add('dark');
    if (savedTheme === 'light') document.documentElement.classList.remove('dark');

    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (typeof DashboardCharts !== 'undefined' && globalData.length)
            DashboardCharts.UpdateAll(globalData);
    }

    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) darkModeBtn.addEventListener('click', toggleDarkMode);

    // =========================================================================
    // MOBILE PROFILE SHEET
    // =========================================================================
    const profileSheet         = document.getElementById('profile-sheet');
    const profileSheetBackdrop = document.getElementById('profile-sheet-backdrop');
    const profileSheetPanel    = document.getElementById('profile-sheet-panel');
    const btnMobileProfile     = document.getElementById('btn-mobile-profile');
    const btnSheetClose        = document.getElementById('sheet-close');
    const btnSheetDarkMode     = document.getElementById('sheet-dark-mode');
    const btnSheetLogout       = document.getElementById('sheet-logout');
    const btnLoginSheet        = document.getElementById('btn-login-sheet');

    function openProfileSheet() {
        if (!profileSheet) return;
        profileSheet.style.pointerEvents = 'auto';
        if (profileSheetBackdrop) profileSheetBackdrop.style.opacity = '1';
        if (profileSheetPanel)    profileSheetPanel.style.transform  = 'translateY(0)';
        document.body.style.overflow = 'hidden';

        // Sinkronisasi info user ke sheet
        const sync = (srcId, dstId) => {
            const s = document.getElementById(srcId), d = document.getElementById(dstId);
            if (s && d) d.textContent = s.textContent;
        };
        sync('user-avatar', 'sheet-user-avatar');
        sync('user-nama',   'sheet-user-nama');
        sync('user-role',   'sheet-user-role');

        // Tampilkan tombol login / logout sesuai status
        const isLogged = typeof AuthEngine !== 'undefined' && AuthEngine.IsLoggedIn();
        if (btnLoginSheet)  btnLoginSheet.style.display  = isLogged ? 'none' : '';
        if (btnSheetLogout) btnSheetLogout.style.display = isLogged ? '' : 'none';
    }

    function closeProfileSheet() {
        if (!profileSheet) return;
        profileSheet.style.pointerEvents = 'none';
        if (profileSheetBackdrop) profileSheetBackdrop.style.opacity = '0';
        if (profileSheetPanel)    profileSheetPanel.style.transform  = 'translateY(100%)';
        document.body.style.overflow = '';
    }

    if (btnMobileProfile)     btnMobileProfile.addEventListener('click', openProfileSheet);
    if (profileSheetBackdrop) profileSheetBackdrop.addEventListener('click', closeProfileSheet);
    if (btnSheetClose)        btnSheetClose.addEventListener('click', closeProfileSheet);
    if (btnSheetDarkMode)     btnSheetDarkMode.addEventListener('click', toggleDarkMode);
    if (btnSheetLogout)       btnSheetLogout.addEventListener('click', () => {
        closeProfileSheet();
        if (typeof AuthEngine !== 'undefined') AuthEngine.Logout();
    });

    // Swipe-down to dismiss sheet
    let _sheetStartY = 0;
    profileSheetPanel?.addEventListener('touchstart', e => { _sheetStartY = e.touches[0].clientY; }, { passive: true });
    profileSheetPanel?.addEventListener('touchmove',  e => {
        const dy = e.touches[0].clientY - _sheetStartY;
        if (dy > 0 && profileSheetPanel) profileSheetPanel.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    profileSheetPanel?.addEventListener('touchend', e => {
        const dy = e.changedTouches[0].clientY - _sheetStartY;
        if (profileSheetPanel) profileSheetPanel.style.transform = dy > 80 ? '' : 'translateY(0)';
        if (dy > 80) closeProfileSheet();
    });

    // =========================================================================
    // LOGOUT & LOGIN BUTTONS
    // =========================================================================
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (typeof AuthEngine !== 'undefined') AuthEngine.Logout();
        });
    }

    function openLoginModal(reason) {
        if (typeof LoginModal !== 'undefined') LoginModal.show(reason || 'Masuk untuk mengakses fitur admin');
        else window.location.href = 'login.html';
    }

    if (btnLoginSidebar) btnLoginSidebar.addEventListener('click', () => openLoginModal());
    if (btnLoginSheet)   btnLoginSheet.addEventListener('click',   () => { closeProfileSheet(); openLoginModal(); });

    // =========================================================================
    // NAVIGASI TAB
    // window.switchTab di-expose agar auth.js bisa memanggilnya setelah login
    // =========================================================================
    const NAV_ACTIVE   = 'nav-item flex items-center gap-3 px-3 py-2.5 bg-organik-light dark:bg-emerald-950/40 text-organik font-semibold rounded-xl transition-all';
    const NAV_INACTIVE = 'nav-item flex items-center gap-3 px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all group';

    const tabMap = {
        'dashboard':   { view: viewDashboard,  menu: menuDashboard,  mobileClass: 'nav-dashboard' },
        'input':       { view: viewInput,      menu: menuInput,      mobileClass: 'nav-input' },
        'data-sampah': { view: viewDataSampah, menu: menuDataSampah, mobileClass: 'nav-data-sampah' },
        'statistik':   { view: viewStatistik,  menu: menuStatistik,  mobileClass: 'nav-statistik' },
    };

    window.switchTab = function (tab) {
        // Gate: tab Input hanya untuk Admin / Editor
        if (tab === 'input') {
            if (typeof AuthEngine === 'undefined' || !AuthEngine.IsAdmin()) {
                openLoginModal('Input data hanya tersedia untuk Admin & Editor');
                return;
            }
        }
        Object.entries(tabMap).forEach(([key, { view, menu, mobileClass }]) => {
            const active = key === tab;
            if (view) view.classList.toggle('hidden', !active);
            if (menu) menu.className = active ? NAV_ACTIVE : NAV_INACTIVE;
            document.querySelectorAll(`.${mobileClass}`).forEach(btn => {
                btn.classList.toggle('active',             active);
                btn.classList.toggle('text-organik',       active);
                btn.classList.toggle('text-gray-400',      !active);
                btn.classList.toggle('dark:text-gray-500', !active);
            });
        });
    };

    if (menuDashboard)  menuDashboard.addEventListener('click',  e => { e.preventDefault(); switchTab('dashboard'); });
    if (menuDataSampah) menuDataSampah.addEventListener('click', e => { e.preventDefault(); switchTab('data-sampah'); });
    if (menuStatistik)  menuStatistik.addEventListener('click',  e => { e.preventDefault(); switchTab('statistik'); });
    if (menuInput)      menuInput.addEventListener('click',      e => { e.preventDefault(); switchTab('input'); });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if      (btn.classList.contains('nav-dashboard'))   switchTab('dashboard');
            else if (btn.classList.contains('nav-input'))       switchTab('input');
            else if (btn.classList.contains('nav-data-sampah')) switchTab('data-sampah');
            else if (btn.classList.contains('nav-statistik'))   switchTab('statistik');
        });
    });

    switchTab('dashboard');

    // =========================================================================
    // FORM: Input Manual — gate admin
    // =========================================================================
    const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxSaCLQkBBmjV6g_XOljcVgmtFbqLZSfdpx0veap-mJyKyhWViq4PUgSpC_E_aMFXr/exec';

    const inputTingkat = document.getElementById('input-tingkat');
    const inputKelas   = document.getElementById('input-kelas');
    const daftarKelas  = {
        'X':   ['X-1','X-2','X-3','X-4','X-5','X-6','X-7','X-8','X-9','X-10'],
        'XI':  ['XI-1','XI-2','XI-3','XI-4','XI-5','XI-6','XI-7','XI-8','XI-9','XI-10'],
        'XII': ['XII-1','XII-2','XII-3','XII-4','XII-5','XII-6','XII-7','XII-8','XII-9','XII-10'],
    };

    if (inputTingkat && inputKelas) {
        inputTingkat.addEventListener('change', function () {
            inputKelas.innerHTML = '<option value="" disabled selected>Pilih Kelas</option>';
            (daftarKelas[this.value] || []).forEach(k => {
                const o = document.createElement('option');
                o.value = k; o.textContent = k;
                inputKelas.appendChild(o);
            });
        });
    }

    const formInputSampah = document.getElementById('form-input-sampah');
    if (formInputSampah) {
        formInputSampah.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (typeof AuthEngine !== 'undefined' && !AuthEngine.IsAdmin()) {
                openLoginModal('Simpan data memerlukan akun Admin atau Editor');
                return;
            }
            const btn  = document.getElementById('btn-submit-manual');
            const o_kg = parseFloat(document.getElementById('input-organik').value)    || 0;
            const n_kg = parseFloat(document.getElementById('input-nonorganik').value) || 0;
            const payload = {
                action: 'single',
                tanggal:    document.getElementById('input-tanggal').value,
                tingkat:    inputTingkat?.value || '',
                kelas:      inputKelas?.value   || '',
                organik:    o_kg * 1000,
                nonOrganik: n_kg * 1000,
                statusO:    o_kg > 0 ? 'Tercatat' : 'Tidak tercatat',
                statusN:    n_kg > 0 ? 'Tercatat' : 'Tidak tercatat',
            };
            if (!payload.tanggal || !payload.tingkat || !payload.kelas)
                return alert('Mohon lengkapi semua data!');
            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Menyimpan...';
                await fetch(GOOGLE_APP_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) });
                alert('Data berhasil disimpan!');
                formInputSampah.reset();
                if (inputKelas) inputKelas.innerHTML = '<option value="" disabled selected>Pilih Kelas</option>';
                await loadDashboardCoreEngine();
            } catch { alert('Gagal menyimpan data.'); }
            finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan';
            }
        });
    }

    // =========================================================================
    // FORM: Upload CSV — gate admin
    // =========================================================================
    const formUploadCsv = document.getElementById('form-upload-csv');
    if (formUploadCsv) {
        const inputCsv    = document.getElementById('input-csv');
        const csvFileName = document.getElementById('csv-file-name');
        inputCsv?.addEventListener('change', e => {
            if (e.target.files.length > 0) {
                csvFileName.textContent = 'File terpilih: ' + e.target.files[0].name;
                csvFileName.classList.remove('hidden');
            }
        });
        formUploadCsv.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (typeof AuthEngine !== 'undefined' && !AuthEngine.IsAdmin()) {
                openLoginModal('Upload CSV memerlukan akun Admin atau Editor');
                return;
            }
            const file = inputCsv?.files[0];
            if (!file) return alert('Pilih file CSV terlebih dahulu!');
            const btn = document.getElementById('btn-submit-csv');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Memproses...';
            const reader = new FileReader();
            reader.onload = async ev => {
                try {
                    await fetch(GOOGLE_APP_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams({ action: 'bulk', data: ev.target.result }) });
                    alert('Data CSV berhasil diunggah!');
                    formUploadCsv.reset();
                    if (csvFileName) csvFileName.classList.add('hidden');
                    await loadDashboardCoreEngine();
                } catch { alert('Gagal mengunggah data.'); }
                finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-file-import"></i> Proses Data';
                }
            };
            reader.readAsText(file);
        });
    }

    // =========================================================================
    // DOWNLOAD TEMPLATE CSV
    // =========================================================================
    const btnTemplate = document.getElementById('btn-download-template');
    if (btnTemplate) {
        btnTemplate.addEventListener('click', () => {
            const csv  = 'Tanggal,Tingkat,Kelas,Organik_g,NonOrganik_g\n2026-04-07,X,X-1,2500,1200\n2026-04-07,XI,XI-1,3000,800\n';
            const blob = new Blob([csv], { type: 'text/csv' });
            const a    = document.createElement('a');
            a.href     = URL.createObjectURL(blob);
            a.download = 'template_sampah.csv';
            a.click();
        });
    }

    // =========================================================================
    // RENDER: Statistik Kartu + Hero Banner
    // =========================================================================
    function updateStatisticsCards(data) {
        const $ = id => document.getElementById(id);
        const kgHtml = v => `${(parseFloat(v)||0).toFixed(1)} <span class="text-sm font-normal text-gray-400">kg</span>`;
        const fmt1   = v => v >= 1000 ? (v/1000).toFixed(1)+'k' : (parseFloat(v)||0).toFixed(1);

        if (!data || data.length === 0) {
            [$('stat-organik'),$('stat-nonorganik'),$('stat-total')].forEach(el => { if(el) el.innerHTML = kgHtml(0); });
            [$('text-total-entri'),$('text-total-entri-mobile')].forEach(el => { if(el) el.textContent = '0'; });
            [$('hero-stat-organik'),$('hero-stat-nonorganik'),$('dh-stat-organik'),$('dh-stat-nonorganik')].forEach(el => { if(el) el.textContent = '—'; });
            if($('stat-rasio'))   $('stat-rasio').textContent   = 'O: 0% | N: 0%';
            if($('dh-rasio'))     $('dh-rasio').textContent     = 'O: 0% | N: 0%';
            if($('text-periode')) $('text-periode').textContent = '-';
            if($('dh-periode'))   $('dh-periode').textContent   = '-';
            if($('dh-entri'))     $('dh-entri').textContent     = '0 Entri Data';
            return;
        }

        const totalOrg = data.reduce((s,r) => s + (parseFloat(r.organik)    || 0), 0);
        const totalNon = data.reduce((s,r) => s + (parseFloat(r.nonOrganik) || 0), 0);
        const total    = totalOrg + totalNon;
        const rasioO   = total > 0 ? Math.round((totalOrg/total)*100) : 0;
        const rasioN   = 100 - rasioO;

        if($('stat-organik'))    $('stat-organik').innerHTML    = kgHtml(totalOrg);
        if($('stat-nonorganik')) $('stat-nonorganik').innerHTML = kgHtml(totalNon);
        if($('stat-total'))      $('stat-total').innerHTML      = kgHtml(total);
        if($('stat-rasio'))      $('stat-rasio').textContent    = `O: ${rasioO}% | N: ${rasioN}%`;
        if($('text-total-entri'))        $('text-total-entri').textContent        = data.length;
        if($('text-total-entri-mobile')) $('text-total-entri-mobile').textContent = data.length;
        if($('hero-stat-organik'))    $('hero-stat-organik').textContent    = fmt1(totalOrg)+' kg';
        if($('hero-stat-nonorganik')) $('hero-stat-nonorganik').textContent = fmt1(totalNon)+' kg';
        if($('dh-stat-organik'))      $('dh-stat-organik').textContent      = fmt1(totalOrg)+' kg';
        if($('dh-stat-nonorganik'))   $('dh-stat-nonorganik').textContent   = fmt1(totalNon)+' kg';
        if($('dh-rasio'))  $('dh-rasio').textContent  = `O: ${rasioO}% | N: ${rasioN}%`;
        if($('dh-entri'))  $('dh-entri').textContent  = `${data.length} Entri Data`;

        const tanggals = data.map(r => r.tanggal).filter(Boolean).sort();
        if (tanggals.length) {
            const fmtT = s => {
                try {
                    const [y,m,d] = s.split('-');
                    const B = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
                    return `${parseInt(d)} ${B[parseInt(m)-1]} ${y}`;
                } catch { return s; }
            };
            const str = tanggals.length > 1
                ? `${fmtT(tanggals[0])} – ${fmtT(tanggals[tanggals.length-1])}`
                : fmtT(tanggals[0]);
            if($('text-periode')) $('text-periode').textContent = str;
            if($('dh-periode'))   $('dh-periode').textContent   = str;
        }
    }

    // =========================================================================
    // RENDER: Tabel Data Sampah
    // =========================================================================
    let _sortCol = 'tanggal', _sortDir = 'desc';

    function renderDataTable(data) {
        const tbody = document.getElementById('table-body-sampah');
        if (!tbody) return;
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-400 dark:text-gray-500">Tidak ada data</td></tr>';
            return;
        }
        const sorted = [...data].sort((a, b) => {
            let vA = a[_sortCol] ?? '', vB = b[_sortCol] ?? '';
            if (typeof vA === 'string') vA = vA.toLowerCase();
            if (typeof vB === 'string') vB = vB.toLowerCase();
            return _sortDir === 'asc' ? (vA < vB ? -1 : vA > vB ? 1 : 0) : (vA > vB ? -1 : vA < vB ? 1 : 0);
        });
        tbody.innerHTML = sorted.map(item => {
            const org = parseFloat(item.organik)    || 0;
            const non = parseFloat(item.nonOrganik) || 0;
            return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="p-4 text-gray-600 dark:text-gray-300">${item.tanggal || '-'}</td>
                <td class="p-4 font-medium text-gray-700 dark:text-gray-200">${item.kelas || '-'}</td>
                <td class="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">${org.toFixed(2)} kg</td>
                <td class="p-4 text-orange-600 dark:text-orange-400 font-semibold">${non.toFixed(2)} kg</td>
                <td class="p-4 font-bold text-gray-700 dark:text-gray-200">${(org+non).toFixed(2)} kg</td>
            </tr>`;
        }).join('');
        document.querySelectorAll('[data-sort]').forEach(th => {
            th.onclick = () => {
                const col = th.dataset.sort;
                if (_sortCol === col) _sortDir = _sortDir === 'asc' ? 'desc' : 'asc';
                else { _sortCol = col; _sortDir = 'asc'; }
                renderDataTable(data);
            };
        });
    }

    // =========================================================================
    // RENDER: Matriks Per Tingkat
    // =========================================================================
    function renderMatriksStatistik(data) {
        const tbody = document.getElementById('table-body-matriks');
        if (!tbody) return;
        tbody.innerHTML = ['X','XI','XII'].map(t => {
            const s   = (data||[]).filter(r => r.tingkat === t);
            const org = s.reduce((a,r) => a + (r.organik||0), 0);
            const non = s.reduce((a,r) => a + (r.nonOrganik||0), 0);
            const tot = org + non;
            const ro  = tot > 0 ? (org/tot)*100 : 0;
            const [label, cls] = ro >= 70 ? ['🌟 Sangat Baik',   'text-emerald-600 dark:text-emerald-400']
                               : ro >= 50 ? ['✅ Baik',            'text-blue-600 dark:text-blue-400']
                               : ro >= 30 ? ['⚠️ Perlu Perhatian','text-amber-600 dark:text-amber-400']
                               : s.length  ? ['🔴 Kritis',         'text-red-600 dark:text-red-400']
                                           : ['— Tidak Ada Data',  'text-gray-400'];
            const avgO = s.length ? (org/s.length).toFixed(2) : '0.00';
            const avgN = s.length ? (non/s.length).toFixed(2) : '0.00';
            return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="p-4 font-bold text-gray-700 dark:text-gray-200">Tingkat ${t}</td>
                <td class="p-4 text-center">${s.length}</td>
                <td class="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">${avgO} kg</td>
                <td class="p-4 text-orange-600 dark:text-orange-400 font-semibold">${avgN} kg</td>
                <td class="p-4 font-semibold ${cls}">${label}</td>
            </tr>`;
        }).join('');
    }

    // =========================================================================
    // RENDER: Insight Otomatis
    // =========================================================================
    function generateAutomatedInterpretation(data) {
        const $ = id => document.getElementById(id);
        if (!data || data.length === 0) {
            [$('insight-hari-tertinggi'),$('insight-kelas-terbesar'),$('insight-dominasi-rasio')].forEach(el => { if(el) el.textContent = '-'; });
            if($('insight-narasi')) $('insight-narasi').textContent = 'Belum ada data untuk dianalisis.';
            return;
        }
        const perHari = {}, perKelas = {};
        let totalOrg = 0, totalNon = 0;
        data.forEach(r => {
            perHari[r.tanggal] = (perHari[r.tanggal] || 0) + (r.total || 0);
            perKelas[r.kelas]  = (perKelas[r.kelas]  || 0) + (r.total || 0);
            totalOrg += r.organik    || 0;
            totalNon += r.nonOrganik || 0;
        });
        const hariTop  = Object.entries(perHari).sort((a,b)=>b[1]-a[1])[0];
        const kelasTop = Object.entries(perKelas).sort((a,b)=>b[1]-a[1])[0];
        const total = totalOrg + totalNon;
        const roStr = total > 0 ? ((totalOrg/total)*100).toFixed(1) : '0.0';
        const rnStr = total > 0 ? ((totalNon/total)*100).toFixed(1) : '0.0';

        if($('insight-hari-tertinggi')  && hariTop)  $('insight-hari-tertinggi').textContent  = `${hariTop[0]} (${hariTop[1].toFixed(2)} kg)`;
        if($('insight-kelas-terbesar')  && kelasTop) $('insight-kelas-terbesar').textContent  = `${kelasTop[0]} (${kelasTop[1].toFixed(2)} kg)`;
        if($('insight-dominasi-rasio'))
            $('insight-dominasi-rasio').textContent = parseFloat(roStr) >= parseFloat(rnStr)
                ? `Organik dominan (${roStr}% vs ${rnStr}%)`
                : `Non-Organik dominan (${rnStr}% vs ${roStr}%)`;
        if($('insight-narasi')) {
            const ro = parseFloat(roStr);
            $('insight-narasi').textContent = ro >= 70
                ? `Sekolah berhasil mempertahankan dominasi sampah organik (${roStr}%). Pertahankan program pemilahan dan tingkatkan komposting.`
                : ro >= 50
                ? `Rasio organik ${roStr}% sudah cukup baik. Fokuskan kampanye pengurangan plastik di kelas ${kelasTop?.[0]||'-'}.`
                : `Sampah non-organik mendominasi (${rnStr}%). Rekomendasikan program zero-waste challenge dan pembatasan kemasan plastik.`;
        }
    }

    // =========================================================================
    // CORE ENGINE
    // =========================================================================
    let globalData = [];

    async function loadDashboardCoreEngine() {
        if (loader) loader.style.display = 'flex';
        try {
            if (typeof SpreadsheetEngine === 'undefined')
                throw new Error('SpreadsheetEngine tidak ditemukan.');

            globalData = await SpreadsheetEngine.FetchRealtimeData();
            console.log(`✅ Data dimuat: ${globalData.length} entri`, globalData[0] || '(kosong)');

            updateStatisticsCards(globalData);
            renderDataTable(globalData);
            renderMatriksStatistik(globalData);
            generateAutomatedInterpretation(globalData);

            if (typeof DashboardCharts !== 'undefined')
                DashboardCharts.UpdateAll(globalData);

            if (typeof DashboardFilters !== 'undefined') {
                DashboardFilters.Initialize(globalData, filtered => {
                    updateStatisticsCards(filtered);
                    renderDataTable(filtered);
                    renderMatriksStatistik(filtered);
                    generateAutomatedInterpretation(filtered);
                    if (typeof DashboardCharts !== 'undefined')
                        DashboardCharts.UpdateAll(filtered);
                });
            }
        } catch (err) {
            console.error('❌ loadDashboardCoreEngine:', err);
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    if (refreshBtn) refreshBtn.addEventListener('click', loadDashboardCoreEngine);
    await loadDashboardCoreEngine();
});