// Filter Interaction Controls Management
const DashboardFilters = {
    Initialize(data, onFilterChangeCallback) {
        const tingkatSelect = document.getElementById('filter-tingkat');
        const kelasSelect = document.getElementById('filter-kelas');
        const tanggalInput = document.getElementById('filter-tanggal');

        // Extract Unique entries
        const tingkats = [...new Set(data.map(d => d.tingkat))].sort();
        const kelasList = [...new Set(data.map(d => d.kelas))].sort();

        // Populate Dropdowns Dynamically
        tingkats.forEach(t => {
            tingkatSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
        kelasList.forEach(k => {
            kelasSelect.innerHTML += `<option value="${k}">${k}</option>`;
        });

        // Set Bind Event Listeners
        const triggerUpdate = () => {
            const filtered = data.filter(d => {
                const matchTingkat = (tingkatSelect.value === 'ALL' || d.tingkat === tingkatSelect.value);
                const matchKelas = (kelasSelect.value === 'ALL' || d.kelas === kelasSelect.value);
                const matchTanggal = (!tanggalInput.value || d.tanggal === tanggalInput.value);
                return matchTingkat && matchKelas && matchTanggal;
            });
            onFilterChangeCallback(filtered);
        };

        tingkatSelect.addEventListener('change', triggerUpdate);
        kelasSelect.addEventListener('change', triggerUpdate);
        tanggalInput.addEventListener('change', triggerUpdate);
    }
};