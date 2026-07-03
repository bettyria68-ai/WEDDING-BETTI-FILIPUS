function resetDataRSVP() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data_RSVP"); // Sesuaikan nama sheet Anda
  
  // Mendapatkan jumlah baris data yang ada
  var lastRow = sheet.getLastRow();
  
  // Jika ada data (lebih dari 1 baris header), hapus semua dari baris 2 sampai terakhir
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}