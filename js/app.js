// Application Bootstrapper Framework Lifecycles
document.addEventListener('DOMContentLoaded', async () => {
    let globalData = [];
    
    // =========================================================================
    // 0. DOM ELEMENTS MAPPING
    // =========================================================================
    const loader = document.getElementById('loading-overlay');
    const refreshBtn = document.getElementById('btn-refresh');
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    const excelBtn = document.getElementById('btn-export-excel');
    const pdfBtn = document.getElementById('btn-export-pdf');

    // Navigation Tabs Elements (Desktop Sidebar)
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuDataSampah = document.getElementById('menu-data-sampah');
    const menuStatistik = document.getElementById('menu-statistik');
    
    // View Containers
    const viewDashboard = document.getElementById('view-dashboard');
    const viewDataSampah = document.getElementById('view-data-sampah');
    const viewStatistik = document.getElementById('view-statistik');

    // =========================================================================
    // 1. HYBRID NAVIGATION ENGINE (Mendukung Desktop Sidebar & Mobile Bottom Nav)
    // =========================================================================
    if (viewDashboard && viewDataSampah && viewStatistik) {
        
        // Gaya kelas CSS untuk Desktop Sidebar
        const activeClass = "flex items-center gap-3 px-4 py-3 bg-organik-light dark:bg-emerald-950/40 text-organik font-semibold rounded-xl transition-all";
        const inactiveClass = "flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all group";

        // Gaya kelas CSS untuk Mobile Bottom Navigation Bar
        const mobileActive = "text-organik dark:text-emerald-400 font-bold scale-105";
        const mobileInactive = "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300";

        function switchTab(activeTab) {
            // A. Tukar Status Tampilan Kontainer View (Hidden / Show)
            viewDashboard.classList.toggle('hidden', activeTab !== 'dashboard');
            viewDataSampah.classList.toggle('hidden', activeTab !== 'data-sampah');
            viewStatistik.classList.toggle('hidden', activeTab !== 'statistik');
            
            // B. Perbarui Tampilan Aktif Menu Desktop Sidebar (jika elemen eksis)
            if (menuDashboard) menuDashboard.className = activeTab === 'dashboard' ? activeClass : inactiveClass;
            if (menuDataSampah) menuDataSampah.className = activeTab === 'data-sampah' ? activeClass : inactiveClass;
            if (menuStatistik) menuStatistik.className = activeTab === 'statistik' ? activeClass : inactiveClass;

            // C. Perbarui Tampilan Aktif Menu Mobile Bottom Navigation
            const mDash = document.querySelector('.mobile-nav-btn.nav-dashboard');
            const mData = document.querySelector('.mobile-nav-btn.nav-data-sampah');
            const mStat = document.querySelector('.mobile-nav-btn.nav-statistik');

            if (mDash && mData && mStat) {
                mDash.className = `mobile-nav-btn nav-dashboard flex flex-col items-center gap-1 text-xs transition-all ${activeTab === 'dashboard' ? mobileActive : mobileInactive}`;
                mData.className = `mobile-nav-btn nav-data-sampah flex flex-col items-center gap-1 text-xs transition-all ${activeTab === 'data-sampah' ? mobileActive : mobileInactive}`;
                mStat.className = `mobile-nav-btn nav-statistik flex flex-col items-center gap-1 text-xs transition-all ${activeTab === 'statistik' ? mobileActive : mobileInactive}`;
            }
        }

        // --- Event Listener Menu Desktop ---
        if (menuDashboard) menuDashboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
        if (menuDataSampah) menuDataSampah.addEventListener('click', (e) => { e.preventDefault(); switchTab('data-sampah'); });
        if (menuStatistik) menuStatistik.addEventListener('click', (e) => { e.preventDefault(); switchTab('statistik'); });

        // --- Event Listener Menu Mobile Bottom Nav (Delegasi Klik) ---
        document.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.mobile-nav-btn');
            if (!targetBtn) return;
            
            e.preventDefault();
            if (targetBtn.classList.contains('nav-dashboard')) switchTab('dashboard');
            if (targetBtn.classList.contains('nav-data-sampah')) switchTab('data-sampah');
            if (targetBtn.classList.contains('nav-statistik')) switchTab('statistik');
        });

        // Set default tab pertama saat aplikasi dimuat
        switchTab('dashboard');
        console.log("Sistem Navigasi Hybrid (Desktop & Mobile) berhasil berjalan.");
    } else {
        console.error("Sistem Navigasi Gagal: Container view tidak ditemukan.");
    }

    // =========================================================================
    // 2. UI DATA RENDERERS & STATS CALCULATOR
    // =========================================================================
    function updateStatisticsCards(data) {
        let totalO = 0, totalN = 0, totalAll = 0;
        data.forEach(d => {
            totalO += (d.organik || 0);
            totalN += (d.nonOrganik || 0);
            totalAll += (d.total || 0);
        });

        const safeSetHTML = (id, html) => { if(document.getElementById(id)) document.getElementById(id).innerHTML = html; };
        
        safeSetHTML('stat-organik', `${totalO.toFixed(1)} <span class="text-xs font-normal opacity-70">kg</span>`);
        safeSetHTML('stat-nonorganik', `${totalN.toFixed(1)} <span class="text-xs font-normal opacity-70">kg</span>`);
        safeSetHTML('stat-total', `${totalAll.toFixed(1)} <span class="text-xs font-normal opacity-70">kg</span>`);

        const pctO = totalAll > 0 ? ((totalO / totalAll) * 100).toFixed(0) : 0;
        const pctN = totalAll > 0 ? ((totalN / totalAll) * 100).toFixed(0) : 0;
        
        if(document.getElementById('stat-rasio')) document.getElementById('stat-rasio').innerText = `O: ${pctO}% | N: ${pctN}%`;
        if(document.getElementById('text-total-entri')) document.getElementById('text-total-entri').innerText = data.length;
        
        if(data.length > 0 && document.getElementById('text-periode')) {
            const dates = data.map(d => d.tanggal).sort();
            document.getElementById('text-periode').innerText = `${dates[0]} s/d ${dates[dates.length - 1]}`;
        }
    }

    function renderDataTable(data) {
        const tableBody = document.getElementById('table-body-sampah');
        if (!tableBody) return; 

        tableBody.innerHTML = ""; 

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-8 text-center text-gray-400 dark:text-gray-500 font-medium">
                        Tidak ada data yang cocok dengan filter saat ini.
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(item => {
            const row = `
                <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="p-4 text-gray-600 dark:text-gray-400 font-medium">${item.tanggal || '-'}</td>
                    <td class="p-4 font-semibold text-gray-900 dark:text-white">${item.kelas || '-'}</td>
                    <td class="p-4 text-emerald-600 dark:text-emerald-400 font-medium">${(item.organik || 0).toFixed(1)}</td>
                    <td class="p-4 text-orange-600 dark:text-orange-400 font-medium">${(item.nonOrganik || 0).toFixed(1)}</td>
                    <td class="p-4 font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/30">${(item.total || 0).toFixed(1)}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    function renderStatistikMatriks(data) {
        const matrixBody = document.getElementById('table-body-matriks');
        if (!matrixBody) return;

        const tingkatGroups = {
            'X': { entri: 0, organikTotal: 0, nonOrganikTotal: 0 },
            'XI': { entri: 0, organikTotal: 0, nonOrganikTotal: 0 },
            'XII': { entri: 0, organikTotal: 0, nonOrganikTotal: 0 }
        };

        data.forEach(item => {
            let tingkat = item.tingkat;
            
            // Perbaikan Bug: Pengecekan XII harus dilakukan sebelum XI
            if (!tingkat && item.kelas) {
                const upperKelas = item.kelas.toUpperCase();
                if (upperKelas.startsWith('XII')) tingkat = 'XII';
                else if (upperKelas.startsWith('XI')) tingkat = 'XI';
                else if (upperKelas.startsWith('X')) tingkat = 'X';
            }

            if (tingkat && tingkatGroups[tingkat]) {
                tingkatGroups[tingkat].entri++;
                tingkatGroups[tingkat].organikTotal += (item.organik || 0);
                tingkatGroups[tingkat].nonOrganikTotal += (item.nonOrganik || 0);
            }
        });

        matrixBody.innerHTML = "";

        Object.keys(tingkatGroups).forEach(tk => {
            const group = tingkatGroups[tk];
            const avgO = group.entri > 0 ? (group.organikTotal / group.entri).toFixed(2) : "0.00";
            const avgN = group.entri > 0 ? (group.nonOrganikTotal / group.entri).toFixed(2) : "0.00";

            const row = `
                <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="p-4 text-gray-900 dark:text-white font-semibold">Tingkat ${tk}</td>
                    <td class="p-4 text-gray-600 dark:text-gray-400 font-medium">${group.entri} Entri</td>
                    <td class="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">${avgO} kg</td>
                    <td class="p-4 text-orange-600 dark:text-orange-400 font-semibold">${avgN} kg</td>
                </tr>
            `;
            matrixBody.insertAdjacentHTML('beforeend', row);
        });
    }

    function generateAutomatedInterpretation(data) {
        if(data.length === 0) return;

        const days = {};
        const classes = {};
        let totalO = 0, totalAll = 0;

        data.forEach(d => {
            days[d.tanggal] = (days[d.tanggal] || 0) + (d.total || 0);
            classes[d.kelas] = (classes[d.kelas] || 0) + (d.total || 0);
            totalO += (d.organik || 0);
            totalAll += (d.total || 0);
        });

        const topDay = Object.entries(days).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
        const topClass = Object.entries(classes).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
        const ratioO = totalAll > 0 ? (totalO / totalAll) * 100 : 0;

        if(document.getElementById('insight-hari-tertinggi')) document.getElementById('insight-hari-tertinggi').innerText = topDay;
        if(document.getElementById('insight-kelas-terbesar')) document.getElementById('insight-kelas-terbesar').innerText = topClass;
        if(document.getElementById('insight-dominasi-rasio')) document.getElementById('insight-dominasi-rasio').innerText = ratioO > 50 ? "Didominasi Organik" : "Didominasi Non-Organik";

        let narasi = "";
        if (ratioO > 60) {
            narasi = `Sistem mencatat timbulan didominasi penuh oleh material organik sebesar ${ratioO.toFixed(0)}%. Rekomendasi: SMAN 18 Bandung disarankan mengoptimalkan program pembuatan kompos cair/biopori di area taman sekolah secara intensif.`;
        } else if (ratioO < 40) {
            narasi = `Tingginya volume sampah non-organik memerlukan perhatian. Strategi: Galakkan program pemilahan botol plastik bernilai ekonomis tinggi untuk disalurkan langsung menuju Bank Sampah binaan sekolah.`;
        } else {
            narasi = `Rasio penumpukan terpantau seimbang antara organik dan non-organik. Pertahankan monitoring berkala serta tingkatkan edukasi pemilahan mandiri mulai dari ruang kelas terkecil.`;
        }
        
        if(document.getElementById('insight-narasi')) document.getElementById('insight-narasi').innerText = narasi;
    }

    // =========================================================================
    // 3. CORE INIT ENGINE
    // =========================================================================
    async function loadDashboardCoreEngine() {
        if(loader) {
            loader.classList.remove('opacity-0');
            loader.style.display = 'flex';
        }

        try {
            globalData = await SpreadsheetEngine.FetchRealtimeData();
            
            updateStatisticsCards(globalData);
            renderDataTable(globalData); 
            renderStatistikMatriks(globalData);
            generateAutomatedInterpretation(globalData);
            
            try {
                if (typeof DashboardCharts !== 'undefined') {
                    DashboardCharts.Initialize(globalData);
                } else {
                    console.warn("Modul DashboardCharts belum siap.");
                }
            } catch (chartError) {
                console.error("Gagal menggambar grafik objek Chart.js:", chartError);
            }

            // Pasang filter interaktif
            if (typeof DashboardFilters !== 'undefined') {
                DashboardFilters.Initialize(globalData, (filteredData) => {
                    updateStatisticsCards(filteredData);
                    renderDataTable(filteredData); 
                    renderStatistikMatriks(filteredData);
                    generateAutomatedInterpretation(filteredData);
                    try {
                        if (typeof DashboardCharts !== 'undefined') DashboardCharts.UpdateAll(filteredData);
                    } catch(e) { console.error(e); }
                });
            }

        } catch (mainError) {
            console.error("Terjadi kesalahan sistem utama:", mainError);
        } finally {
            if(loader) {
                loader.classList.add('opacity-0');
                setTimeout(() => loader.style.display = 'none', 300);
            }
        }
    }

    // =========================================================================
    // 4. GLOBAL COMPONENT EVENT BINDINGS
    // =========================================================================
    if(refreshBtn) refreshBtn.addEventListener('click', () => loadDashboardCoreEngine()); // Update tanpa hard-reload
    if(excelBtn) excelBtn.addEventListener('click', () => typeof DataExporter !== 'undefined' ? DataExporter.ExportToCSV(globalData) : console.warn('DataExporter belum diinisialisasi.'));
    if(pdfBtn) pdfBtn.addEventListener('click', () => typeof DataExporter !== 'undefined' ? DataExporter.ExportToPDF() : console.warn('DataExporter belum diinisialisasi.'));

    if(darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            const docHtml = document.documentElement;
            docHtml.classList.toggle('dark');
            localStorage.setItem('theme', docHtml.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // Eksekusi Mesin Utama
    await loadDashboardCoreEngine();

    // Auto Refresh Sync Data (Setiap 30 Detik)
    setInterval(async () => {
        console.log("Sinkronisasi otomatis basis data Google Spreadsheet sedang berjalan...");
        try {
            const updateFreshData = await SpreadsheetEngine.FetchRealtimeData();
            globalData = updateFreshData; // Update variabel global agar fitur export tetap akurat
            
            updateStatisticsCards(globalData);
            renderDataTable(globalData); 
            renderStatistikMatriks(globalData); 
            generateAutomatedInterpretation(globalData);
            
            if (typeof DashboardCharts !== 'undefined') {
                DashboardCharts.UpdateAll(globalData);
            }
        } catch(e) {
            console.error("Gagal sinkronisasi otomatis:", e);
        }
    }, 30000);
});