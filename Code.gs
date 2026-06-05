// =============================================
// KONFIGURASI - SESUAIKAN DENGAN SPREADSHEET ANDA
// =============================================
const SPREADSHEET_ID = '1d4KfxgpDY7UoOBQXen6WkAHkc3jGr3EfqNsRdNHw3Nc';
const SHEET_NAME     = 'LedgerNilai';

// =============================================
// CORS HELPER - Wajib untuk akses dari Blogger
// =============================================
function corsResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// =============================================
// doGet  — Ambil semua data (GET)
// URL: ?action=get
// =============================================
function doGet(e) {
  try {
    const action = e.parameter.action || 'get';

    if (action === 'get') {
      const data = ambilDataNilai();
      return corsResponse({ success: true, data: data });
    }

    return corsResponse({ success: false, message: 'Action tidak dikenal' });

  } catch (error) {
    return corsResponse({ success: false, message: error.toString() });
  }
}

// =============================================
// doPost — Simpan / Hapus data (POST)
// Body JSON: { action: 'simpan'|'hapus', ... }
// =============================================
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'simpan') {
      const result = simpanNilai(body);
      return corsResponse(result);
    }

    if (action === 'hapus') {
      const result = hapusData(body.id);
      return corsResponse(result);
    }

    if (action === 'pdf') {
      const url = generatePDF();
      return corsResponse({ success: true, url: url });
    }

    return corsResponse({ success: false, message: 'Action tidak dikenal' });

  } catch (error) {
    return corsResponse({ success: false, message: error.toString() });
  }
}

// =============================================
// HELPER - GET SPREADSHEET SHEET
// =============================================
function getSheet() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID','NIS','Nama','Kelas','Mata Pelajaran','Nilai','Semester','Tahun Ajaran','Tanggal Input']);

    const hdr = sheet.getRange(1, 1, 1, 9);
    hdr.setBackground('#1565c0');
    hdr.setFontColor('#ffffff');
    hdr.setFontWeight('bold');
    hdr.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 100);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4,  80);
    sheet.setColumnWidth(5, 180);
    sheet.setColumnWidth(6,  80);
    sheet.setColumnWidth(7, 100);
    sheet.setColumnWidth(8, 120);
    sheet.setColumnWidth(9, 150);
  }

  return sheet;
}

// =============================================
// HELPER - Tahun Ajaran Sekarang
// =============================================
function getCurrentYear() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 7 ? year + '/' + (year + 1) : (year - 1) + '/' + year;
}

// =============================================
// SIMPAN DATA NILAI
// =============================================
function simpanNilai(formData) {
  try {
    const sheet   = getSheet();
    const id      = Utilities.getUuid();
    const tanggal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');

    sheet.appendRow([
      id,
      formData.nis,
      formData.nama,
      formData.kelas,
      formData.mapel,
      formData.nilai,
      formData.semester,
      formData.tahun_ajaran,
      tanggal
    ]);

    sheet.autoResizeColumns(1, 9);
    return { success: true, message: 'Data berhasil disimpan' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// =============================================
// AMBIL SEMUA DATA NILAI
// =============================================
function ambilDataNilai() {
  try {
    const sheet   = getSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();

    return data
      .filter(row => row[0] !== '')
      .map(row => ({
        id:           row[0],
        nis:          row[1],
        nama:         row[2],
        kelas:        row[3],
        mapel:        row[4],
        nilai:        row[5],
        semester:     row[6],
        tahun_ajaran: row[7],
        tanggal:      row[8]
      }));
  } catch (error) {
    throw new Error('Gagal mengambil data: ' + error.toString());
  }
}

// =============================================
// HAPUS DATA BERDASARKAN ID
// =============================================
function hapusData(id) {
  try {
    const sheet   = getSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) return { success: false, message: 'Data tidak ditemukan' };

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        sheet.deleteRow(i + 2);
        return { success: true, message: 'Data berhasil dihapus' };
      }
    }

    return { success: false, message: 'Data tidak ditemukan' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// =============================================
// GENERATE PDF A4 LANDSCAPE
// =============================================
function generatePDF() {
  try {
    const data = ambilDataNilai();
    const doc  = DocumentApp.create('Ledger Nilai Raport - ' + getCurrentYear());
    const body = doc.getBody();

    // Ukuran A4 Landscape (dalam poin: 1 cm = 28.35 pt)
    body.setPageWidth(841.89);
    body.setPageHeight(595.28);
    body.setMarginTop(36);
    body.setMarginBottom(36);
    body.setMarginLeft(36);
    body.setMarginRight(36);

    // -- Judul --
    const title = body.appendParagraph('LEDGER NILAI RAPORT');
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    title.editAsText().setFontSize(16).setFontFamily('Arial').setBold(true);

    const sub = body.appendParagraph('Tahun Ajaran: ' + getCurrentYear());
    sub.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    sub.editAsText().setFontSize(11).setFontFamily('Arial');

    const tgl = body.appendParagraph(
      'Dicetak pada: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMMM yyyy HH:mm:ss')
    );
    tgl.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    tgl.editAsText().setFontSize(9).setFontFamily('Arial').setItalic(true);

    body.appendParagraph('');

    // -- Tabel --
    const headers = ['No','NIS','Nama Siswa','Kelas','Mata Pelajaran','Nilai','Semester','Tahun Ajaran','Tanggal Input'];
    const table   = body.appendTable();

    // Header row
    const hRow = table.appendTableRow();
    headers.forEach(h => {
      const c = hRow.appendTableCell(h);
      c.editAsText().setFontSize(9).setFontFamily('Arial').setBold(true).setForegroundColor('#ffffff');
      c.setBackgroundColor('#1565c0');
      c.setPaddingTop(4); c.setPaddingBottom(4);
      c.setPaddingLeft(6); c.setPaddingRight(6);
    });

    // Data rows
    if (data.length === 0) {
      const er = table.appendTableRow();
      const ec = er.appendTableCell('Belum ada data nilai raport.');
      ec.editAsText().setFontSize(9).setFontFamily('Arial').setItalic(true);
    } else {
      data.forEach((row, i) => {
        const tr  = table.appendTableRow();
        const bg  = i % 2 === 0 ? '#f5f5f5' : '#ffffff';
        const cells = [
          (i + 1).toString(),
          String(row.nis  || '-'),
          String(row.nama || '-'),
          String(row.kelas || '-'),
          String(row.mapel || '-'),
          row.nilai != null ? parseFloat(row.nilai).toFixed(2) : '-',
          row.semester === 'ganjil' ? 'Ganjil' : 'Genap',
          String(row.tahun_ajaran || '-'),
          String(row.tanggal || '-')
        ];
        cells.forEach(txt => {
          const c = tr.appendTableCell(txt);
          c.editAsText().setFontSize(9).setFontFamily('Arial');
          c.setBackgroundColor(bg);
          c.setPaddingTop(3); c.setPaddingBottom(3);
          c.setPaddingLeft(6); c.setPaddingRight(6);
        });
      });
    }

    // Footer
    body.appendParagraph('');
    const footer = body.appendParagraph('* Dokumen ini digenerate otomatis oleh sistem Database Nilai Raport.');
    footer.editAsText().setFontSize(8).setFontFamily('Arial').setItalic(true);

    // Export PDF
    doc.saveAndClose();
    const docFile  = DriveApp.getFileById(doc.getId());
    const pdfBlob  = docFile.getAs('application/pdf');
    pdfBlob.setName('Ledger_Nilai_Raport_' + getCurrentYear().replace('/', '-') + '.pdf');

    const pdfFile = DriveApp.createFile(pdfBlob);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    docFile.setTrashed(true);

    return 'https://drive.google.com/uc?export=download&id=' + pdfFile.getId();

  } catch (error) {
    throw new Error('Gagal membuat PDF: ' + error.toString());
  }
}
