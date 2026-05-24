document.addEventListener('DOMContentLoaded', async () => {

    // =========================================================================
    // AUTH GUARD — Redirect ke login.html jika belum login
    // =========================================================================
    if (typeof AuthEngine !== 'undefined') {
        if (!AuthEngine.Guard()) return;
        AuthEngine.RenderUserInfo();
    }

    let globalData = [];
    
    let currentSortColumn = 'tanggal';
    let currentSortDirection = 'desc';
    let currentTableData = [];
    
    // =========================================================================
    // 0. DOM ELEMENTS MAPPING
    // =========================================================================
    const loader = document.getElementById('loading-overlay');
    const refreshBtn = document.getElementById('btn-refresh');
    const darkModeBtn = document.getElementById('dark-mode-toggle');

    const menuDashboard = document.getElementById('menu-dashboard');
    const menuDataSampah = document.getElementById('menu-data-sampah');
    const menuStatistik = document.getElementById('menu-statistik');
    const menuInput = document.getElementById('menu-input');
    
    const viewDashboard = document.getElementById('view-dashboard');
    const viewDataSampah = document.getElementById('view-data-sampah');
    const viewStatistik = document.getElementById('view-statistik');
    const viewInput = document.getElementById('view-input');

    const formInputSampah = document.getElementById('form-input-sampah');
    const inputTingkat = document.getElementById('input-tingkat');
    const inputKelas = document.getElementById('input-kelas');

    // Komponen CSV
    const formUploadCsv = document.getElementById('form-upload-csv');
    const inputCsv = document.getElementById('input-csv');
    const csvFileNameDisplay = document.getElementById('csv-file-name');
    const btnDownloadTemplate = document.getElementById('btn-download-template');

    // =========================================================================
    // 1. HYBRID NAVIGATION ENGINE
    // =========================================================================
    if (viewDashboard && viewDataSampah && viewStatistik && viewInput) {
        const activeClass = "flex items-center gap-3 px-4 py-3 bg-organik-light dark:bg-emerald-950/40 text-organik font-semibold rounded-xl transition-all";
        const inactiveClass = "flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all group";

        const mobileActive = "text-organik dark:text-emerald-400 font-bold scale-105";
        const mobileInactive = "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300";

        function switchTab(activeTab) {
            viewDashboard.classList.toggle('hidden', activeTab !== 'dashboard');
            viewDataSampah.classList.toggle('hidden', activeTab !== 'data-sampah');
            viewStatistik.classList.toggle('hidden', activeTab !== 'statistik');
            viewInput.classList.toggle('hidden', activeTab !== 'input'); 
            
            if (menuDashboard) menuDashboard.className = activeTab === 'dashboard' ? activeClass : inactiveClass;
            if (menuDataSampah) menuDataSampah.className = activeTab === 'data-sampah' ? activeClass : inactiveClass;
            if (menuStatistik) menuStatistik.className = activeTab === 'statistik' ? activeClass : inactiveClass;
            if (menuInput) menuInput.className = activeTab === 'input' ? activeClass : inactiveClass;

            const mDash = document.querySelector('.mobile-nav-btn.nav-dashboard');
            const mData = document.querySelector('.mobile-nav-btn.nav-data-sampah');
            const mStat = document.querySelector('.mobile-nav-btn.nav-statistik');
            const mInput = document.querySelector('.mobile-nav-btn.nav-input');

            if (mDash && mData && mStat && mInput) {
                mDash.className = `mobile-nav-btn nav-dashboard flex flex-col items-center gap-1 text-xs transition-all ${activeTab === 'dashboard' ? mobileActive : mobileInactive}`;
                mData.className = `mobile-nav-btn nav-data-sampah flex flex-col items-center gap-1 text-xs transition-all ${activeTab === 'data-sampah' ? mobileActive : mobileInactive}`;
                mStat.className = `mobile-nav-btn nav-statistik flex flex-col items-center gap-1 text-xs transition-all ${activeTab === 'statistik' ? mobileActive : mobileInactive}`;
                mInput.className = `mobile-nav-btn nav-input flex flex-col items-center gap-1 text-xs transition-all ${activeTab === 'input' ? mobileActive : mobileInactive}`;
            }
        }

        if (menuDashboard) menuDashboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
        if (menuDataSampah) menuDataSampah.addEventListener('click', (e) => { e.preventDefault(); switchTab('data-sampah'); });
        if (menuStatistik) menuStatistik.addEventListener('click', (e) => { e.preventDefault(); switchTab('statistik'); });
        if (menuInput) menuInput.addEventListener('click', (e) => { e.preventDefault(); switchTab('input'); });

        document.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.mobile-nav-btn');
            if (!targetBtn) return;
            
            e.preventDefault();
            if (targetBtn.classList.contains('nav-dashboard')) switchTab('dashboard');
            if (targetBtn.classList.contains('nav-data-sampah')) switchTab('data-sampah');
            if (targetBtn.classList.contains('nav-statistik')) switchTab('statistik');
            if (targetBtn.classList.contains('nav-input')) switchTab('input');
        });

        switchTab('dashboard');
    }

    // =========================================================================
    // 2. LOGIKA FORM DATA (MANUAL & CSV)
    // =========================================================================
    
    // --- GANTI URL DI BAWAH INI JIKA ANDA MELAKUKAN PENERAPAN BARU ---
    const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyR1ioSNTj9XeuOiwP6HvfLflgkLnxF_QoZrpsJkyhHAwPpyVgIf64fFHMtdeqgDbpG/exec'; 

    const daftarKelas = {
        'X': ['X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6', 'X-7', 'X-8', 'X-9', 'X-10'],
        'XI': ['XI-1', 'XI-2', 'XI-3', 'XI-4', 'XI-5', 'XI-6', 'XI-7', 'XI-8', 'XI-9', 'XI-10'],
        'XII':['XII-1', 'XII-2', 'XII-3', 'XII-4', 'XII-5', 'XII-6', 'XII-7', 'XII-8', 'XII-9', 'XII-10']
    };

    if (inputTingkat && inputKelas) {
        inputTingkat.addEventListener('change', function() {
            const tingkatTerpilih = this.value;
            inputKelas.innerHTML = '<option value="" disabled selected>Pilih Kelas</option>';
            if (daftarKelas[tingkatTerpilih]) {
                daftarKelas[tingkatTerpilih].forEach(kelas => {
                    const option = document.createElement('option');
                    option.value = kelas;
                    option.textContent = kelas;
                    inputKelas.appendChild(option);
                });
            }
        });
    }

    // A. Pengiriman Manual (Single Record)
    if (formInputSampah) {
        formInputSampah.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btnSubmit = document.getElementById('btn-submit-manual');
            const originalBtnText = btnSubmit.innerHTML;
            
            const inputOrganikKg = parseFloat(document.getElementById('input-organik').value) || 0;
            const inputNonOrganikKg = parseFloat(document.getElementById('input-nonorganik').value) || 0;

            const payload = {
                action: 'single', // Menandakan bahwa ini adalah input 1 baris
                tanggal: document.getElementById('input-tanggal').value,
                tingkat: document.getElementById('input-tingkat').value,
                kelas: document.getElementById('input-kelas').value,
                organik: inputOrganikKg * 1000, 
                nonOrganik: inputNonOrganikKg * 1000,
            };
            
            if (!payload.tanggal || !payload.tingkat || !payload.kelas) return alert('Mohon lengkapi semua data wajib!');

            try {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Menyimpan...';

                await fetch(GOOGLE_APP_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', 
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(payload)
                });

                alert('Berhasil! Data penimbangan sampah manual direkam.');
                formInputSampah.reset();
                inputKelas.innerHTML = '<option value="" disabled selected>Pilih Kelas</option>';
                
                setTimeout(() => {
                    document.getElementById('menu-data-sampah').click();
                    loadDashboardCoreEngine();
                }, 1000);
            } catch (error) {
                alert('Gagal merekam data. Pastikan koneksi internet stabil.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalBtnText;
            }
        });
    }

    // B. Logika CSV: Download Template
    if(btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener('click', () => {
        // Tanggal diubah ke format YYMMDD (Contoh: 260601 untuk 1 Juni 2026)
        const csvContent = "Tanggal(YYMMDD),Tingkat,Kelas,Organik (Kg),Non-Organik (Kg)\n260601,X,X-1,1.5,0.5\n260601,XI,XI-1,2.0,1.2";
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Template_Input_Sampah_Sman18.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

    // C. Logika CSV: Tampilkan Nama File
    if(inputCsv) {
        inputCsv.addEventListener('change', function() {
            if(this.files && this.files.length > 0) {
                csvFileNameDisplay.innerHTML = `<i class="fa-solid fa-check-circle"></i> File siap: <strong>${this.files[0].name}</strong>`;
                csvFileNameDisplay.classList.remove('hidden');
            } else {
                csvFileNameDisplay.classList.add('hidden');
            }
        });
    }

    // D. Logika CSV: Parsing dan Upload Massal
    if (formUploadCsv) {
        formUploadCsv.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const file = inputCsv.files[0];
            if(!file) return alert("Pilih file CSV terlebih dahulu!");

            const btnSubmit = document.getElementById('btn-submit-csv');
            const originalText = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Memproses File...';

            const reader = new FileReader();
            reader.onload = async function(event) {
                const text = event.target.result;
                // Memisahkan berdasarkan baris dan membuang baris kosong
                const rows = text.split('\n').map(row => row.trim()).filter(row => row !== '');
                
                // Menghapus header (baris pertama)
                rows.shift(); 
                
                if(rows.length === 0) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalText;
                    return alert("File CSV kosong atau format tidak sesuai template.");
                }

                // Memetakan ke Array Object JSON
                const bulkData = rows.map(row => {
                    // split by comma (hati-hati jika ada koma di dalam string/angka)
                    const cols = row.split(',');
                    return {
                        tanggal: cols[0],
                        tingkat: cols[1],
                        kelas: cols[2],
                        organik: (parseFloat(cols[3]) || 0) * 1000,
                        nonOrganik: (parseFloat(cols[4]) || 0) * 1000
                    }
                });

                try {
                    const payload = {
                        action: 'bulk', // Penanda bahwa ini adalah upload massal
                        data: JSON.stringify(bulkData) // Mengkonversi array ke string
                    };

                    await fetch(GOOGLE_APP_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams(payload)
                    });

                    alert(`Berhasil! ${bulkData.length} baris data berhasil dikirim ke database.`);
                    formUploadCsv.reset();
                    csvFileNameDisplay.classList.add('hidden');

                    setTimeout(() => {
                        document.getElementById('menu-data-sampah').click();
                        loadDashboardCoreEngine();
                    }, 1000);

                } catch(err) {
                    console.error("Gagal CSV:", err);
                    alert("Gagal mengunggah CSV. Periksa kembali format file atau koneksi Anda.");
                } finally {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalText;
                }
            };

            reader.readAsText(file);
        });
    }

    // =========================================================================
    // 3. UI DATA RENDERERS & STATS CALCULATOR
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
        currentTableData = [...data];
        applyTableSortAndRender();
    }

    function applyTableSortAndRender() {
        const tableBody = document.getElementById('table-body-sampah');
        if (!tableBody) return;

        const sortedData = [...currentTableData].sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];

            if (valA === undefined) valA = '';
            if (valB === undefined) valB = '';

            if (currentSortColumn === 'organik' || currentSortColumn === 'nonOrganik' || currentSortColumn === 'total') {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            } else {
                valA = valA.toString().toLowerCase();
                valB = valB.toString().toLowerCase();
            }

            if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        document.querySelectorAll('#view-data-sampah th[data-sort]').forEach(th => {
            const icon = th.querySelector('.sort-icon');
            if(icon) {
                icon.className = 'fa-solid fa-sort text-gray-300 group-hover:text-gray-400 sort-icon transition-all';
                if (th.getAttribute('data-sort') === currentSortColumn) {
                    if (currentSortDirection === 'asc') {
                        icon.className = 'fa-solid fa-sort-up text-organik sort-icon scale-110';
                    } else {
                        icon.className = 'fa-solid fa-sort-down text-organik sort-icon scale-110';
                    }
                }
            }
        });

        tableBody.innerHTML = ""; 
        if (sortedData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-400 dark:text-gray-500 font-medium">Tidak ada data yang cocok dengan filter saat ini.</td></tr>`;
            return;
        }

        sortedData.forEach(item => {
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

    document.querySelectorAll('#view-data-sampah th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            if (currentSortColumn === column) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortDirection = 'asc';
            }
            applyTableSortAndRender();
        });
    });

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
    // 4. CORE INIT ENGINE
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
                if (typeof DashboardCharts !== 'undefined') DashboardCharts.Initialize(globalData);
            } catch (chartError) {
                console.error("Gagal grafik:", chartError);
            }

            if (typeof DashboardFilters !== 'undefined') {
                DashboardFilters.Initialize(globalData, (filteredData) => {
                    updateStatisticsCards(filteredData);
                    renderDataTable(filteredData); 
                    renderStatistikMatriks(filteredData);
                    generateAutomatedInterpretation(filteredData);
                    try {
                        if (typeof DashboardCharts !== 'undefined') DashboardCharts.UpdateAll(filteredData);
                    } catch(e) {}
                });
            }

        } catch (mainError) {
            console.error("Error utama:", mainError);
        } finally {
            if(loader) {
                loader.classList.add('opacity-0');
                setTimeout(() => loader.style.display = 'none', 300);
            }
        }
    }

    if(refreshBtn) refreshBtn.addEventListener('click', () => loadDashboardCoreEngine()); 

    if(darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            const docHtml = document.documentElement;
            docHtml.classList.toggle('dark');
            localStorage.setItem('theme', docHtml.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // Tombol Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout && typeof AuthEngine !== 'undefined') {
        btnLogout.addEventListener('click', () => {
            AuthEngine.Logout(GOOGLE_APP_SCRIPT_URL);
        });
    }

    await loadDashboardCoreEngine();

    setInterval(async () => {
        try {
            globalData = await SpreadsheetEngine.FetchRealtimeData(); 
            updateStatisticsCards(globalData);
            renderDataTable(globalData); 
            renderStatistikMatriks(globalData); 
            generateAutomatedInterpretation(globalData);
            if (typeof DashboardCharts !== 'undefined') DashboardCharts.UpdateAll(globalData);
        } catch(e) {}
    }, 30000);
});