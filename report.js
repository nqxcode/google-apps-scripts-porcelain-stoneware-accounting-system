function getReportOffset() {
  return 4
}

function getReportColumnsMap() {
  let columnsMap = []

  columnsMap[1] = 'section'
  columnsMap[2] = 'date_of_adoption'
  columnsMap[3] = 'order_number'
  columnsMap[4] = 'diameter'
  columnsMap[5] = 'length_min'
  columnsMap[6] = 'length_max'
  columnsMap[7] = 'width'
  columnsMap[8] = 'stone_shape'
  columnsMap[9] = 'stone_color'
  columnsMap[10] = 'shipped'
  columnsMap[11] = 'packed'
  columnsMap[12] = 'with_worktop'
  columnsMap[13] = 'comment'

  return columnsMap;
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

function getReportStringified(filter) {
  filter = filter || {}

  createReport(filter)
}
