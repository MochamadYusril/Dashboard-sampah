// Database Client API Handler Wrapper
const SpreadsheetEngine = {
    // ID sudah diperbaiki, hanya mengambil deretan kode uniknya saja agar tidak eror bertumpuk
    Config: {
        spreadsheetId: "1kE4KnKZ_JqsvQ_zRoNLSZAOyL_LxaWH0nhFAl0s-9C0", 
        sheetName: "Data_Tidy" 
    },

    // Set fallback dummy data as requested (20 baris) untuk mempermudah visualisasi offline/testing awal
    DummyData: [
        {"No":"1","Tanggal":"2026-04-06","Tingkat":"X","Kelas":"X-1","Sumber_Kolom":"Kolom kelas","Organik_g":"2560","NonOrganik_g":"1570","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"O=2560 N=1570","Catatan_Asal":""},
        {"No":"2","Tanggal":"2026-04-06","Tingkat":"X","Kelas":"X-2","Sumber_Kolom":"Kolom kelas","Organik_g":"3200","NonOrganik_g":"","Status_Organik":"Tercatat","Status_NonOrganik":"Tidak tercatat","Jenis_Entry":"O=320","Catatan_Asal":""},
        {"No":"3","Tanggal":"2026-04-06","Tingkat":"X","Kelas":"X-4","Sumber_Kolom":"Kolom kelas","Organik_g":"1150","NonOrganik_g":"0","Status_Organik":"Tercatat","Status_NonOrganik":"Tidak tercatat","Jenis_Entry":"O=1155","Catatan_Asal":""},
        {"No":"4","Tanggal":"2026-04-07","Tingkat":"XI","Kelas":"XI-MIPA1","Sumber_Kolom":"Kolom kelas","Organik_g":"4500","NonOrganik_g":"2100","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"5","Tanggal":"2026-04-07","Tingkat":"XI","Kelas":"XI-MIPA2","Sumber_Kolom":"Kolom kelas","Organik_g":"1200","NonOrganik_g":"3500","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"6","Tanggal":"2026-04-08","Tingkat":"XII","Kelas":"XII-IPS1","Sumber_Kolom":"Kolom kelas","Organik_g":"5000","NonOrganik_g":"1200","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"7","Tanggal":"2026-04-08","Tingkat":"XII","Kelas":"XII-IPS2","Sumber_Kolom":"Kolom kelas","Organik_g":"950","NonOrganik_g":"850","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"8","Tanggal":"2026-04-09","Tingkat":"X","Kelas":"X-1","Sumber_Kolom":"Kolom kelas","Organik_g":"1900","NonOrganik_g":"1100","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"9","Tanggal":"2026-04-09","Tingkat":"X","Kelas":"X-2","Sumber_Kolom":"Kolom kelas","Organik_g":"3100","NonOrganik_g":"900","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"10","Tanggal":"2026-04-10","Tingkat":"XI","Kelas":"XI-IPS3","Sumber_Kolom":"Kolom kelas","Organik_g":"2150","NonOrganik_g":"1850","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"11","Tanggal":"2026-04-10","Tingkat":"XII","Kelas":"XII-MIPA4","Sumber_Kolom":"Kolom kelas","Organik_g":"4000","NonOrganik_g":"","Status_Organik":"Tercatat","Status_NonOrganik":"","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"12","Tanggal":"2026-04-13","Tingkat":"X","Kelas":"X-4","Sumber_Kolom":"Kolom kelas","Organik_g":"1500","NonOrganik_g":"1300","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"13","Tanggal":"2026-04-13","Tingkat":"XI","Kelas":"XI-MIPA1","Sumber_Kolom":"Kolom kelas","Organik_g":"3300","NonOrganik_g":"1200","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"14","Tanggal":"2026-04-14","Tingkat":"XII","Kelas":"XII-IPS1","Sumber_Kolom":"Kolom kelas","Organik_g":"2800","NonOrganik_g":"4100","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"15","Tanggal":"2026-04-14","Tingkat":"X","Kelas":"X-2","Sumber_Kolom":"Kolom kelas","Organik_g":"4200","NonOrganik_g":"1500","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"16","Tanggal":"2026-04-15","Tingkat":"XI","Kelas":"XI-MIPA2","Sumber_Kolom":"Kolom kelas","Organik_g":"1100","NonOrganik_g":"980","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"17","Tanggal":"2026-04-15","Tingkat":"XII","Kelas":"XII-MIPA4","Sumber_Kolom":"Kolom kelas","Organik_g":"3600","NonOrganik_g":"1900","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"18","Tanggal":"2026-04-16","Tingkat":"X","Kelas":"X-1","Sumber_Kolom":"Kolom kelas","Organik_g":"2900","NonOrganik_g":"800","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"19","Tanggal":"2026-04-16","Tingkat":"XI","Kelas":"XI-IPS3","Sumber_Kolom":"Kolom kelas","Organik_g":"1800","NonOrganik_g":"2400","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""},
        {"No":"20","Tanggal":"2026-04-17","Tingkat":"XII","Kelas":"XII-IPS2","Sumber_Kolom":"Kolom kelas","Organik_g":"2200","NonOrganik_g":"1300","Status_Organik":"Tercatat","Status_NonOrganik":"Tercatat","Jenis_Entry":"","Catatan_Asal":""}
    ],

    async FetchRealtimeData() {
        try {
            // Memanfaatkan OpenSheet Engine Wrapper untuk memproses konversi API Google Sheet secara instan
            const endpoint = `https://opensheet.elk.sh/${this.Config.spreadsheetId}/${this.Config.sheetName}`;
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Gagal memuat API Spreadsheet. Beralih menggunakan Dummy Data.");
            const data = await response.json();
            return this.NormalizeData(data);
        } catch (error) {
            console.warn(error.message);
            // Mengembalikan Data Dummy Terstruktur jika API belum terpasang/gagal dimuat
            return this.NormalizeData(this.DummyData);
        }
    },

    NormalizeData(rawRows) {
        return rawRows.map(row => {
            // Menjamin jika kosong di-default menjadi angka 0
            const organik_g = parseFloat(row.Organik_g) || 0;
            const nonOrganik_g = parseFloat(row.NonOrganik_g) || 0;
            const total_g = organik_g + nonOrganik_g;

            return {
                no: row.No,
                tanggal: row.Tanggal || "2026-01-01",
                tingkat: row.Tingkat || "Tidak Diketahui",
                kelas: row.Kelas || "Tidak Diketahui",
                sumberKolom: row.Sumber_Kolom || "",
                organik: organik_g / 1000, // Konversi gram ke kilogram agar representatif pada grafik dashboard
                nonOrganik: nonOrganik_g / 1000,
                total: total_g / 1000,
                statusOrganik: row.Status_Organik || "",
                statusNonOrganik: row.Status_NonOrganik || "",
                jenisEntry: row.Jenis_Entry || "",
                catatanAsal: row.Catatan_Asal || ""
            };
        });
    }
};