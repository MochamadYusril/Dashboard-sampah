// Render & Update Management Engines Chart.js
const DashboardCharts = {
    instances: {},

    Initialize(data) {
        // Render Halaman Utama / Dashboard
        this.RenderChartA(data);
        this.RenderChartB(data);
        this.RenderChartC(data);
        this.RenderChartD(data);
        
        // Render Halaman Statistik (Baru)
        this.RenderChartE(data);
        this.RenderChartF(data);
        this.RenderMatriksTable(data);
    },

    UpdateAll(filteredData) {
        // Hancurkan semua grafik lama secara otomatis untuk mencegah error "Canvas already in use"
        Object.keys(this.instances).forEach(key => {
            if (this.instances[key]) {
                this.instances[key].destroy();
            }
        });
        this.Initialize(filteredData);
    },

    // Chart A: Kombinasi Line + Stacked Bar (Tren Harian)
    RenderChartA(data) {
        const grouped = {};
        data.forEach(d => {
            if (!grouped[d.tanggal]) grouped[d.tanggal] = { o: 0, n: 0, t: 0 };
            grouped[d.tanggal].o += d.organik;
            grouped[d.tanggal].n += d.nonOrganik;
            grouped[d.tanggal].t += d.total;
        });

        const labels = Object.keys(grouped).sort();
        const dataO = labels.map(l => grouped[l].o.toFixed(2));
        const dataN = labels.map(l => grouped[l].n.toFixed(2));
        const dataT = labels.map(l => grouped[l].t.toFixed(2));

        const ctx = document.getElementById('chartTrenHarian').getContext('2d');
        this.instances.chartA = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Total (Line)', type: 'line', data: dataT, borderColor: '#1E293B', borderWidth: 2, pointBackgroundColor: '#1E293B', fill: false, order: 1 },
                    { label: 'Organik', data: dataO, backgroundColor: '#10B981', order: 2 },
                    { label: 'Non-Organik', data: dataN, backgroundColor: '#F97316', order: 3 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                plugins: { legend: { position: 'top' } }
            }
        });
    },

    // Chart B: Horizontal Bar Chart (Top 10 Kelas)
    RenderChartB(data) {
        const classes = {};
        data.forEach(d => {
            classes[d.kelas] = (classes[d.kelas] || 0) + d.total;
        });

        const sorted = Object.entries(classes).sort((a,b) => b[1] - a[1]).slice(0, 10);
        const labels = sorted.map(s => s[0]);
        const values = sorted.map(s => s[1].toFixed(2));

        const ctx = document.getElementById('chartRankingKelas').getContext('2d');
        this.instances.chartB = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ label: 'Total Volume (kg)', data: values, backgroundColor: '#3B82F6', borderRadius: 8 }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true } }
            }
        });
    },

    // Chart C: Horizontal Stacked Bar Chart (Komposisi per Kelas)
    RenderChartC(data) {
        const classes = {};
        data.forEach(d => {
            if(!classes[d.kelas]) classes[d.kelas] = { o:0, n:0 };
            classes[d.kelas].o += d.organik;
            classes[d.kelas].n += d.nonOrganik;
        });

        const labels = Object.keys(classes);
        const dataO = labels.map(l => classes[l].o.toFixed(2));
        const dataN = labels.map(l => classes[l].n.toFixed(2));

        const ctx = document.getElementById('chartKomposisiKelas').getContext('2d');
        this.instances.chartC = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Organik', data: dataO, backgroundColor: '#10B981' },
                    { label: 'Non-Organik', data: dataN, backgroundColor: '#F97316' }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true } }
            }
        });
    },

    // Chart D: Perbandingan Antar Tingkat
    RenderChartD(data) {
        const levels = { "X": 0, "XI": 0, "XII": 0 };
        data.forEach(d => {
            if(levels[d.tingkat] !== undefined) levels[d.tingkat] += d.total;
        });

        const ctx = document.getElementById('chartPerbandinganTingkat').getContext('2d');
        this.instances.chartD = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(levels),
                datasets: [{ label: 'Kontribusi Tingkat (kg)', data: Object.values(levels).map(v => v.toFixed(2)), backgroundColor: ['#A855F7','#6366F1','#EC4899'], borderRadius: 6 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    // BARU - Chart E: Analisis Komparatif Akumulasi Sampah Per Tingkat (Halaman Statistik)
    RenderChartE(data) {
        const levels = {
            "X": { organik: 0, nonOrganik: 0 },
            "XI": { organik: 0, nonOrganik: 0 },
            "XII": { organik: 0, nonOrganik: 0 }
        };

        data.forEach(d => {
            const t = d.tingkat; // Membaca data tingkat 'X', 'XI', 'XII'
            if (levels[t] !== undefined) {
                levels[t].organik += d.organik || 0;
                levels[t].nonOrganik += d.nonOrganik || 0;
            }
        });

        const ctx = document.getElementById('chartStatistikKomparatif').getContext('2d');
        this.instances.chartE = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Tingkat X', 'Tingkat XI', 'Tingkat XII'],
                datasets: [
                    { label: 'Organik', data: [levels["X"].organik.toFixed(2), levels["XI"].organik.toFixed(2), levels["XII"].organik.toFixed(2)], backgroundColor: '#10B981' },
                    { label: 'Non-Organik', data: [levels["X"].nonOrganik.toFixed(2), levels["XI"].nonOrganik.toFixed(2), levels["XII"].nonOrganik.toFixed(2)], backgroundColor: '#F97316' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    // BARU - Chart F: Validitas & Status Logsheet Masuk (Halaman Statistik)
    RenderChartF(data) {
        const statusMap = {};
        data.forEach(d => {
            // Jika kolom status di sheet tidak ada, default-kan ke 'Terverifikasi'
            const s = d.status || d.validitas || 'Terverifikasi';
            statusMap[s] = (statusMap[s] || 0) + 1;
        });

        const ctx = document.getElementById('chartStatistikStatus').getContext('2d');
        this.instances.chartF = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusMap),
                datasets: [{
                    data: Object.values(statusMap),
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'].slice(0, Object.keys(statusMap).length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    // BARU - Mengisi tabel Matriks Efisiensi Pengurangan Sampah Akademik
    RenderMatriksTable(data) {
        const levels = {
            "X": { count: 0, organik: 0, nonOrganik: 0 },
            "XI": { count: 0, organik: 0, nonOrganik: 0 },
            "XII": { count: 0, organik: 0, nonOrganik: 0 }
        };

        data.forEach(d => {
            const t = d.tingkat;
            if (levels[t] !== undefined) {
                levels[t].count++;
                levels[t].organik += d.organik || 0;
                levels[t].nonOrganik += d.nonOrganik || 0;
            }
        });

        const tbody = document.getElementById('table-body-matriks');
        if (!tbody) return;
        tbody.innerHTML = '';

        Object.keys(levels).forEach(lvl => {
            const item = levels[lvl];
            const avgOrganik = item.count > 0 ? (item.organik / item.count).toFixed(2) : '0.00';
            const avgNonOrganik = item.count > 0 ? (item.nonOrganik / item.count).toFixed(2) : '0.00';
            const totalAvg = parseFloat(avgOrganik) + parseFloat(avgNonOrganik);

            // Klasifikasi predikat otomatis berdasarkan performa rata-rata beban sampah
            let predikat = '<span class="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">Cukup</span>';
            if (item.count === 0) {
                predikat = '<span class="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 rounded-full">Tidak Ada Data</span>';
            } else if (totalAvg < 5) {
                predikat = '<span class="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 rounded-full font-bold">Sangat Baik (Sadar Sampah)</span>';
            } else if (totalAvg < 12) {
                predikat = '<span class="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 rounded-full">Baik (Optimal)</span>';
            }

            const row = `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700/50">Klaster Tingkat ${lvl}</td>
                    <td class="p-4 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700/50">${item.count} Entri</td>
                    <td class="p-4 text-emerald-600 dark:text-emerald-400 font-medium border-b border-gray-100 dark:border-gray-700/50">${avgOrganik} kg</td>
                    <td class="p-4 text-orange-600 dark:text-orange-400 font-medium border-b border-gray-100 dark:border-gray-700/50">${avgNonOrganik} kg</td>
                    <td class="p-4 border-b border-gray-100 dark:border-gray-700/50">${predikat}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }
};