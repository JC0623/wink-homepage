/**
 * Wink 문의 폼 → "Wink 문의 접수" 시트
 *
 * 시트에서 [확장 프로그램 > Apps Script]로 열어 이 코드를 붙여넣고
 * [배포 > 새 배포 > 웹 앱]으로 배포한다.
 *   - 다음 사용자 인증 정보로 실행: 나
 *   - 액세스 권한이 있는 사용자: 모든 사용자
 * 배포 후 나오는 웹 앱 URL(…/exec)을 index.html의 CONTACT_ENDPOINT에 넣는다.
 */

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Bots fill the hidden "website" field; people never see it.
  if (p.website) return reply_({ ok: true });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    sheet.appendRow([
      new Date(),
      text_(p.name),
      "'" + String(p.phone || '').slice(0, 40), // keep the leading 0 of 010-…
      text_(p.message),
      p.agree ? '동의' : '미동의'
    ]);
  } finally {
    lock.releaseLock();
  }
  return reply_({ ok: true });
}

// Trims overlong input and stops a value from being read as a formula.
function text_(v) {
  var s = String(v || '').slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
