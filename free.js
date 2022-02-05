function getFreeOffset() {
  return 4
}  

function getFreeColumnsMap() {
    let columnsMap = []
    
    columnsMap[1] = 'diameter'
    columnsMap[2] = 'length_min'
    columnsMap[3] = 'length_max'
    columnsMap[4] = 'width'
    columnsMap[5] = 'stone_shape'
    columnsMap[6] = 'stone_color'
    columnsMap[7] = 'comment'
    columnsMap[8] = 'with_worktop'

    return columnsMap;
}


function addFree(orderData) {
  freeSheet.appendRow([
    orderData.diameter,
    orderData.length_min,
    orderData.length_max,
    orderData.width,
    orderData.stone_shape,
    orderData.stone_color,
    prepareValue(orderData.comment),
  ]);

  audit.free.log(Audit.Action.CREATE, orderData)

  return true
}

function updateFree(orderNumber, freeData) {
  let freeRow = findFreeRow(orderNumber)
  if (!freeRow) {
    throw new Error(`Заказа с номером по порядку ${orderNumber} не сущестует в свободных`)
  }

  let prevFreeData = findFree(orderNumber)

  let freeColumnsMap = getFreeColumnsMap()

  for(column = 0; column < freeColumnsMap.length; column++) {
    let field = freeColumnsMap[column]    
    let value = prepareFormFieldValue(field, freeData)

    if (field === 'comment' && value) {
      value = prepareValue(value)
    }

    if (value !== undefined) {
      freeSheet.getRange(freeRow, column).setValue(value);     
    }
  }

  let newFreeData = findFree(orderNumber)

  audit.free.log(Audit.Action.UPDATE, newFreeData, prevFreeData)
}

function getFreeRowByIndex(orderIndex) { 
  return getFreeOffset() + orderIndex
}

function moveFreeToAssembly(orderNumber)
{
  let freeData = findFree(orderNumber)
  if (!freeData) {    
    throw new Error(`Не найдена свободная позиция c номером ${orderNumber}`)
  }

  addAssembly({
    date_of_adoption: formatDate(Date.now()),
    diameter: freeData.diameter,
    length_min: freeData.length_min,
    length_max: freeData.length_max,
    width: freeData.width,
    stone_shape: freeData.stone_shape,
    stone_color: freeData.stone_color,
    comment: freeData.comment
  })

  let isRemovedFromFree = removeFree(orderNumber)
  if (!isRemovedFromFree) {
    throw new Error(`Свободная позиция с номером ${orderNumber} не была удалена`)
  }
}

function findFree(orderNumber)
{
  let freeList = getFree()  
  let free = freeList.find(free => free.order_number == orderNumber)

  return free;
}


function removeFree(orderNumber) {
  let freeRow = findFreeRow(orderNumber)
  let prevFreeData = findFree(orderNumber)

  if (freeRow) {
    freeSheet.deleteRow(freeRow)

    audit.free.log(Audit.Action.DELETE, null, prevFreeData)

    return true
  }
  
  return false
}

function findFreeRow(orderNumber) {
  let freeList = getFree()  

  for(freeIndex = 0; freeIndex < freeList.length; freeIndex++) {
    if (freeList[freeIndex].order_number == orderNumber) {
      return getFreeOffset() + freeIndex
    }
  }

  return null
}

function getFree(filter)
{
  filter = filter || {}

  let data = freeSheet
    .getRange(getFreeOffset(), 1, freeSheet.getLastRow(), 10)
    .getValues()
    .filter(filterEmptyRow)
    .map((free, freeIndex) => prepareFree(free, freeIndex + 1))
    .filter(makeOrderFilter(filter))

  return data;
}

function prepareFree(freeData, orderNumber)
{
  let freeObj = {}
  
  freeObj.order_number = orderNumber

  getFreeColumnsMap().forEach((field, column) => {
    let value = freeData[column - 1];
    if (value !== undefined) {
      freeObj[field] = value
    }
  })

  freeObj.stone_colors = stoneColors
  freeObj.stone_shapes = stoneShapes

  return freeObj
}

function getFreeStringified(filter)
{
  let orders = getFree(filter)

  return JSON.stringify(orders)
}
