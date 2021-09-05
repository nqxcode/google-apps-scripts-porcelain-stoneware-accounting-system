let spreadSheetUrl = "https://docs.google.com/spreadsheets/d/1LdpB3l_gwgvOv1RL5t00kOQENtct-Op3wV7B9UzkagE/edit#gid=1282691482"
let spreadSheet = SpreadsheetApp.openByUrl(spreadSheetUrl)

let needsSheet = spreadSheet.getSheetByName("Потребность")
let assembliesSheet = spreadSheet.getSheetByName("Сборка")
let shipmentsSheet = spreadSheet.getSheetByName("Отгрузка")
let freeSheet = spreadSheet.getSheetByName("Свободные")
let polishingsSheet = spreadSheet.getSheetByName("Полировка")
let propertiesSheet = spreadSheet.getSheetByName("Свойства")

function doGet(e) {    
  return HtmlService.createTemplateFromFile('index').evaluate(); 
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
