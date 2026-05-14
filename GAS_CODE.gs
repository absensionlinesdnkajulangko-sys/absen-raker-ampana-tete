const SECRET_KEY = "AMPANA_TETE_ACCESS_2024";
// PENTING: Ganti ID di bawah ini dengan ID Folder Drive Anda
const FOLDER_ID = "1x-EREqo8ALwwr67h3l-qU5YtfFljnsek"; 

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
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
    
    // PROSES GAMBAR: Simpan ke Drive & Ambil URL Thumbnail
    const ttdImage = PROSES_DAN_SIMPAN_GAMBAR(data.signature, data.namaLengkap);

    const row = [
      timestamp,
      data.namaLengkap,
      data.nip || "-",
      data.jabatan,
      data.namaInstansi,
      ttdImage
    ];

    sheet.appendRow(row);
    sheet.setRowHeight(sheet.getLastRow(), 80);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function PROSES_DAN_SIMPAN_GAMBAR(base64String, namaUser) {
  if (!base64String || base64String.length < 50) return "Tanpa TTD";
  
  try {
    // 1. Dekode Base64 menjadi Blob
    var rawData = base64String.split(',')[1] || base64String;
    var blob = Utilities.newBlob(Utilities.base64Decode(rawData), "image/png", "TTD_" + namaUser + ".png");
    
    // 2. Simpan ke Folder Drive
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);
    
    // 3. Set izin agar sistem Google Sheet bisa "melihat" file
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 4. Gunakan URL Thumbnail Drive agar muncul di dalam sel
    var imageUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w300";
    
    return SpreadsheetApp.newCellImage()
      .setSourceUrl(imageUrl)
      .build();
  } catch (e) {
    return "Gagal simpan gambar: " + e.toString();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("GAS Service is Online.");
}
