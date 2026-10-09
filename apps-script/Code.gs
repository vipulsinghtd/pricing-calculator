/**
 * Treasure AI Pricing Estimator — submission endpoint for the "Captured Pricing Inputs" sheet.
 *
 * The calculator POSTs { sheet, headers, values }.
 *   - sheet:   tab to write to. Current calculator sends "New"; requests without it go to "Old"
 *              so the previous column layout keeps working.
 *   - headers: column names, in order.
 *   - values:  one value per header.
 *
 * Values are written by matching header names, so a column is never shifted if the order changes.
 * Headers the tab doesn't have yet are added to the right of the existing ones; nothing is removed.
 */

const SPREADSHEET_ID = '1DP8GDpq6AwuVJR0_oyPuQ-uH5COaUmZiV5gG1wEUHDs';
const LEGACY_TAB = 'Old';
const ALLOWED_TABS = ['Old', 'New'];

// Column layout of the "New" tab. Must match buildSubmission() in index.html.
const NEW_HEADERS = [
  'Name', 'Email', 'Submission Date', 'P+B Mode',
  'Known Customers', 'Additional Sources', 'Overlap %', 'Anonymous Visitors/Year',
  'Transactions/Year', 'Email SMS Push/Year', 'Web App Events/Year', 'Other Events/Year',
  'Direct Profiles (M)', 'Direct Behaviors (B)',
  'Total Profiles (M)', 'Total Behaviors (B)', 'P+B Units',
  'ICDP Tier', 'ICDP Tier Group', 'ICDP Tier Max (P+B)', 'ICDP Room Left (P+B)',
  'AI Foundry Conversations/mo (K)',
  'Agentic Engage Emails/mo (M)', 'Agentic Engage Email Clicks/mo (K)',
  'Agentic Engage SMS/mo (K)', 'Agentic Engage Mobile Push/mo (M)',
  'RT PZ Profiles (M)', 'RT PZ Calls/mo (M)',
  'RT Trig Profiles (M)', 'RT Trig Events/mo (M)', 'RT Trig Activations/mo (M)',
  'AI Signals ML Predictions/mo (M)', 'AI Signals RFM Predictions/mo (M)',
  'AI Foundry Credits/mo', 'Agentic Engage Credits/mo', 'RT PZ Credits/mo',
  'RT Trig Credits/mo', 'AI Signals Credits/mo',
  'AI Credits/Month', 'AI Credits/Year', 'Buffer %', 'AI Credits/Year incl. Buffer',
  'AI Tier', 'AI Tier Max (Credits/Year)', 'AI Room Left (Credits/Year)'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const tabName = ALLOWED_TABS.indexOf(data.sheet) >= 0 ? data.sheet : LEGACY_TAB;
    const sheet = getOrCreateTab_(tabName);

    const header = ensureHeaders_(sheet, data.headers);
    const row = header.map(function (h) {
      const i = data.headers.indexOf(h);
      return i >= 0 ? sanitize_(data.values[i]) : '';
    });
    sheet.appendRow(row);

    return json_({ ok: true, sheet: tabName });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Run once from the Apps Script editor to create the "New" tab's header row right away. */
function setupNewSheet() {
  const sheet = getOrCreateTab_('New');
  ensureHeaders_(sheet, NEW_HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
}

function getOrCreateTab_(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/** Adds any missing headers to the end of row 1 and returns the full header row. */
function ensureHeaders_(sheet, headers) {
  const lastCol = sheet.getLastColumn();
  const existing = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String).filter(function (h) { return h !== ''; })
    : [];
  const missing = headers.filter(function (h) { return existing.indexOf(h) < 0; });
  if (missing.length) {
    sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
  }
  return existing.concat(missing);
}

/** Stops user-typed text (name, email) from being run as a spreadsheet formula. */
function sanitize_(v) {
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
