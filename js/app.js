// Application Bootstrapper Framework Lifecycles
document.addEventListener('DOMContentLoaded', async () => {
    let globalData = [];
    
    // Elements Mapping
    const loader = document.getElementById('loading-overlay');
    const refreshBtn = document.getElementById('btn-refresh');
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    const excelBtn = document.getElementById('btn-export-excel');
    const pdfBtn = document.getElementById('btn-export-pdf');

    // UI Updater Function
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
        
        // Metadata text updates
        document.getElementById('text-total-entri').innerText = data.length;
        if(data.length > 0) {
            const dates = data.map(d => d.tanggal).sort();
            document.getElementById('text-periode').innerText = `${dates[0]} s/d ${dates[dates.length - 1]}`;
        }
    }

    // Automated Interpretation Generator
    function generateAutomatedInterpretation(data) {
        if(data.length === 0) return;

        // Peak Day calculation
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

        // Generate dynamic academic insights text
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

    // Core Init Engine with Defensive Code Structure
    async function loadDashboardCoreEngine() {
        // 1. Tampilkan loader di awal
        loader.classList.remove('opacity-0');
        loader.style.display = 'flex';

        try {
            // 2. Ambil data dari spreadsheet
            globalData = await SpreadsheetEngine.FetchRealtimeData();
            
            // 3. Perbarui komponen UI Statistik dasar
            updateStatisticsCards(globalData);
            
            // Pemicu grafik dibungkus agar jika Chart.js gagal, filter & interpretasi tetap jalan
            try {
                DashboardCharts.Initialize(globalData);
            } catch (chartError) {
                console.error("Gagal menggambar grafik objek Chart.js:", chartError);
            }

            generateAutomatedInterpretation(globalData);
            
            // 4. Pasang filter data interaktif
            DashboardFilters.Initialize(globalData, (filteredData) => {
                updateStatisticsCards(filteredData);
                try {
                    DashboardCharts.UpdateAll(filteredData);
                } catch(e) { console.error(e); }
                generateAutomatedInterpretation(filteredData);
            });

        } catch (mainError) {
            console.error("Terjadi kesalahan sistem utama:", mainError);
        } finally {
            // 5. Blok Pengaman Utama: Loading screen dipaksa mati apa pun kondisinya
            loader.classList.add('opacity-0');
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }

    // Event Bindings
    refreshBtn.addEventListener('click', () => location.reload());
    excelBtn.addEventListener('click', () => DataExporter.ExportToCSV(globalData));
    pdfBtn.addEventListener('click', () => DataExporter.ExportToPDF());

    // Dark Mode Core Management Engine
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

    // ==========================================
    // UTAMA: PERINTAH UNTUK MENJALANKAN SISTEM
    // ==========================================
    await loadDashboardCoreEngine();

    // AUTO REFRESH LOOP EXECUTION: Sinkronisasi Google Spreadsheet setiap 30 detik
    setInterval(async () => {
        console.log("Sinkronisasi otomatis basis data Google Spreadsheet sedang berjalan...");
        const updateFreshData = await SpreadsheetEngine.FetchRealtimeData();
        updateStatisticsCards(updateFreshData);
        try {
            DashboardCharts.UpdateAll(updateFreshData);
        } catch(e) { console.error(e); }
        generateAutomatedInterpretation(updateFreshData);
    }, 30000);
});