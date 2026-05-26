// =========================================================================
// CHARTS.JS — Dashboard Chart Engine (Chart.js)
// Eco-SMAN 18 Bandung Dashboard
// =========================================================================
const DashboardCharts = (() => {
    const _instances = {};

    function _destroy(id) {
        if (_instances[id]) { _instances[id].destroy(); delete _instances[id]; }
    }

    function _isDark() {
        return document.documentElement.classList.contains('dark');
    }

    function _colors() {
        return {
            grid:    _isDark() ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            text:    _isDark() ? '#9ca3af' : '#6b7280',
            organik: '#10B981',
            nonOrg:  '#F97316',
            organikBg: 'rgba(16,185,129,0.15)',
            nonOrgBg:  'rgba(249,115,22,0.12)',
        };
    }

    // ── 1. Tren Harian ─────────────────────────────────────────────────────
    function renderTrenHarian(data) {
        const canvas = document.getElementById('chartTrenHarian');
        if (!canvas) return;
        _destroy('tren');

        const dateMap = {};
        data.forEach(r => {
            if (!dateMap[r.tanggal]) dateMap[r.tanggal] = { org: 0, non: 0 };
            dateMap[r.tanggal].org += r.organik    || 0;
            dateMap[r.tanggal].non += r.nonOrganik || 0;
        });
        const labels = Object.keys(dateMap).sort();

        const c = _colors();
        _instances['tren'] = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels.map(l => _shortDate(l)),
                datasets: [
                    { label: 'Organik (kg)',     data: labels.map(l => +dateMap[l].org.toFixed(2)), borderColor: c.organik, backgroundColor: c.organikBg, fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 },
                    { label: 'Non-Organik (kg)', data: labels.map(l => +dateMap[l].non.toFixed(2)), borderColor: c.nonOrg,  backgroundColor: c.nonOrgBg,  fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { labels: { color: c.text, font: { size: 11 } } } },
                scales: {
                    x: { ticks: { color: c.text, maxRotation: 45, font: { size: 10 } }, grid: { color: c.grid } },
                    y: { beginAtZero: true, ticks: { color: c.text, callback: v => v + ' kg' }, grid: { color: c.grid } }
                }
            }
        });
    }

    // ── 2. Ranking 10 Kelas ────────────────────────────────────────────────
    function renderRankingKelas(data) {
        const canvas = document.getElementById('chartRankingKelas');
        if (!canvas) return;
        _destroy('ranking');

        const kelasMap = {};
        data.forEach(r => {
            kelasMap[r.kelas] = (kelasMap[r.kelas] || 0) + (r.total || 0);
        });
        const sorted = Object.entries(kelasMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const c = _colors();

        _instances['ranking'] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: sorted.map(([k]) => k),
                datasets: [{
                    label: 'Total (kg)',
                    data: sorted.map(([, v]) => +v.toFixed(2)),
                    backgroundColor: sorted.map((_, i) => i === 0 ? '#F59E0B' : i < 3 ? '#10B981' : 'rgba(16,185,129,0.5)'),
                    borderRadius: 6, borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, ticks: { color: c.text, callback: v => v + ' kg', font: { size: 10 } }, grid: { color: c.grid } },
                    y: { ticks: { color: c.text, font: { size: 10 } }, grid: { display: false } }
                }
            }
        });
    }

    // ── 3. Komposisi Per Kelas (stacked bar) ──────────────────────────────
    function renderKomposisiKelas(data) {
        const canvas = document.getElementById('chartKomposisiKelas');
        if (!canvas) return;
        _destroy('komposisi');

        const kelasMap = {};
        data.forEach(r => {
            if (!kelasMap[r.kelas]) kelasMap[r.kelas] = { org: 0, non: 0 };
            kelasMap[r.kelas].org += r.organik    || 0;
            kelasMap[r.kelas].non += r.nonOrganik || 0;
        });
        const labels = Object.keys(kelasMap).sort();
        const c = _colors();

        _instances['komposisi'] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Organik',     data: labels.map(k => +kelasMap[k].org.toFixed(2)), backgroundColor: c.organik, borderRadius: 4, stack: 'stack' },
                    { label: 'Non-Organik', data: labels.map(k => +kelasMap[k].non.toFixed(2)), backgroundColor: c.nonOrg,  borderRadius: 4, stack: 'stack' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: c.text, font: { size: 11 } } } },
                scales: {
                    x: { stacked: true, ticks: { color: c.text, maxRotation: 45, font: { size: 9 } }, grid: { display: false } },
                    y: { stacked: true, beginAtZero: true, ticks: { color: c.text, callback: v => v + ' kg' }, grid: { color: c.grid } }
                }
            }
        });
    }

    // ── 4. Perbandingan Tingkat (grouped bar) ────────────────────────────
    function renderPerbandinganTingkat(data) {
        const canvas = document.getElementById('chartPerbandinganTingkat');
        if (!canvas) return;
        _destroy('tingkat');

        const tingkatList = ['X', 'XI', 'XII'];
        const c = _colors();

        _instances['tingkat'] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: tingkatList.map(t => 'Tingkat ' + t),
                datasets: [
                    { label: 'Organik',     data: tingkatList.map(t => +data.filter(r => r.tingkat === t).reduce((s, r) => s + (r.organik    || 0), 0).toFixed(2)), backgroundColor: c.organik, borderRadius: 6 },
                    { label: 'Non-Organik', data: tingkatList.map(t => +data.filter(r => r.tingkat === t).reduce((s, r) => s + (r.nonOrganik || 0), 0).toFixed(2)), backgroundColor: c.nonOrg,  borderRadius: 6 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: c.text, font: { size: 11 } } } },
                scales: {
                    x: { ticks: { color: c.text }, grid: { display: false } },
                    y: { beginAtZero: true, ticks: { color: c.text, callback: v => v + ' kg' }, grid: { color: c.grid } }
                }
            }
        });
    }

    // ── 5. Statistik Komparatif Per Tingkat (Statistik tab) ───────────────
    function renderStatistikKomparatif(data) {
        const canvas = document.getElementById('chartStatistikKomparatif');
        if (!canvas) return;
        _destroy('statKomp');

        const tingkatList = ['X', 'XI', 'XII'];
        const c = _colors();

        _instances['statKomp'] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: tingkatList.map(t => 'Tingkat ' + t),
                datasets: [
                    { label: 'Organik (kg)',     data: tingkatList.map(t => +data.filter(r => r.tingkat === t).reduce((s, r) => s + (r.organik    || 0), 0).toFixed(2)), backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 8 },
                    { label: 'Non-Organik (kg)', data: tingkatList.map(t => +data.filter(r => r.tingkat === t).reduce((s, r) => s + (r.nonOrganik || 0), 0).toFixed(2)), backgroundColor: 'rgba(249,115,22,0.8)',  borderRadius: 8 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: c.text, font: { size: 12 } } } },
                scales: {
                    x: { ticks: { color: c.text }, grid: { display: false } },
                    y: { beginAtZero: true, ticks: { color: c.text, callback: v => v + ' kg' }, grid: { color: c.grid } }
                }
            }
        });
    }

    // ── 6. Status Validitas (Doughnut) ─────────────────────────────────────
    function renderStatistikStatus(data) {
        const canvas = document.getElementById('chartStatistikStatus');
        if (!canvas) return;
        _destroy('statStatus');

        const tercatat    = data.filter(r => r.statusOrganik === 'Tercatat' && r.statusNonOrganik === 'Tercatat').length;
        const parsial     = data.filter(r => (r.statusOrganik === 'Tercatat') !== (r.statusNonOrganik === 'Tercatat')).length;
        const tidakTercatat = data.length - tercatat - parsial;
        const c = _colors();

        _instances['statStatus'] = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Lengkap', 'Parsial', 'Tidak Tercatat'],
                datasets: [{ data: [tercatat, parsial, tidakTercatat], backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], borderWidth: 0 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '65%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: c.text, padding: 12, font: { size: 11 } } },
                    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} entri` } }
                }
            }
        });
    }

    // ── Helper ─────────────────────────────────────────────────────────────
    function _shortDate(str) {
        if (!str) return '-';
        try {
            const [, m, d] = str.split('-');
            const B = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
            return `${parseInt(d)} ${B[parseInt(m)-1]}`;
        } catch { return str; }
    }

    return {
        UpdateAll(data) {
            renderTrenHarian(data);
            renderRankingKelas(data);
            renderKomposisiKelas(data);
            renderPerbandinganTingkat(data);
            renderStatistikKomparatif(data);
            renderStatistikStatus(data);
        }
    };
})();