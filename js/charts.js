// Render & Update Management Engines Chart.js
const DashboardCharts = {
    instances: {},

    Initialize(data) {
        this.RenderChartA(data);
        this.RenderChartB(data);
        this.RenderChartC(data);
        this.RenderChartD(data);
    },

    UpdateAll(filteredData) {
        this.instances.chartA.destroy();
        this.instances.chartB.destroy();
        this.instances.chartC.destroy();
        this.instances.chartD.destroy();
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
    }
};