function getReportOffset() {
  return 3
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
    escapeValue(row.order_number),
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
    escapeValue(row.comment),
  ]);

  return true
}

function createReport(filter) {
  filter = filter || {}
  
  let sections = {
    'Склад. Сборка': {      
      'items': () => getAssemblies({...filter, ...{section: null}})
    },
    'Склад. Отгрузка': {      
      'items': () => getShipments({...filter, ...{section: null}})
    },
    'Свободные': {      
      'items': () => getFree({...filter, ...{section: null}})
    }
  }

  if (filter.section) {
      sections[filter.section].items().forEach(orderData => {
      addReportRow({...{section: filter.section}, ...orderData})
    })
  } else {
    Object.keys(sections).forEach(key => {
      sections[key].items().forEach(orderData => {
          addReportRow({...{section: key}, ...orderData})
      })
    })      
  }
}

function clearReport() {
  let startRow = getReportOffset();
  let lastRow = reportSheet.getLastRow();  
  let toDeleteCount = lastRow + 1 - startRow

  if (toDeleteCount > 0) {
    reportSheet.deleteRows(startRow, toDeleteCount);    
  }
}

function getReportStringified() {
  let report = getReport()

  return JSON.stringify(report)
}

function getReport() {
  let report = reportSheet
      .getRange(getReportOffset(), 1, reportSheet.getLastRow(), 13)
      .getValues()
      .filter(filterEmptyRow)
      .map((reportRow, reportRowIndex) => prepareReportRow(reportRow, reportRowIndex))      

  return report
}

function prepareReportRow(reportRow, reportRowIndex) {
  let reportItemObj = {}

  reportItemObj.order_index = reportRowIndex;

  getReportColumnsMap().forEach((field, column) => {
    let value = reportRow[column - 1];    
    if (value && field === 'date_of_adoption') {
      value = formatDate(value)
    }

    reportItemObj[field] = value ? value : null
  })

  return reportItemObj
}

function setReportDate(date)
{
  let dateString = null

  if (date) {
    let dateObj = new Date(date)  
    if (!!dateObj.getDate()) {
      dateString = formatDate(dateObj, {withTime: true})
    }    
  }

  getReportDateCell().setValue(dateString)
}

function refreshReport(filter) {
  filter = filter || {}

  setReportDate(null)
  clearReport()
  createReport(filter)
  setReportDate(new Date())
}
