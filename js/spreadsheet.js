// =========================================================================
// SPREADSHEET.JS — Database Client API Handler
// Eco-SMAN 18 Bandung Dashboard
// =========================================================================
const SpreadsheetEngine = {
    Config: {
        apiUrl: "https://script.google.com/macros/s/AKfycbyxSaCLQkBBmjV6g_XOljcVgmtFbqLZSfdpx0veap-mJyKyhWViq4PUgSpC_E_aMFXr/exec"
    },

    bersihkanTanggal(tgl) {
        if (!tgl) return "2026-01-01";
        return tgl.toString().split('T')[0];
    },

    async FetchRealtimeData() {
        try {
            const endpoint = `${this.Config.apiUrl}?action=getData`;
            const response = await fetch(endpoint);
            const result = await response.json();
            if (!result.success) throw new Error(result.message);
            return this.NormalizeData(result.data);
        } catch (error) {
            console.warn("Fetch gagal, pakai DummyData:", error.message);
            return this.NormalizeData(this.DummyData);
        }
    },

    // =========================================================================
    // PERBAIKAN UTAMA: Apps Script mengembalikan key huruf kecil tanpa underscore
    // (tanggal, kelas, organik, nonorganik) — field sudah dalam satuan GRAM dari sheet
    // tapi Apps Script langsung return nilai mentah, jadi kita baca row.organik dll.
    // =========================================================================
    NormalizeData(rawRows) {
        return rawRows.map(row => {
            // Support dua format key: dari Apps Script (huruf kecil) ATAU dari DummyData (Kapital_underscore)
            const organik_g   = parseFloat(row.Organik_g   ?? row.organik   ?? 0) || 0;
            const nonOrganik_g = parseFloat(row.NonOrganik_g ?? row.nonorganik ?? 0) || 0;
            const total_g     = organik_g + nonOrganik_g;

            // Tangani field tanggal dan kelas dari kedua format
            const tanggalRaw = row.Tanggal ?? row.tanggal ?? '';
            const kelasRaw   = row.Kelas   ?? row.kelas   ?? 'Tidak Diketahui';
            const tingkatRaw = row.Tingkat ?? row.tingkat ?? '';

            // Deteksi otomatis tingkat dari nama kelas jika field tingkat kosong
            let tingkat = tingkatRaw;
            if (!tingkat || tingkat === 'Tidak Diketahui') {
                if (/^XII/i.test(kelasRaw))      tingkat = 'XII';
                else if (/^XI/i.test(kelasRaw))  tingkat = 'XI';
                else if (/^X/i.test(kelasRaw))   tingkat = 'X';
                else                              tingkat = 'Tidak Diketahui';
            }

            return {
                no:             row.No ?? row.no ?? '',
                tanggal:        this.bersihkanTanggal(tanggalRaw),
                tingkat:        tingkat,
                kelas:          kelasRaw,
                organik:        organik_g / 1000,   // → kg
                nonOrganik:     nonOrganik_g / 1000, // → kg
                total:          total_g / 1000,      // → kg
                statusOrganik:  organik_g   > 0 ? "Tercatat" : "Tidak tercatat",
                statusNonOrganik: nonOrganik_g > 0 ? "Tercatat" : "Tidak tercatat"
            };
        });
    },

    DummyData: [
        {"No":"1","Tanggal":"2026-04-06","Tingkat":"X","Kelas":"X-1","Organik_g":"2560","NonOrganik_g":"1570"},
        {"No":"2","Tanggal":"2026-04-06","Tingkat":"X","Kelas":"X-2","Organik_g":"3200","NonOrganik_g":"800"},
        {"No":"3","Tanggal":"2026-04-07","Tingkat":"XI","Kelas":"XI-1","Organik_g":"4500","NonOrganik_g":"2100"},
        {"No":"4","Tanggal":"2026-04-07","Tingkat":"XI","Kelas":"XI-2","Organik_g":"1200","NonOrganik_g":"3500"},
        {"No":"5","Tanggal":"2026-04-08","Tingkat":"XII","Kelas":"XII-1","Organik_g":"5000","NonOrganik_g":"1200"},
        {"No":"6","Tanggal":"2026-04-08","Tingkat":"XII","Kelas":"XII-2","Organik_g":"950","NonOrganik_g":"850"},
        {"No":"7","Tanggal":"2026-04-09","Tingkat":"X","Kelas":"X-1","Organik_g":"1900","NonOrganik_g":"1100"},
        {"No":"8","Tanggal":"2026-04-09","Tingkat":"X","Kelas":"X-3","Organik_g":"3100","NonOrganik_g":"900"},
        {"No":"9","Tanggal":"2026-04-10","Tingkat":"XI","Kelas":"XI-3","Organik_g":"2150","NonOrganik_g":"1850"},
        {"No":"10","Tanggal":"2026-04-10","Tingkat":"XII","Kelas":"XII-3","Organik_g":"4000","NonOrganik_g":"1300"},
        {"No":"11","Tanggal":"2026-04-13","Tingkat":"X","Kelas":"X-4","Organik_g":"1500","NonOrganik_g":"1300"},
        {"No":"12","Tanggal":"2026-04-13","Tingkat":"XI","Kelas":"XI-1","Organik_g":"3300","NonOrganik_g":"1200"},
        {"No":"13","Tanggal":"2026-04-14","Tingkat":"XII","Kelas":"XII-1","Organik_g":"2800","NonOrganik_g":"4100"},
        {"No":"14","Tanggal":"2026-04-14","Tingkat":"X","Kelas":"X-2","Organik_g":"4200","NonOrganik_g":"1500"},
        {"No":"15","Tanggal":"2026-04-15","Tingkat":"XI","Kelas":"XI-2","Organik_g":"1100","NonOrganik_g":"980"},
        {"No":"16","Tanggal":"2026-04-15","Tingkat":"XII","Kelas":"XII-3","Organik_g":"3600","NonOrganik_g":"1900"},
        {"No":"17","Tanggal":"2026-04-16","Tingkat":"X","Kelas":"X-1","Organik_g":"2900","NonOrganik_g":"800"},
        {"No":"18","Tanggal":"2026-04-16","Tingkat":"XI","Kelas":"XI-3","Organik_g":"1800","NonOrganik_g":"2400"},
        {"No":"19","Tanggal":"2026-04-17","Tingkat":"XII","Kelas":"XII-2","Organik_g":"2200","NonOrganik_g":"1300"},
        {"No":"20","Tanggal":"2026-04-17","Tingkat":"X","Kelas":"X-3","Organik_g":"1700","NonOrganik_g":"600"}
    ]
};