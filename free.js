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
  let preparedData = escapeObjectProps(orderData)
  freeSheet.appendRow([
    preparedData.diameter,
    preparedData.length_min,
    preparedData.length_max,
    preparedData.width,
    preparedData.stone_shape,
    preparedData.stone_color,
    preparedData.comment,
    preparedData.with_worktop,
  ]);

  audit.free.log(Audit.Action.CREATE, {novel: orderData, row: freeSheet.getLastRow()})

  return true
}

function updateFree(freeIndex, freeData) {
  let freeRow = findFreeRow(freeIndex)
  if (!freeRow) {
    let freeNumber = freeIndex + 1
    throw new Error(`Заказа с номером по порядку ${freeNumber} не сущестует в свободных`)
  }

  let prevFreeData = findFree(freeIndex)

  let freeColumnsMap = getFreeColumnsMap()

  for(column = 0; column < freeColumnsMap.length; column++) {
    let field = freeColumnsMap[column]    
    let value = prepareFormFieldValue(field, freeData)

    if (value !== undefined) {
      freeSheet.getRange(freeRow, column).setValue(escapeValue(value));
    }
  }

  let newFreeData = findFree(freeIndex)

  audit.free.log(Audit.Action.UPDATE, {novel: newFreeData, prev: prevFreeData, row: getFreeRowByIndex(prevFreeData.order_index)})
}

function getFreeRowByIndex(orderIndex) { 
  return getFreeOffset() + orderIndex
}

function moveFreeToAssembly(freeIndex)
{
  try {
    let freeData = findFree(freeIndex)
    if (!freeData) {
      throw new Error(`Не найдена свободная позиция c номером ${freeIndex}`)
    }

    Audit.withCommenting('Перемещение из свободных в сборку: создание в сборке')
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

    Trash.withPermanentDeletion(() => {
      Audit.withCommenting('Перемещение из свободных в сборку: удаление из свободных')
      let isRemovedFromFree = removeFree(freeIndex)
      if (!isRemovedFromFree) {
        throw new Error(`Свободная позиция с номером ${freeIndex} не была удалена`)
      }
    })
  } finally {
    Audit.withoutCommenting()
  }
}

function findFree(orderIndex)
{
  let freeList = getFree()  
  let free = freeList.find(free => free.order_index == orderIndex)

  return free;
}


function removeFree(orderIndex) {
  let freeRow = findFreeRow(orderIndex)
  let prevFreeData = findFree(orderIndex)

  if (freeRow) {

    trash.free.put(prevFreeData)
    audit.free.log(Audit.Action.DELETE, {prev: prevFreeData, row: getFreeRowByIndex(prevFreeData.order_index)})

    return true
  }
  
  return false
}

function findFreeRow(orderIndex) {
  let freeList = getFree()  

  for(freeIndex = 0; freeIndex < freeList.length; freeIndex++) {
    if (freeList[freeIndex].order_index == orderIndex) {
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
    .map((free, freeIndex) => prepareFree(free, freeIndex)) 
    .filter(makeOrderFilter(filter))

  return data;
}

function prepareFree(freeData, orderIndex)
{
  let freeObj = {}
  
  freeObj.order_index = orderIndex

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
