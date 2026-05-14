/* 
  KODE GOOGLE APPS SCRIPT (GAS) - PROFESSIONAL EDITION
  ---------------------------------------------------
  GITHUB INTEGRATION:
  Untuk manajemen project profesional, Anda disarankan:
  1. Pasang ekstensi Chrome "Google Apps Script GitHub Assistant".
  2. Repository: Simpan file ini dengan nama 'GAS_CODE.js' di root repo Anda.
  3. CI/CD: Gunakan 'clasp' dari Google jika ingin deploy via terminal (Command Line).

  PENGATURAN SPREADSHEET:
*/

const SECRET_KEY = "AMPANA_TETE_ACCESS_2024";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Keamanan: Validasi Access Key
    if (data.accessKey !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Unauthorized access" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = data.sheetName || "Respon Absen";
    let sheet = ss.getSheetByName(sheetName);

    // Buat sheet jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["Timestamp", "Nama Lengkap", "NIP", "Jabatan", "Nama Instansi", "Tanda Tangan"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f3f4f6");
    }

    const timestamp = new Date();
    
    // Simpan tanda tangan (Sebagai data URL di kolom F)
    // Catatan: Jika tanda tangan terlalu besar, sel Google Sheet mungkin terbatas.
    // Disarankan untuk menyimpan ke Google Drive jika aplikasi digunakan secara masif.
    const row = [
      timestamp,
      data.namaLengkap,
      data.nip || "-",
      data.jabatan,
      data.namaInstansi,
      data.signature
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk mengizinkan akses CORS
function doGet(e) {
  return ContentService.createTextOutput("GAS Service is Online.");
}
