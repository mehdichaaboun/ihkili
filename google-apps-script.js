const SHEET_NAME = "Commandes";
const SPREADSHEET_ID = "170sd_2ga_TC_EyX6ytkTd1lDajX2aVelU4w2qf-zQHY";
const NOTIFICATION_EMAIL = "chaaboun.mhd@gmail.com";
const HEADERS = [
  "Date",
  "Nom complet",
  "Adresse",
  "Téléphone",
  "Couleurs",
  "Quantité",
  "Tailles",
  "Prix total",
  "Page",
];

function doPost(e) {
  const sheet = getOrdersSheet_();
  const params = e.parameter || {};
  const orderDate = new Date();
  const sizes = params.tailles || params.taille || "";
  const colors = params.couleurs || params.couleur || "";

  sheet.appendRow([
    orderDate,
    params.nom || "",
    params.adresse || "",
    params.telephone || "",
    colors,
    params.quantite || "1",
    sizes,
    params.prix || "",
    params.source || "",
  ]);

  sendOrderEmail_(params, orderDate, colors, sizes);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendOrderEmail_(params, orderDate, colors, sizes) {
  const subject = "Nouvelle commande - Maillot Maroc 2026";
  const body = [
    "Nouvelle commande reçue depuis le site Maillot Maroc 2026.",
    "",
    "Date: " + orderDate,
    "Nom complet: " + (params.nom || ""),
    "Téléphone: " + (params.telephone || ""),
    "Adresse: " + (params.adresse || ""),
    "Couleurs: " + colors,
    "Quantité: " + (params.quantite || "1"),
    "Tailles: " + sizes,
    "Prix total: " + (params.prix || ""),
    "Page: " + (params.source || ""),
  ].join("\n");

  MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
}

function getOrdersSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders_(sheet);

  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}
