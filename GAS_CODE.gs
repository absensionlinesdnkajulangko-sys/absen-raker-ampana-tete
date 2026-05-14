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
  // Gunakan LockService untuk mencegah data bentrok jika banyak yang absen bersamaan
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Tunggu maksimal 10 detik jika sheet sedang sibuk

    const data = JSON.parse(e.postData.contents);
    
    if (data.accessKey !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Unauthorized access" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = data.sheetName || "Respon Absen";
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["Timestamp", "Nama Lengkap", "NIP", "Jabatan", "Nama Instansi", "Tanda Tangan"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f3f4f6");
    }

    const timestamp = new Date();
    
    const row = [
      timestamp,
      data.namaLengkap,
      data.nip || "-",
      data.jabatan,
      data.namaInstansi,
      TAMPILKAN_TTD(data.signature) // Memproses Base64 menjadi gambar
    ];

    sheet.appendRow(row);
    sheet.setRowHeight(sheet.getLastRow(), 60); // Membuat baris lebih lega untuk TTD

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock(); // Lepas kunci setelah selesai
  }
}

function doGet(e) {
  return ContentService.createTextOutput("GAS Service is Online.");
}

// JANGAN LUPA: Fungsi ini harus tetap ada di bawah skrip Anda
function TAMPILKAN_TTD(base64String) {
  if (!base64String || typeof base64String !== 'string') return "";
  try {
    var cleanString = base64String.replace(/\s/g, '');
    if (cleanString.indexOf(',') > -1) {
      cleanString = cleanString.split(',')[1];
    }
    return SpreadsheetApp.newCellImage()
      .setSourceUrl("data:image/png;base64," + cleanString)
      .build();
  } catch (e) {
    return "Gagal memproses gambar";
  }
}
