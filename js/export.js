// Export System Mocking and Printing layouts Controller
const DataExporter = {
    ExportToCSV(data) {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "No,Tanggal,Tingkat,Kelas,Organik (kg),Non-Organik (kg),Total (kg)\n";

        data.forEach(d => {
            csvContent += `${d.no},${d.tanggal},${d.tingkat},${d.kelas},${d.organik.toFixed(2)},${d.nonOrganik.toFixed(2)},${d.total.toFixed(2)}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Data_Sampah_SMAN18_Bandung_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    ExportToPDF() {
        // Mode cetak native browser terstruktur yang bersih otomatis menyusun dashboard ke PDF
        window.print();
    }
};