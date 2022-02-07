let spreadSheet = SpreadsheetApp.openByUrl(spreadSheetUrl)

let sheetNames = {
  assemblies: "Сборка",
  shipments: "Отгрузка",
  free: "Свободные",
  properties: "Свойства",
  report: "Отчёт",
  audit: "Аудит",
  trash: "Корзина",
}

let assembliesSheet = spreadSheet.getSheetByName(sheetNames.assemblies)
let shipmentsSheet = spreadSheet.getSheetByName(sheetNames.shipments)
let freeSheet = spreadSheet.getSheetByName(sheetNames.free)
let propertiesSheet = spreadSheet.getSheetByName(sheetNames.properties)
let reportSheet = spreadSheet.getSheetByName(sheetNames.report)
let auditSheet = spreadSheet.getSheetByName(sheetNames.audit)
let trashSheet = spreadSheet.getSheetByName(sheetNames.trash)

Audit.setTrackingPropsCallable(getAuditTrackingProps)

let audit = {
  assemblies: new Audit(sheetNames.assemblies),
  shipments: new Audit(sheetNames.shipments),
  free: new Audit(sheetNames.free),
  properties: new Audit(sheetNames.properties),
  report: new Audit(sheetNames.report),
  trash: new Audit(sheetNames.trash),
}

let trash = {
  assemblies: new Trash(sheetNames.assemblies),
  shipments: new Trash(sheetNames.shipments),
  free: new Trash(sheetNames.free),
}

let auth = {
  can: {
    'show-report': Auth.check('show-report'),
    'remove-from-trash': Auth.check('remove-from-trash'),
  }
}

function doGet(e) {    
  return HtmlService.createTemplateFromFile('index').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); 
}

function doPost(e) {
    return ContentService.createTextOutput(JSON.stringify(e))
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getContent(filename)
{
  return HtmlService.createTemplateFromFile(filename).getRawContent()
}
