function getReportOffset() {
  return 4
}

function getReportColumnsMap() {
  let columnsMap = []

  columnsMap[1] = 'section'
  columnsMap[2] = 'order_number'
  columnsMap[3] = 'stone_shape'
  columnsMap[4] = 'stone_color'
  columnsMap[5] = 'diameter'
  columnsMap[6] = 'length_min'
  columnsMap[7] = 'length_max'
  columnsMap[8] = 'width'
  columnsMap[9] = 'date_of_adoption'
  columnsMap[10] = 'shipped'
  columnsMap[11] = 'packed'
  columnsMap[12] = 'with_worktop'
  columnsMap[13] = 'comment'

  return columnsMap;
}

function getReportDateCell() {
  return reportSheet.getRange("M1")
}

function addReportRow(row) {
  reportSheet.appendRow([
    row.section,
    prepareValue(row.order_number),
    row.stone_shape,
    row.stone_color,
    row.diameter,
    row.length_min,
    row.length_max,
    row.width,
    row.date_of_adoption,
    row.shipped,
    row.packed,
    row.with_worktop,
    prepareValue(row.comment),
  ]);

  return true
}

function createReport(filter) {
  filter = filter || {}

  let assemblies = getAssemblies(filter)
  let shipments = getShipments(filter)
  let free = getFree(filter)

  let sections = [
    {'items': assemblies, 'name': 'Склад. Сборка'},
    {'items': shipments, 'name': 'Склад. Отгрузка'},
    {'items': free, 'name': 'Свободные'},
  ]

  sections.forEach(section => {
    section.items.forEach(orderData => {
      addReportRow({...{section: section.name}, ...orderData})
    })
  })
}

function clearReport() {
  let lastRow = reportSheet.getLastRow();
  for (var i = lastRow; i >= getReportOffset(); i--) {        
    reportSheet.deleteRow(i)
  }  
}

function getReportStringified(filter) {
  filter = filter || {}

  refreshReportIfNeed(filter)

  let report = getReport(filter)

  return JSON.stringify(report)
}

function getReport(filter) {
  filter = filter || {}

  let data = reportSheet
      .getRange(getShipmentOffset(), 1, reportSheet.getLastRow(), 10)
      .getValues()
      .filter(filterEmptyRow)
      .map((reportRow, reportRowIndex) => prepareReportRow(reportRow, reportRowIndex))
      .filter(makeOrderFilter(filter))

  return data
}

function prepareReportRow(reportRow, reportRowIndex) {
  let reportItemObj = {}

  reportItemObj.order_index = reportRowIndex;

  getReportColumnsMap().forEach((field, column) => {
    let value = reportRow[column - 1];
    if (value !== undefined) {
      if (field === 'date_of_adoption') {
        value = formatDate(value)
      }
      reportItemObj[field] = value
    }
  })

  return reportItemObj
}

function getReportDate() {  
  let value = getReportDateCell().getValue()

  if (value) {
    let dateObj = new Date(value)
    return !!dateObj.getDate() ? dateObj : null
  }
}

function setReportDate(date)
{
  let dateString = null

  if (date) {
    let dateObj = new Date(date)  
    if (!!dateObj.getDate()) {
      dateString = dateObj.toISOString()
    }    
  }

  getReportDateCell().setValue(dateString)
}

function isNeedToCreateReport() {
  let currentDate = new Date()
  let reportDate = getReportDate()
  if (reportDate) {
    reportDate.setDate(reportDate.getDate() + 1)
    return currentDate > reportDate
  }
  
  return true
}

function refreshReportIfNeed(filter) {
    if (isNeedToCreateReport()) {
    setReportDate(null)
    clearReport()
    createReport(filter)
    setReportDate(new Date())
  }
}
