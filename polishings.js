function getPolishingOffset() {
  return 4
}

function getPolishingColumnsMap() {
    let columnsMap = []

    columnsMap[1] = 'date_of_adoption'
    columnsMap[2] = 'order_number'
    columnsMap[3] = 'diameter'
    columnsMap[4] = 'length_min'
    columnsMap[5] = 'length_max'
    columnsMap[6] = 'width'
    columnsMap[7] = 'stone_shape'
    columnsMap[8] = 'stone_color'

    return columnsMap;
}

function findPolishingRow(orderNumber) {
  let polishings = getPolishings()  

  for(polishingIndex = 0; polishingIndex < polishings.length; polishingIndex++) {
    if (polishings[polishingIndex].order_number == orderNumber) {
      return getPolishingOffset() + polishingIndex
    }
  }

  return null
}

function getPolishingRowByIndex(orderIndex) { 
  return getPolishingOffset() + orderIndex
}

function checkPolishingOrderNumberUnique(orderNumber) {  
  let polishingRow = findPolishingRow(orderNumber)  

  return polishingRow === null
}

function addPolishing(polishingData)
{  
  if(polishingData.order_number && !checkPolishingOrderNumberUnique(polishingData.order_number)) {
    throw new Error(`Номер заказа должен быть уникальным`)
  }

  let polishingColumnsMap = getPolishingColumnsMap()

  let hasAnyFilled = false
  for(column = 1; column <= polishingColumnsMap.length; column++) {
    let field = polishingColumnsMap[column]
    let value = polishingData[field]

    hasAnyFilled = hasAnyFilled || !!value
  }

  if (!hasAnyFilled) {
    throw new Error(`Чтобы добавить заказ в полировку, нужно заполнить хотя бы одно поле`)
  }

  polishingsSheet.appendRow([
    polishingData.date_of_adoption,    
    polishingData.order_number,
    polishingData.diameter,
    polishingData.length_min,
    polishingData.length_max,
    polishingData.width,
    polishingData.stone_shape,
    polishingData.stone_color
  ]);
}


function updatePolishing(orderIndex, polishingData) {
  let polishingRow = getPolishingRowByIndex(orderIndex)
  let polishingColumnsMap = getPolishingColumnsMap()

  for(column = 0; column < polishingColumnsMap.length; column++) {
    let field = polishingColumnsMap[column]
    let value = polishingData[field]

    if (field === 'order_number' && value && !checkPolishingOrderNumberUnique(value)) {
      throw new Error(`Заказ с номером ${value} уже существует в сборке`)
    } 
  }

  for(column = 0; column < polishingColumnsMap.length; column++) {
    let field = polishingColumnsMap[column]
    let value = polishingData[field];

    if (value !== undefined) {
      polishingsSheet.getRange(polishingRow, column).setValue(value);     
    }
  }
}

function movePolishingToAssembly(orderNumber)
{
  let orderData = findPolishing(orderNumber)
  if (!orderData) {
    throw new Error(`Заказа с номером ${orderNumber} не существует в полировке`)
  }

  addAssembly({
    date_of_adoption: formatDate(Date.now()),
    order_number: orderData.order_number,
    diameter: orderData.diameter,
    length_min: orderData.length_min,
    length_max: orderData.length_max,
    width: orderData.width,
    stone_shape: orderData.stone_shape,
    stone_color: orderData.stone_color
  })

  let isRemovedFromPolishing = removePolishing(orderNumber)
  if (!isRemovedFromPolishing) {
    throw new Error(`Заказ с номером ${orderNumber} не был удален из полировки`)
  }

  return false
} 

function findPolishing(orderNumber)
{
  let polishings = getPolishings()  
  let polishing = polishings.find((polishing) => polishing.order_number == orderNumber)

  return polishing;
}

function removePolishing(orderNumber) {
  let polishingRow = findPolishingRow(orderNumber)
  if (polishingRow) {
    polishingsSheet.deleteRow(polishingRow)
    return true
  }

  return false
}

function getPolishings()
{
  let data = polishingsSheet
    .getRange(getPolishingOffset(), 1, polishingsSheet.getLastRow(), 8)
    .getValues()
    .filter(v => v.filter(c => c).length)
    .map(polishing => preparePolishing(polishing));    

  return data;
}

function preparePolishing(polishingData)
{
  let polishingObj = {}

  getPolishingColumnsMap().forEach((field, column) => {
    let value = polishingData[column - 1];
    if (value !== undefined) {
      if (field === 'date_of_adoption') {
        value = formatDate(value)
      }
      polishingObj[field] = value
    }
  })
    

  polishingObj.stone_colors = stoneColors
  polishingObj.stone_shapes = stoneShapes

  return polishingObj
}

function getPolishingsStringified() 
{
  let orders = getPolishings()  

  return JSON.stringify(orders)
}