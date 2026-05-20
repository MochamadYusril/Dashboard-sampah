// Application Bootstrapper Framework Lifecycles
document.addEventListener('DOMContentLoaded', async () => {
    let globalData = [];
    
    // Elements Mapping
    const loader = document.getElementById('loading-overlay');
    const refreshBtn = document.getElementById('btn-refresh');
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    const excelBtn = document.getElementById('btn-export-excel');
    const pdfBtn = document.getElementById('btn-export-pdf');

    // Navigation Tabs Elements
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuDataSampah = document.getElementById('menu-data-sampah');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewDataSampah = document.getElementById('view-data-sampah');

    // =========================================================================
    // 1. BULLETPROOF NAVIGATION ENGINE (Ditaruh di atas agar instan bisa diklik)
    // =========================================================================
    if (menuDashboard && menuDataSampah && viewDashboard && viewDataSampah) {
        menuDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            // Efek Aktif Menu Dashboard
            menuDashboard.className = "flex items-center gap-3 px-4 py-3 bg-organik-light dark:bg-emerald-950/40 text-organik font-semibold rounded-xl transition-all";
            menuDataSampah.className = "flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all group";
            
            // Tukar Tampilan Kontainer
            viewDashboard.classList.remove('hidden');
            viewDataSampah.classList.add('hidden');
        });

        menuDataSampah.addEventListener('click', (e) => {
            e.preventDefault();
            // Efek Aktif Menu Data Sampah
            menuDataSampah.className = "flex items-center gap-3 px-4 py-3 bg-organik-light dark:bg-emerald-950/40 text-organik font-semibold rounded-xl transition-all";
            menuDashboard.className = "flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all group";
            
            // Tukar Tampilan Kontainer
            viewDashboard.classList.add('hidden');
            viewDataSampah.classList.remove('hidden');
        });
        console.log("Sistem Navigasi Tab: Berhasil diinisialisasi.");
    } else {
        console.error("Sistem Navigasi Gagal: Pastikan ID 'menu-dashboard', 'menu-data-sampah', 'view-dashboard', dan 'view-data-sampah' sudah terpasang di file index.html Anda.");
    }

    // =========================================================================
    // 2. UI DATA RENDERERS & STATS CALCULATOR
    // =========================================================================
    function updateStatisticsCards(data) {
        let totalO = 0, totalN = 0, totalAll = 0;
        data.forEach(d => {
            totalO += d.organik;
            totalN += d.nonOrganik;
            totalAll += d.total;
        });

        document.getElementById('stat-organik').innerHTML = `${totalO.toFixed(1)} <span class="text-xs font-normal opacity-70">kg</span>`;
        document.getElementById('stat-nonorganik').innerHTML = `${totalN.toFixed(1)} <span class="text-xs font-normal opacity-70">kg</span>`;
        document.getElementById('stat-total').innerHTML = `${totalAll.toFixed(1)} <span class="text-xs font-normal opacity-70">kg</span>`;

        const pctO = totalAll > 0 ? ((totalO / totalAll) * 100).toFixed(0) : 0;
        const pctN = totalAll > 0 ? ((totalN / totalAll) * 100).toFixed(0) : 0;
        document.getElementById('stat-rasio').innerText = `O: ${pctO}% | N: ${pctN}%`;
        
        document.getElementById('text-total-entri').innerText = data.length;
        if(data.length > 0) {
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
                    <td class="p-4 text-gray-600 dark:text-gray-400 font-medium">${item.tanggal}</td>
                    <td class="p-4 font-semibold text-gray-900 dark:text-white">${item.kelas}</td>
                    <td class="p-4 text-emerald-600 dark:text-emerald-400 font-medium">${item.organik.toFixed(1)}</td>
                    <td class="p-4 text-orange-600 dark:text-orange-400 font-medium">${item.nonOrganik.toFixed(1)}</td>
                    <td class="p-4 font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/30">${item.total.toFixed(1)}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    function generateAutomatedInterpretation(data) {
        if(data.length === 0) return;

        const days = {};
        const classes = {};
        let totalO = 0, totalAll = 0;

        data.forEach(d => {
            days[d.tanggal] = (days[d.tanggal] || 0) + d.total;
            classes[d.kelas] = (classes[d.kelas] || 0) + d.total;
            totalO += d.organik;
            totalAll += d.total;
        });

        const topDay = Object.entries(days).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
        const topClass = Object.entries(classes).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
        const ratioO = totalAll > 0 ? (totalO / totalAll) * 100 : 0;

        document.getElementById('insight-hari-tertinggi').innerText = topDay;
        document.getElementById('insight-kelas-terbesar').innerText = topClass;
        document.getElementById('insight-dominasi-rasio').innerText = ratioO > 50 ? "Didominasi Organik" : "Didominasi Non-Organik";

        let narasi = "";
        if (ratioO > 60) {
            narasi = `Sistem mencatat timbulan didominasi penuh oleh material organik sebesar ${ratioO.toFixed(0)}%. Rekomendasi: SMAN 18 Bandung disarankan mengoptimalkan program pembuatan kompos cair/biopori di area taman sekolah secara intensif.`;
        } else if (ratioO < 40) {
            narasi = `Tingginya volume sampah non-organik memerlukan perhatian. Strategi: Galakkan program pemilahan botol plastik bernilai ekonomis tinggi untuk disalurkan langsung menuju Bank Sampah binaan sekolah.`;
        } else {
            narasi = `Rasio penumpukan terpantau seimbang antara organik dan non-organik. Pertahankan monitoring berkala serta tingkatkan edukasi pemilahan mandiri mulai dari ruang kelas terkecil.`;
        }
        document.getElementById('insight-narasi').innerText = narasi;
    }

    // =========================================================================
    // 3. CORE INIT ENGINE (Pemanggilan Data & Handling Error Grafik)
    // =========================================================================
    async function loadDashboardCoreEngine() {
        loader.classList.remove('opacity-0');
        loader.style.display = 'flex';

        try {
            // Ambil data dari spreadsheet (Akan otomatis beralih ke Dummy jika API 404)
            globalData = await SpreadsheetEngine.FetchRealtimeData();
            
            updateStatisticsCards(globalData);
            renderDataTable(globalData); 
            
            // Bungkus inisialisasi chart agar jika file charts.js hilal/404, sisa sistem tidak mogok
            try {
                if (typeof DashboardCharts !== 'undefined') {
                    DashboardCharts.Initialize(globalData);
                } else {
                    console.warn("DashboardCharts belum siap atau file charts.js tidak ditemukan.");
                }
            } catch (chartError) {
                console.error("Gagal menggambar grafik objek Chart.js:", chartError);
            }

            generateAutomatedInterpretation(globalData);
            
            // Pasang filter interaktif
            if (typeof DashboardFilters !== 'undefined') {
                DashboardFilters.Initialize(globalData, (filteredData) => {
                    updateStatisticsCards(filteredData);
                    renderDataTable(filteredData); 
                    try {
                        if (typeof DashboardCharts !== 'undefined') DashboardCharts.UpdateAll(filteredData);
                    } catch(e) { console.error(e); }
                    generateAutomatedInterpretation(filteredData);
                });
            }

        } catch (mainError) {
            console.error("Terjadi kesalahan sistem utama:", mainError);
        } finally {
            loader.classList.add('opacity-0');
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }

    // =========================================================================
    // 4. GLOBAL COMPONENT EVENT BINDINGS
    // =========================================================================
    if(refreshBtn) refreshBtn.addEventListener('click', () => location.reload());
    if(excelBtn) excelBtn.addEventListener('click', () => DataExporter.ExportToCSV(globalData));
    if(pdfBtn) pdfBtn.addEventListener('click', () => DataExporter.ExportToPDF());

    if(darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            const docHtml = document.documentElement;
            if(docHtml.classList.contains('dark')) {
                docHtml.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                docHtml.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Eksekusi Mesin Utama
    await loadDashboardCoreEngine();

    // Auto Refresh Sync Data (Setiap 30 Detik)
    setInterval(async () => {
        console.log("Sinkronisasi otomatis basis data Google Spreadsheet sedang berjalan...");
        try {
            const updateFreshData = await SpreadsheetEngine.FetchRealtimeData();
            updateStatisticsCards(updateFreshData);
            renderDataTable(updateFreshData); 
            if (typeof DashboardCharts !== 'undefined') {
                DashboardCharts.UpdateAll(updateFreshData);
            }
            generateAutomatedInterpretation(updateFreshData);
        } catch(e) {
            console.error("Gagal sinkronisasi otomatis:", e);
        }
    }, 30000);
});