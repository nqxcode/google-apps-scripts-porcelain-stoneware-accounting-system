let spreadSheet = SpreadsheetApp.openByUrl(spreadSheetUrl)

let assembliesSheet = spreadSheet.getSheetByName("Сборка")
let shipmentsSheet = spreadSheet.getSheetByName("Отгрузка")
let freeSheet = spreadSheet.getSheetByName("Свободные")
let propertiesSheet = spreadSheet.getSheetByName("Свойства")
let reportSheet = spreadSheet.getSheetByName("Отчёт")
let auditSheet = spreadSheet.getSheetByName("Аудит")

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
