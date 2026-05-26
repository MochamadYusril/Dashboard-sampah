// =========================================================================
// FILTERS.JS — Dashboard Filter Engine
// Eco-SMAN 18 Bandung Dashboard
// =========================================================================
const DashboardFilters = (() => {
    let _allData     = [];
    let _onFilter    = null;

    function _applyFilters() {
        const tingkat = document.getElementById('filter-tingkat')?.value || 'ALL';
        const kelas   = document.getElementById('filter-kelas')?.value   || 'ALL';
        const tanggal = document.getElementById('filter-tanggal')?.value || '';

        const filtered = _allData.filter(r => {
            const matchTingkat  = tingkat === 'ALL' || r.tingkat === tingkat;
            const matchKelas    = kelas   === 'ALL' || r.kelas   === kelas;
            const matchTanggal  = !tanggal          || r.tanggal === tanggal;
            return matchTingkat && matchKelas && matchTanggal;
        });

        if (_onFilter) _onFilter(filtered);
    }

    function _populateTingkat() {
        const sel = document.getElementById('filter-tingkat');
        if (!sel) return;
        const tingkatSet = [...new Set(_allData.map(r => r.tingkat))].filter(Boolean).sort();
        sel.innerHTML = '<option value="ALL">Semua Tingkat</option>';
        tingkatSet.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; opt.textContent = 'Tingkat ' + t;
            sel.appendChild(opt);
        });
    }

    function _populateKelas(filterTingkat = 'ALL') {
        const sel = document.getElementById('filter-kelas');
        if (!sel) return;
        const kelasSet = [...new Set(
            _allData
                .filter(r => filterTingkat === 'ALL' || r.tingkat === filterTingkat)
                .map(r => r.kelas)
        )].filter(Boolean).sort();
        sel.innerHTML = '<option value="ALL">Semua Kelas</option>';
        kelasSet.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k; opt.textContent = k;
            sel.appendChild(opt);
        });
    }

    return {
        Initialize(allData, onFilter) {
            _allData  = allData;
            _onFilter = onFilter;

            _populateTingkat();
            _populateKelas();

            const selTingkat = document.getElementById('filter-tingkat');
            const selKelas   = document.getElementById('filter-kelas');
            const inpTanggal = document.getElementById('filter-tanggal');

            if (selTingkat) selTingkat.addEventListener('change', () => {
                _populateKelas(selTingkat.value);
                _applyFilters();
            });
            if (selKelas)   selKelas.addEventListener('change',   _applyFilters);
            if (inpTanggal) inpTanggal.addEventListener('change', _applyFilters);
        }
    };
})();