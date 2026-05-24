// Filter Interaction Controls Management
const DashboardFilters = {
    Initialize(data, onFilterChangeCallback) {
        const tingkatSelect = document.getElementById('filter-tingkat');
        const kelasSelect = document.getElementById('filter-kelas');
        const tanggalInput = document.getElementById('filter-tanggal');

        // Extract Unique Tingkat
        const tingkats = [...new Set(data.map(d => d.tingkat).filter(Boolean))].sort();

        // Populate Dropdown Tingkat
        tingkatSelect.innerHTML = '<option value="ALL">Semua Tingkat</option>';
        tingkats.forEach(t => {
            tingkatSelect.innerHTML += `<option value="${t}">Tingkat ${t}</option>`;
        });

        // Function untuk mengupdate dropdown Kelas berdasarkan Tingkat yang dipilih
        const updateKelasDropdown = () => {
            const selectedTingkat = tingkatSelect.value;
            kelasSelect.innerHTML = '<option value="ALL">Semua Kelas</option>';

            // Filter data kelas berdasarkan tingkat yang dipilih
            let filteredKelas = data;
            if (selectedTingkat !== 'ALL') {
                filteredKelas = data.filter(d => d.tingkat === selectedTingkat);
            }

            // Dapatkan daftar kelas unik yang tersisa
            const kelasList = [...new Set(filteredKelas.map(d => d.kelas).filter(Boolean))].sort();

            kelasList.forEach(k => {
                kelasSelect.innerHTML += `<option value="${k}">${k}</option>`;
            });
        };

        // Inisialisasi dropdown kelas pertama kali
        updateKelasDropdown();

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

        // Jika tingkat diubah: 
        // 1. Update dropdown kelas
        // 2. Trigger update data chart/table
        tingkatSelect.addEventListener('change', () => {
            updateKelasDropdown();
            triggerUpdate();
        });

        kelasSelect.addEventListener('change', triggerUpdate);
        tanggalInput.addEventListener('change', triggerUpdate);
    }
};