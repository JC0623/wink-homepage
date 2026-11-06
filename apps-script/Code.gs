/**
 * Wink 문의 폼 → "Wink 문의 접수" 시트 (+ 접수 알림 메일)
 *
 * Apps Script 프로젝트의 Code.gs를 이 파일 전체로 바꾸고 저장한 뒤
 * [배포 > 새 배포 > 웹 앱]으로 배포한다.
 *   - 다음 사용자 인증 정보로 실행: 나
 *   - 액세스 권한이 있는 사용자: 모든 사용자
 * 배포 후 나오는 웹 앱 URL(…/exec)을 index.html의 CONTACT_ENDPOINT에 넣는다.
 */

// ── 홈페이지 문의 받기 ─────────────────────────────────────────

// "Wink 문의 접수" 시트. Opened by id so this works whether or not the project is bound to the sheet.
var SHEET_ID = '1zGQjoUeeSAyDigzTDneRaBq6NVSzpPdHXVVmDIPIog8';

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Bots fill the hidden "website" field; people never see it.
  if (p.website) return reply_({ ok: true });

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Untitled') || ss.getSheets()[0];
  var row;

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.appendRow([
      new Date(),
      text_(p.name),
      "'" + String(p.phone || '').slice(0, 40), // keep the leading 0 of 010-…
      text_(p.message),
      p.agree ? '동의' : '미동의'
    ]);
    row = sheet.getLastRow();
  } finally {
    lock.releaseLock();
  }

  // Edit triggers never fire for rows a script adds, so send the alert from here.
  try {
    sendEmailToEditors({ range: sheet.getRange(row, 1), source: ss });
  } catch (err) {
    console.error('알림 메일 실패: ' + err); // the row is saved either way
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

// ── 접수 알림 메일 (기존 코드 그대로) ─────────────────────────

/**
 * 스프레드시트에 새 접수 내용이 입력되면 편집자 전원에게 이메일을 발송합니다.
 */
function sendEmailToEditors(e) {
  if (!e || !e.range) return;

  var sheet = e.range.getSheet();
  // 대상 시트 이름 확인 (시트 탭 이름이 'Untitled'일 때만 작동)
  if (sheet.getName() !== "Untitled") return;

  var row = e.range.getRow();
  // 1행(헤더) 수정은 무시
  if (row <= 1) return;

  var ss = e.source;
  var fileId = ss.getId();

  // 파일 편집 권한이 있는 모든 사용자의 이메일 가져오기
  var file = DriveApp.getFileById(fileId);
  var editors = file.getEditors();
  var recipientEmails = editors.map(function(editor) {
    return editor.getEmail();
  }).filter(function(email) {
    return email && email.indexOf("@") !== -1;
  });

  // 소유자(Owner)도 포함
  var owner = file.getOwner();
  if (owner && owner.getEmail() && recipientEmails.indexOf(owner.getEmail()) === -1) {
    recipientEmails.push(owner.getEmail());
  }

  if (recipientEmails.length === 0) return;

  // 입력된 행의 데이터 추출
  var time = sheet.getRange(row, 1).getDisplayValue();     // A열: 접수 일시
  var name = sheet.getRange(row, 2).getDisplayValue();     // B열: 기관·성함
  var contact = sheet.getRange(row, 3).getDisplayValue();  // C열: 연락처
  var content = sheet.getRange(row, 4).getDisplayValue();  // D열: 행사 일정·내용
  var consent = sheet.getRange(row, 5).getDisplayValue();  // E열: 개인정보 동의

  // 이메일 제목 및 본문
  var titleName = name ? name : "신규 문의";
  var subject = "[Wink 문의 접수] " + titleName + " 님의 신규 접수가 등록되었습니다.";

  var body = "안녕하세요,\n\n" +
             "Wink 문의 접수 시트에 새로운 내용이 등록되었습니다.\n\n" +
             "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
             "■ 접수 일시: " + (time || "미기재") + "\n" +
             "■ 기관·성함: " + (name || "미기재") + "\n" +
             "■ 연락처: " + (contact || "미기재") + "\n" +
             "■ 행사 일정·내용: " + (content || "미기재") + "\n" +
             "■ 개인정보 동의: " + (consent || "미기재") + "\n" +
             "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
             "👉 스프레드시트 바로가기:\n" + ss.getUrl();

  // 이메일 발송
  MailApp.sendEmail({
    to: recipientEmails.join(","),
    subject: subject,
    body: body
  });
}
