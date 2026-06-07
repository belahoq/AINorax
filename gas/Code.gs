// ============================================================
// SDENTIBAYA AdminKit — Google Apps Script Backend
// File    : Code.gs
// Versi   : 1.0.0
// Fungsi  : Backend utama — menerima request dari Cloudflare
//           Worker, memproses data di Google Sheets/Docs/Drive,
//           dan mengembalikan response JSON.
//
// Cara deploy:
//   1. Buka script.google.com → buat project baru
//   2. Salin seluruh kode ini ke Code.gs
//   3. Set Script Properties (lihat bagian KONFIGURASI)
//   4. Deploy → New Deployment → Web App
//      Execute as: Me | Access: Anyone
//   5. Salin URL deployment → masukkan ke GAS_URL di Worker
//
// Script Properties yang wajib diset (Project Settings → Script Properties):
//   GAS_SECRET            — token rahasia, HARUS sama dengan di Worker
//   SPREADSHEET_ID        — ID Google Spreadsheet database
//   DRIVE_FOLDER_ID       — ID folder Google Drive penyimpanan dokumen
//   DEFAULT_TEMPLATE_DOC_ID — (opsional) ID template Docs default
// ============================================================


// ============================================================
// NAMA SHEET — ubah di sini jika nama sheet berbeda
// ============================================================
var SHEET = {
  SETTINGS:  'Settings',
  DOCUMENTS: 'Documents',
  TEMPLATES: 'Templates',
  LOGS:      'Logs'
};


// ============================================================
// ENTRY POINT — doPost(e)
// Semua request dari Worker masuk ke sini.
// Method: POST, Content-Type: application/json
// ============================================================

/**
 * Entry point utama GAS Web App.
 * Menerima request POST dari Cloudflare Worker.
 */
function doPost(e) {
  var body;

  try {
    // Parse body JSON
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, message: 'Request body kosong.' });
    }

    body = JSON.parse(e.postData.contents);

  } catch (parseErr) {
    return jsonResponse({
      success: false,
      message: 'Format request tidak valid. Pastikan Content-Type: application/json.'
    });
  }

  try {
    // Validasi secret token sebelum memproses apapun
    if (!validateSecret(body)) {
      // Catat percobaan akses tidak sah
      logAction('UNAUTHORIZED', 'unknown', 'Secret token tidak valid', 'gagal');
      return jsonResponse({ success: false, message: 'Akses ditolak. Secret token tidak valid.' });
    }

    var action  = body.action  || '';
    var payload = body.payload || {};

    if (!action) {
      return jsonResponse({ success: false, message: 'Field "action" wajib diisi.' });
    }

    // Route ke handler yang sesuai
    return routeAction(action, payload, body);

  } catch (err) {
    // Log error tak terduga
    logAction('ERROR', 'system', String(err), 'gagal');
    return jsonResponse({
      success: false,
      message: 'Terjadi kesalahan internal: ' + String(err)
    });
  }
}


// ============================================================
// jsonResponse — format respons JSON konsisten
// Schema: { success, message, data, meta: { timestamp } }
// ============================================================

/**
 * Bungkus objek menjadi response JSON terformat.
 * @param {Object} obj - { success, message, data }
 * @returns {TextOutput}
 */
function jsonResponse(obj) {
  var responseObj = {
    success:  obj.success  !== undefined ? obj.success  : true,
    message:  obj.message  || '',
    data:     obj.data     !== undefined ? obj.data     : null,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  return ContentService
    .createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// validateSecret — validasi secret token dari Worker
// ============================================================

/**
 * Bandingkan secret dari request dengan GAS_SECRET di Script Properties.
 * @param {Object} body - parsed request body
 * @returns {boolean}
 */
function validateSecret(body) {
  try {
    var props     = PropertiesService.getScriptProperties();
    var gasSecret = props.getProperty('GAS_SECRET');

    if (!gasSecret) {
      // GAS_SECRET belum diset — log warning tapi jangan expose ke response
      Logger.log('[SECURITY] GAS_SECRET belum dikonfigurasi di Script Properties!');
      return false;
    }

    return body.secret === gasSecret;
  } catch (err) {
    Logger.log('[validateSecret] Error: ' + err);
    return false;
  }
}


// ============================================================
// routeAction — router action ke handler
// ============================================================

/**
 * Arahkan request ke fungsi handler yang sesuai.
 * @param {string} action
 * @param {Object} payload
 * @param {Object} body - full request body (untuk akses metadata)
 * @returns {TextOutput}
 */
function routeAction(action, payload, body) {
  switch (action) {

    case 'ping':
      return ping();

    case 'getSettings':
      return getSettings();

    case 'saveSettings':
      return saveSettings(payload);

    case 'getDashboardStats':
      return getDashboardStats();

    case 'createDocument':
      return createDocument(payload);

    case 'listDocuments':
      return listDocuments(payload);

    case 'getDocument':
      return getDocument(payload);

    case 'listTemplates':
      return listTemplates();

    case 'saveTemplate':
      return saveTemplate(payload);

    case 'createLog':
      return createLog(payload);

    default:
      return jsonResponse({
        success: false,
        message: 'Action "' + action + '" tidak dikenali.'
      });
  }
}


// ============================================================
// ping — health check GAS
// ============================================================

/**
 * Cek apakah GAS aktif dan Script Properties sudah dikonfigurasi.
 * @returns {TextOutput}
 */
function ping() {
  try {
    var props    = PropertiesService.getScriptProperties();
    var ssId     = props.getProperty('SPREADSHEET_ID');
    var folderId = props.getProperty('DRIVE_FOLDER_ID');
    var secret   = props.getProperty('GAS_SECRET');

    return jsonResponse({
      success: true,
      message: 'GAS aktif dan siap digunakan.',
      data: {
        service:           'SDENTIBAYA AdminKit GAS',
        version:           '1.0.0',
        spreadsheetOk:     !!ssId,
        driveFolderOk:     !!folderId,
        secretConfigured:  !!secret,
        timestamp:         new Date().toISOString()
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Ping gagal: ' + err });
  }
}


// ============================================================
// getSettings — ambil semua settings dari Sheet Settings
// ============================================================

/**
 * Ambil semua data dari sheet Settings sebagai objek key-value.
 * @returns {TextOutput}
 */
function getSettings() {
  try {
    var sheet = getSheet(SHEET.SETTINGS);
    var data  = sheet.getDataRange().getValues();
    var result = {};

    // Baris 1 = header (key | value | updatedAt), mulai dari baris 2
    for (var i = 1; i < data.length; i++) {
      var key   = String(data[i][0]).trim();
      var value = data[i][1];
      if (key) result[key] = value;
    }

    return jsonResponse({
      success: true,
      message: 'Settings berhasil diambil.',
      data: result
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal mengambil settings: ' + err });
  }
}


// ============================================================
// saveSettings — simpan/update settings ke Sheet Settings
// ============================================================

/**
 * Simpan atau update setting. Jika key sudah ada, update nilainya.
 * @param {Object} payload - objek key-value bebas
 * @returns {TextOutput}
 */
function saveSettings(payload) {
  try {
    if (!payload || typeof payload !== 'object') {
      return jsonResponse({ success: false, message: 'Payload settings tidak valid.' });
    }

    var sheet     = getSheet(SHEET.SETTINGS);
    var data      = sheet.getDataRange().getValues();
    var now       = new Date().toISOString();
    var savedKeys = [];

    Object.keys(payload).forEach(function(key) {
      var value  = payload[key];
      var found  = false;

      // Cari baris dengan key yang sama dan update
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === key) {
          sheet.getRange(i + 1, 2).setValue(value); // kolom B = value
          sheet.getRange(i + 1, 3).setValue(now);   // kolom C = updatedAt
          data[i][1] = value;
          found = true;
          break;
        }
      }

      // Jika belum ada, tambah baris baru
      if (!found) {
        sheet.appendRow([key, value, now]);
      }

      savedKeys.push(key);
    });

    return jsonResponse({
      success: true,
      message: 'Settings berhasil disimpan.',
      data: { savedKeys: savedKeys, updatedAt: now }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal menyimpan settings: ' + err });
  }
}


// ============================================================
// getDashboardStats — statistik ringkasan untuk Dashboard
// ============================================================

/**
 * Hitung statistik dokumen dari Sheet Documents.
 * @returns {TextOutput}
 */
function getDashboardStats() {
  try {
    var sheet = getSheet(SHEET.DOCUMENTS);
    var data  = sheet.getDataRange().getValues();

    // Inisialisasi counter
    var stats = {
      totalDokumen:    0,
      suratKeluar:     0,
      skPanitia:       0,
      undanganRapat:   0,
      beritaAcara:     0,
      proposal:        0,
      dokumenBerhasil: 0,
      dokumenDraft:    0,
      dokumenGagal:    0
    };

    // Jenis yang masuk kategori "surat keluar"
    var jenisSuratKeluar = [
      'undangan_rapat', 'pemberitahuan_ortu', 'persetujuan_wali', 'surat_keterangan'
    ];

    // Data mulai baris 2 (baris 1 = header)
    // Kolom: id | createdAt | type | number | subject | title | createdBy | docUrl | pdfUrl | status | rawJson
    for (var i = 1; i < data.length; i++) {
      var row  = data[i];
      var type = String(row[2] || '').trim();   // kolom C = type
      var stat = String(row[9] || '').trim();   // kolom J = status

      if (!type) continue;

      stats.totalDokumen++;

      // Hitung per jenis
      if (type === 'undangan_rapat')   stats.undanganRapat++;
      if (type === 'sk_panitia')       stats.skPanitia++;
      if (type === 'berita_acara')     stats.beritaAcara++;
      if (type === 'proposal_kegiatan') stats.proposal++;
      if (jenisSuratKeluar.indexOf(type) > -1) stats.suratKeluar++;

      // Hitung per status
      if (stat === 'berhasil') stats.dokumenBerhasil++;
      else if (stat === 'draft') stats.dokumenDraft++;
      else if (stat === 'gagal') stats.dokumenGagal++;
    }

    // Ambil 5 dokumen terbaru (urutkan descending berdasarkan createdAt)
    var dokumenRows = data.slice(1).filter(function(r) { return r[0]; });
    dokumenRows.sort(function(a, b) {
      return new Date(b[1]) - new Date(a[1]);
    });

    var terbaru = dokumenRows.slice(0, 5).map(function(r) {
      return {
        id:      r[0],
        tanggal: r[1],
        jenis:   r[2],
        nomor:   r[3],
        perihal: r[4],
        status:  r[9]
      };
    });

    return jsonResponse({
      success: true,
      message: 'Statistik berhasil diambil.',
      data: {
        stats:          stats,
        dokumenTerbaru: terbaru
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal mengambil statistik: ' + err });
  }
}



// ============================================================
// createDocument — generate Google Docs dari template
// ============================================================

/**
 * Buat dokumen baru dari template Google Docs.
 * Alur:
 *   1. Terima payload dari frontend
 *   2. Generate ID dokumen
 *   3. Ambil template dari Sheets (berdasarkan jenis dokumen)
 *   4. Salin template ke folder Drive
 *   5. Replace semua placeholder {{key}} dengan nilai dari payload
 *   6. Export salinan sebagai PDF
 *   7. Simpan metadata ke Sheet Documents
 *   8. Kembalikan docUrl + pdfUrl
 *
 * @param {Object} payload - data dari form frontend
 * @returns {TextOutput}
 */
function createDocument(payload) {
  try {
    // ── Validasi payload minimal ──────────────────────────────
    if (!payload || !payload.jenis) {
      return jsonResponse({
        success: false,
        message: 'Payload tidak valid. Field "jenis" wajib diisi.'
      });
    }

    var props     = PropertiesService.getScriptProperties();
    var folderId  = props.getProperty('DRIVE_FOLDER_ID');

    if (!folderId) {
      return jsonResponse({
        success: false,
        message: 'DRIVE_FOLDER_ID belum dikonfigurasi di Script Properties.'
      });
    }

    // ── 1. Generate ID dokumen ────────────────────────────────
    var docId  = generateId('DOC');
    var jenis  = payload.jenis;
    var nomor  = payload.nomorSurat || payload.nomorSK || payload.nomorBA || payload.nomorDokumen || '';
    var perihal = payload.perihal || payload.tentang || payload.namaKegiatan || payload.agenda || 'Dokumen';
    var judul  = payload.judul || perihal;

    // ── 2. Siapkan data untuk replace placeholder ─────────────
    // Gabungkan payload dengan data sekolah dari Settings
    var settingsSheet = getSheet(SHEET.SETTINGS);
    var settingsData  = settingsSheet.getDataRange().getValues();
    var settings      = {};
    for (var s = 1; s < settingsData.length; s++) {
      var k = String(settingsData[s][0]).trim();
      if (k) settings[k] = settingsData[s][1];
    }

    // Data untuk placeholder — payload menimpa settings jika ada duplikasi key
    var templateData = {};
    Object.keys(settings).forEach(function(k) { templateData[k] = settings[k]; });
    Object.keys(payload).forEach(function(k) {  templateData[k] = payload[k];  });

    // Tambah variabel computed
    templateData['tanggalHariIni'] = formatTanggalIndonesia(new Date());
    templateData['tahun']          = String(new Date().getFullYear());
    if (!templateData['tahunAjaran']) {
      templateData['tahunAjaran']  = '2025/2026';
    }

    // Konversi semua field tanggal dari format ISO (yyyy-MM-dd) ke
    // format Indonesia (dd Bulan yyyy) agar tampil rapi di dokumen.
    // Field yang dikonversi: semua key yang mengandung kata 'tanggal'
    // dengan nilai bertanda '-' (yyyy-MM-dd atau yyyy-MM-ddThh:mm:ss).
    Object.keys(templateData).forEach(function(key) {
      var val = String(templateData[key] || '');
      // Cocokkan format yyyy-MM-dd atau yyyy-MM-ddThh:mm:ssZ
      if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
        try {
          templateData[key] = formatTanggalIndonesia(new Date(val));
        } catch (e) {
          // Biarkan nilai asli jika parse gagal
        }
      }
    });

    // Pastikan placeholder tanggal di atas tanda tangan selalu tersedia.
    // {{tanggalSurat}} = tanggal dokumen dibuat (hari ini), format Indonesia.
    // Digunakan di template sebagai: "Pringgabaya, {{tanggalSurat}}"
    if (!templateData['tanggalSurat']) {
      templateData['tanggalSurat'] = formatTanggalIndonesia(new Date());
    }

    // Bangun baris tempat + tanggal untuk tanda tangan
    // Contoh: "Pringgabaya, 07 Juni 2026"
    templateData['tempatTanggalSurat'] =
      (templateData['kecamatan'] || 'Pringgabaya') +
      ', ' +
      templateData['tanggalHariIni'];

    // ── 3. Cari template Google Docs yang sesuai ──────────────
    var templateDocId = getTemplateDocId(jenis);

    var googleDocId; // ID file Google Docs hasil salinan

    if (templateDocId) {
      // ── 4a. Salin template yang ada ──────────────────────────
      try {
        var templateFile = DriveApp.getFileById(templateDocId);
        var folder       = DriveApp.getFolderById(folderId);
        var namaFile     = judul + ' — ' + docId;
        var salinan      = templateFile.makeCopy(namaFile, folder);
        googleDocId      = salinan.getId();
      } catch (copyErr) {
        Logger.log('[createDocument] Gagal salin template: ' + copyErr);
        // Fallback ke dokumen baru jika template tidak bisa disalin
        googleDocId = buatDokumenBaru(judul, docId, templateData, folderId);
      }
    } else {
      // ── 4b. Buat dokumen baru dari teks default ───────────────
      googleDocId = buatDokumenBaru(judul, docId, templateData, folderId);
    }

    if (!googleDocId) {
      return jsonResponse({
        success: false,
        message: 'Gagal membuat file Google Docs.'
      });
    }

    // ── 5. Replace semua placeholder ─────────────────────────
    replacePlaceholdersInDoc(googleDocId, templateData);

    // ── 6. Export PDF ─────────────────────────────────────────
    var pdfId  = createPdfFromDoc(googleDocId, folderId);
    var docUrl = 'https://docs.google.com/document/d/' + googleDocId + '/edit';
    var pdfUrl = pdfId
      ? 'https://drive.google.com/file/d/' + pdfId + '/view'
      : '';

    // ── 7. Simpan metadata ke Sheet Documents ─────────────────
    var sheet = getSheet(SHEET.DOCUMENTS);
    sheet.appendRow([
      docId,                          // A: id
      new Date().toISOString(),       // B: createdAt
      jenis,                          // C: type
      nomor,                          // D: number
      perihal,                        // E: subject
      judul,                          // F: title
      payload.dibuatOleh || 'admin',  // G: createdBy
      docUrl,                         // H: docUrl
      pdfUrl,                         // I: pdfUrl
      'berhasil',                     // J: status
      JSON.stringify(payload)         // K: rawJson
    ]);

    // ── 8. Log aksi ───────────────────────────────────────────
    logAction('createDocument', payload.dibuatOleh || 'admin',
      'Dokumen ' + jenis + ' — ' + perihal, 'berhasil');

    return jsonResponse({
      success: true,
      message: 'Dokumen berhasil dibuat.',
      data: {
        id:     docId,
        docUrl: docUrl,
        pdfUrl: pdfUrl,
        jenis:  jenis,
        perihal: perihal
      }
    });

  } catch (err) {
    Logger.log('[createDocument] Error: ' + err);
    logAction('createDocument', 'system', String(err), 'gagal');
    return jsonResponse({
      success: false,
      message: 'Gagal membuat dokumen: ' + String(err)
    });
  }
}


/**
 * Buat dokumen baru dari teks default (tanpa template).
 * Digunakan saat template tidak ditemukan.
 * @param {string} judul
 * @param {string} docId
 * @param {Object} data - semua variabel yang akan diisi
 * @param {string} folderId
 * @returns {string|null} ID Google Docs baru
 */
function buatDokumenBaru(judul, docId, data, folderId) {
  try {
    var namaFile = judul + ' — ' + docId;
    var doc      = DocumentApp.create(namaFile);
    var body     = doc.getBody();

    // Kop surat sederhana
    var namaSekolah = data['namaSekolah'] || 'SD Negeri 3 Pringgabaya';
    var alamat      = [
      data['alamat'], data['kecamatan'] ? 'Kec. ' + data['kecamatan'] : '',
      data['kabupaten'], data['provinsi']
    ].filter(function(x){ return !!x; }).join(', ');

    body.appendParagraph(namaSekolah)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    if (alamat) {
      body.appendParagraph(alamat)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    }

    body.appendHorizontalRule();

    // Judul dokumen
    body.appendParagraph(judul)
        .setHeading(DocumentApp.ParagraphHeading.HEADING2)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    body.appendParagraph('');

    // Isi semua field dari payload sebagai paragraf
    var fieldsToSkip = ['jenis', 'secret', 'action', 'namaSekolah', 'npsn',
                        'namaKepsek', 'nipKepsek', 'tahunAjaran', 'dibuatOleh',
                        'tanggalHariIni', 'tahun', 'alamat', 'kecamatan',
                        'kabupaten', 'provinsi', 'telepon', 'website', 'email',
                        'brand', 'slogan', 'pangkatKepsek', 'urlLogo', 'urlTtd', 'urlStempel'];

    Object.keys(data).forEach(function(key) {
      if (fieldsToSkip.indexOf(key) === -1 && data[key]) {
        body.appendParagraph(key + ': ' + data[key]);
      }
    });

    body.appendParagraph('');

    // Tanda tangan — gunakan tempatTanggalSurat jika sudah tersedia
    var barisTtd = data['tempatTanggalSurat']
      ? data['tempatTanggalSurat']
      : (data['kecamatan'] || 'Pringgabaya') + ', ' + formatTanggalIndonesia(new Date());

    var ttdPara = body.appendParagraph(
      barisTtd + '\n' +
      'Kepala Sekolah,\n\n\n\n' +
      (data['namaKepsek'] || 'Nama Kepala Sekolah') + '\n' +
      'NIP. ' + (data['nipKepsek'] || '—')
    );
    ttdPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

    doc.saveAndClose();

    // Pindahkan ke folder Drive yang benar
    var file   = DriveApp.getFileById(doc.getId());
    var folder = DriveApp.getFolderById(folderId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return doc.getId();
  } catch (err) {
    Logger.log('[buatDokumenBaru] Error: ' + err);
    return null;
  }
}


/**
 * Ambil template doc ID dari Sheet Templates berdasarkan jenis.
 * @param {string} jenis - value jenis dokumen
 * @returns {string|null}
 */
function getTemplateDocId(jenis) {
  try {
    var props       = PropertiesService.getScriptProperties();
    var defaultTmpl = props.getProperty('DEFAULT_TEMPLATE_DOC_ID');

    var sheet = getSheet(SHEET.TEMPLATES);
    var data  = sheet.getDataRange().getValues();

    // Kolom: id | type | name | description | docTemplateId | placeholders | isActive | createdAt | updatedAt
    for (var i = 1; i < data.length; i++) {
      var rowType    = String(data[i][1] || '').trim();
      var docTmplId  = String(data[i][4] || '').trim();
      var isActive   = data[i][6];

      if (rowType === jenis && docTmplId && isActive) {
        return docTmplId;
      }
    }

    // Fallback ke default template jika ada
    return defaultTmpl || null;

  } catch (err) {
    Logger.log('[getTemplateDocId] Error: ' + err);
    return null;
  }
}



// ============================================================
// listDocuments — ambil daftar dokumen dengan filter opsional
// ============================================================

/**
 * Ambil daftar dokumen dari Sheet Documents.
 * @param {Object} payload
 *   - jenis    : filter jenis dokumen (opsional)
 *   - status   : filter status (opsional)
 *   - limit    : max baris (default 50)
 *   - offset   : mulai dari baris ke- (default 0)
 * @returns {TextOutput}
 */
function listDocuments(payload) {
  try {
    var sheet  = getSheet(SHEET.DOCUMENTS);
    var data   = sheet.getDataRange().getValues();

    var filterJenis  = payload.jenis  || '';
    var filterStatus = payload.status || '';
    var limit        = parseInt(payload.limit  || '50', 10);
    var offset       = parseInt(payload.offset || '0',  10);

    // Kumpulkan baris valid (mulai dari baris 2)
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue; // skip baris kosong

      var jenis  = String(row[2] || '').trim();
      var status = String(row[9] || '').trim();

      // Terapkan filter
      if (filterJenis  && jenis  !== filterJenis)  continue;
      if (filterStatus && status !== filterStatus) continue;

      rows.push({
        id:         row[0],
        createdAt:  row[1],
        jenis:      row[2],
        nomorSurat: row[3],
        perihal:    row[4],
        judul:      row[5],
        dibuatOleh: row[6],
        docUrl:     row[7],
        pdfUrl:     row[8],
        status:     row[9]
        // rawJson sengaja tidak dikirim untuk efisiensi
      });
    }

    // Urutkan terbaru dulu
    rows.sort(function(a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    var total   = rows.length;
    var sliced  = rows.slice(offset, offset + limit);

    return jsonResponse({
      success: true,
      message: 'Daftar dokumen berhasil diambil.',
      data: {
        documents: sliced,
        total:     total,
        limit:     limit,
        offset:    offset
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal mengambil daftar dokumen: ' + err });
  }
}


// ============================================================
// getDocument — ambil satu dokumen berdasarkan ID
// ============================================================

/**
 * @param {Object} payload - { id: 'DOC-xxx' }
 * @returns {TextOutput}
 */
function getDocument(payload) {
  try {
    if (!payload || !payload.id) {
      return jsonResponse({ success: false, message: 'Field "id" wajib diisi.' });
    }

    var sheet = getSheet(SHEET.DOCUMENTS);
    var data  = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(payload.id)) {
        return jsonResponse({
          success: true,
          message: 'Dokumen ditemukan.',
          data: {
            id:         data[i][0],
            createdAt:  data[i][1],
            jenis:      data[i][2],
            nomorSurat: data[i][3],
            perihal:    data[i][4],
            judul:      data[i][5],
            dibuatOleh: data[i][6],
            docUrl:     data[i][7],
            pdfUrl:     data[i][8],
            status:     data[i][9],
            rawJson:    data[i][10]
          }
        });
      }
    }

    return jsonResponse({ success: false, message: 'Dokumen dengan ID "' + payload.id + '" tidak ditemukan.' });

  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal mengambil dokumen: ' + err });
  }
}


// ============================================================
// listTemplates — ambil semua template aktif
// ============================================================

/**
 * @returns {TextOutput}
 */
function listTemplates() {
  try {
    var sheet  = getSheet(SHEET.TEMPLATES);
    var data   = sheet.getDataRange().getValues();
    var result = [];

    // Kolom: id | type | name | description | docTemplateId | placeholders | isActive | createdAt | updatedAt
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue;

      var placeholders = [];
      try {
        placeholders = JSON.parse(row[5] || '[]');
      } catch(e) {
        // Jika bukan JSON, split by koma
        placeholders = String(row[5] || '').split(',')
          .map(function(x) { return x.trim(); })
          .filter(function(x) { return !!x; });
      }

      result.push({
        id:            row[0],
        jenis:         row[1],
        nama:          row[2],
        deskripsi:     row[3],
        docTemplateId: row[4],
        placeholders:  placeholders,
        isActive:      !!row[6],
        createdAt:     row[7],
        updatedAt:     row[8]
      });
    }

    return jsonResponse({
      success: true,
      message: 'Daftar template berhasil diambil.',
      data: { templates: result, total: result.length }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal mengambil template: ' + err });
  }
}


// ============================================================
// saveTemplate — tambah atau update template
// ============================================================

/**
 * Tambah template baru atau update yang sudah ada (berdasarkan ID).
 * @param {Object} payload
 *   - id           : (opsional) jika ada → update, jika tidak → tambah baru
 *   - jenis        : value jenis dokumen
 *   - nama         : nama template
 *   - deskripsi    : deskripsi (opsional)
 *   - docTemplateId: ID Google Docs template
 *   - placeholders : array string atau JSON array
 *   - isActive     : boolean (default true)
 * @returns {TextOutput}
 */
function saveTemplate(payload) {
  try {
    if (!payload.jenis || !payload.nama || !payload.docTemplateId) {
      return jsonResponse({
        success: false,
        message: 'Field "jenis", "nama", dan "docTemplateId" wajib diisi.'
      });
    }

    var sheet  = getSheet(SHEET.TEMPLATES);
    var data   = sheet.getDataRange().getValues();
    var now    = new Date().toISOString();

    var placeholders = payload.placeholders
      ? JSON.stringify(Array.isArray(payload.placeholders)
          ? payload.placeholders
          : String(payload.placeholders).split(',').map(function(x){ return x.trim(); }))
      : '[]';

    var isActive = payload.isActive !== false; // default true

    // Cek apakah update (ada ID yang cocok)
    if (payload.id) {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          var rowNum = i + 1;
          sheet.getRange(rowNum, 2).setValue(payload.jenis);
          sheet.getRange(rowNum, 3).setValue(payload.nama);
          sheet.getRange(rowNum, 4).setValue(payload.deskripsi || '');
          sheet.getRange(rowNum, 5).setValue(payload.docTemplateId);
          sheet.getRange(rowNum, 6).setValue(placeholders);
          sheet.getRange(rowNum, 7).setValue(isActive);
          sheet.getRange(rowNum, 9).setValue(now);

          return jsonResponse({
            success: true,
            message: 'Template berhasil diperbarui.',
            data: { id: payload.id, updatedAt: now }
          });
        }
      }
    }

    // Tambah template baru
    var newId = generateId('TMPL');
    sheet.appendRow([
      newId,
      payload.jenis,
      payload.nama,
      payload.deskripsi || '',
      payload.docTemplateId,
      placeholders,
      isActive,
      now,
      now
    ]);

    return jsonResponse({
      success: true,
      message: 'Template berhasil ditambahkan.',
      data: { id: newId, createdAt: now }
    });

  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal menyimpan template: ' + err });
  }
}


// ============================================================
// createLog — catat log aksi dari frontend
// ============================================================

/**
 * @param {Object} payload - { action, user, detail, status }
 * @returns {TextOutput}
 */
function createLog(payload) {
  try {
    logAction(
      payload.action || 'unknown',
      payload.user   || 'admin',
      payload.detail || '',
      payload.status || 'info'
    );
    return jsonResponse({ success: true, message: 'Log berhasil dicatat.' });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Gagal mencatat log: ' + err });
  }
}



// ============================================================
// HELPER: getSheet — ambil sheet berdasarkan nama
// ============================================================

/**
 * Ambil sheet dari Spreadsheet berdasarkan nama.
 * Jika sheet belum ada, buat otomatis dengan header yang sesuai.
 * @param {string} name - nama sheet
 * @returns {Sheet}
 */
function getSheet(name) {
  var props = PropertiesService.getScriptProperties();
  var ssId  = props.getProperty('SPREADSHEET_ID');

  if (!ssId) {
    throw new Error('SPREADSHEET_ID belum dikonfigurasi di Script Properties.');
  }

  var ss    = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName(name);

  // Buat sheet otomatis jika belum ada
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheetHeaders(sheet, name);
    Logger.log('[getSheet] Sheet "' + name + '" dibuat baru dengan header.');
  }

  return sheet;
}


/**
 * Inisialisasi header baris pertama berdasarkan nama sheet.
 * @param {Sheet} sheet
 * @param {string} name
 */
function initSheetHeaders(sheet, name) {
  var headers = {
    'Settings':  ['key', 'value', 'updatedAt'],
    'Documents': ['id', 'createdAt', 'type', 'number', 'subject', 'title',
                  'createdBy', 'docUrl', 'pdfUrl', 'status', 'rawJson'],
    'Templates': ['id', 'type', 'name', 'description', 'docTemplateId',
                  'placeholders', 'isActive', 'createdAt', 'updatedAt'],
    'Logs':      ['id', 'timestamp', 'action', 'user', 'detail', 'ip', 'status']
  };

  var cols = headers[name];
  if (cols) {
    sheet.getRange(1, 1, 1, cols.length).setValues([cols]);
    // Bold header
    sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}


// ============================================================
// HELPER: generateId — generate ID unik dengan prefix
// ============================================================

/**
 * Generate ID unik: <PREFIX>-<timestamp>-<random>
 * Contoh: DOC-1749291600000-A3F
 * @param {string} prefix
 * @returns {string}
 */
function generateId(prefix) {
  var ts     = new Date().getTime();
  var random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return (prefix || 'ID') + '-' + ts + '-' + random;
}


// ============================================================
// HELPER: replacePlaceholdersInDoc
// ============================================================

/**
 * Ganti semua placeholder {{key}} di Google Docs dengan nilai dari data.
 * Mencari di Body, Header, dan Footer dokumen.
 *
 * @param {string} docId - ID Google Docs
 * @param {Object} data  - objek key-value pengganti
 */
function replacePlaceholdersInDoc(docId, data) {
  try {
    var doc  = DocumentApp.openById(docId);
    var keys = Object.keys(data);

    // Fungsi replace di satu element
    function replaceInElement(element) {
      keys.forEach(function(key) {
        var placeholder = '{{' + key + '}}';
        var value       = String(data[key] !== null && data[key] !== undefined ? data[key] : '');
        try {
          element.replaceText(placeholder.replace(/\{/g,'\\{').replace(/\}/g,'\\}'), value);
        } catch(e) {
          // replaceText menggunakan regex — escape karakter khusus
          element.replaceText(
            placeholder.replace(/[\{\}\[\]\(\)\.\*\+\?\^\$\|\\]/g, '\\$&'),
            value
          );
        }
      });
    }

    // Replace di body
    replaceInElement(doc.getBody());

    // Replace di header jika ada
    try {
      var header = doc.getHeader();
      if (header) replaceInElement(header);
    } catch(e) { /* Header tidak ada */ }

    // Replace di footer jika ada
    try {
      var footer = doc.getFooter();
      if (footer) replaceInElement(footer);
    } catch(e) { /* Footer tidak ada */ }

    doc.saveAndClose();
    Logger.log('[replacePlaceholdersInDoc] Selesai replace ' + keys.length + ' placeholder.');

  } catch (err) {
    Logger.log('[replacePlaceholdersInDoc] Error: ' + err);
    throw err;
  }
}


// ============================================================
// HELPER: createPdfFromDoc
// ============================================================

/**
 * Export Google Docs ke PDF dan simpan ke folder Drive.
 * @param {string} docId    - ID Google Docs sumber
 * @param {string} folderId - ID folder Drive tujuan
 * @returns {string|null} ID file PDF, atau null jika gagal
 */
function createPdfFromDoc(docId, folderId) {
  try {
    var doc    = DriveApp.getFileById(docId);
    var folder = DriveApp.getFolderById(folderId);

    // Export sebagai PDF menggunakan Google Drive export URL
    var exportUrl = 'https://docs.google.com/document/d/' + docId + '/export?format=pdf';
    var token     = ScriptApp.getOAuthToken();

    var response = UrlFetchApp.fetch(exportUrl, {
      headers: { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      Logger.log('[createPdfFromDoc] Export gagal, HTTP: ' + response.getResponseCode());
      return null;
    }

    // Simpan PDF ke folder
    var pdfNama = doc.getName() + '.pdf';
    var pdfFile = folder.createFile(
      response.getBlob().setName(pdfNama)
    );

    // Jadikan PDF bisa diakses siapa saja dengan link
    pdfFile.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    Logger.log('[createPdfFromDoc] PDF berhasil: ' + pdfFile.getId());
    return pdfFile.getId();

  } catch (err) {
    Logger.log('[createPdfFromDoc] Error: ' + err);
    return null;
  }
}


// ============================================================
// HELPER: logAction — catat log ke Sheet Logs
// ============================================================

/**
 * Catat aksi ke Sheet Logs. Tidak melempar error agar tidak
 * mengganggu flow utama jika logging gagal.
 * @param {string} action
 * @param {string} user
 * @param {string} detail
 * @param {string} status - 'berhasil' | 'gagal' | 'info'
 */
function logAction(action, user, detail, status) {
  try {
    var sheet = getSheet(SHEET.LOGS);
    var id    = generateId('LOG');

    sheet.appendRow([
      id,                          // A: id
      new Date().toISOString(),    // B: timestamp
      action,                      // C: action
      user   || 'system',          // D: user
      detail || '',                // E: detail
      '',                          // F: ip (tidak tersedia di GAS)
      status || 'info'             // G: status
    ]);
  } catch (err) {
    // Jangan lempar error dari logAction — silent fail
    Logger.log('[logAction] Gagal mencatat log: ' + err);
  }
}


// ============================================================
// HELPER: formatTanggalIndonesia
// ============================================================

/**
 * Format Date ke string Bahasa Indonesia.
 * Contoh: "07 Juni 2026"
 * @param {Date} date
 * @returns {string}
 */
function formatTanggalIndonesia(date) {
  var bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  return d + ' ' + bulan[m] + ' ' + y;
}


// ============================================================
// FUNGSI SETUP — jalankan sekali untuk inisialisasi Spreadsheet
// Jalankan manual dari Apps Script Editor: Run → initSpreadsheet
// ============================================================

/**
 * Inisialisasi semua sheet yang dibutuhkan.
 * Jalankan SEKALI dari Apps Script Editor setelah setup SPREADSHEET_ID.
 */
function initSpreadsheet() {
  try {
    var sheets = [SHEET.SETTINGS, SHEET.DOCUMENTS, SHEET.TEMPLATES, SHEET.LOGS];
    sheets.forEach(function(name) {
      getSheet(name); // akan membuat sheet + header jika belum ada
    });

    // Isi Settings default
    var settingSheet = getSheet(SHEET.SETTINGS);
    var existingData = settingSheet.getDataRange().getValues();
    var existingKeys = existingData.slice(1).map(function(r){ return r[0]; });

    var defaults = [
      ['namaSekolah',   'SD Negeri 3 Pringgabaya'],
      ['npsn',          '50205367'],
      ['alamat',        'Jl. Raya Pringgabaya'],
      ['kecamatan',     'Pringgabaya'],
      ['kabupaten',     'Lombok Timur'],
      ['provinsi',      'Nusa Tenggara Barat'],
      ['telepon',       '(0376) 21XXX'],
      ['website',       'www.sdn3pringgabaya.sch.id'],
      ['email',         'sdn3pringgabaya@gmail.com'],
      ['brand',         'SDENTIBAYA'],
      ['slogan',        'SDENTIBAYA MELAJU'],
      ['tahunAjaran',   '2025/2026'],
      ['namaKepsek',    'Maturiadi, S.Pd.'],
      ['nipKepsek',     '19XXXXXXXXXXXXXX'],
      ['pangkatKepsek', 'Pembina, IV/a'],
    ];

    var now = new Date().toISOString();
    defaults.forEach(function(pair) {
      if (existingKeys.indexOf(pair[0]) === -1) {
        settingSheet.appendRow([pair[0], pair[1], now]);
      }
    });

    var pesanSukses = '[initSpreadsheet] Selesai. Semua sheet sudah siap digunakan.';
    Logger.log(pesanSukses);

    // Coba tampilkan dialog jika dijalankan dari konteks Spreadsheet UI.
    // Jika dijalankan dari Apps Script Editor, getUi() tidak tersedia —
    // cukup baca hasilnya di Execution Log (View → Logs).
    try {
      SpreadsheetApp.getUi().alert('Inisialisasi berhasil! Semua sheet sudah siap digunakan.');
    } catch (uiErr) {
      // Dijalankan dari Script Editor — tidak ada UI, tidak apa-apa.
      Logger.log('[initSpreadsheet] Catatan: dialog tidak ditampilkan (jalankan dari Editor). Cek Execution Log.');
    }

  } catch (err) {
    Logger.log('[initSpreadsheet] Error: ' + err);

    // Sama: coba tampilkan dialog, tapi tidak wajib berhasil.
    try {
      SpreadsheetApp.getUi().alert('Error saat inisialisasi: ' + err);
    } catch (uiErr) {
      Logger.log('[initSpreadsheet] Error (tanpa dialog): ' + err);
    }
  }
}
