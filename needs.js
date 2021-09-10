function getNeedOffset() {
  return 4
}

function getNeedColumnsMap() {
    let columnsMap = []

    columnsMap[1] = 'date_of_adoption'
    columnsMap[2] = 'date_of_shipping'
    columnsMap[3] = 'order_number'
    columnsMap[4] = 'diameter'
    columnsMap[5] = 'length_min'
    columnsMap[6] = 'length_max'
    columnsMap[7] = 'width'
    columnsMap[8] = 'stone_shape'
    columnsMap[9] = 'stone_color'

    return columnsMap;
}

function findNeedRow(orderNumber) {
  let needs = getNeeds()  

  for(orderIndex = 0; orderIndex < needs.length; orderIndex++) {
    if (needs[orderIndex].order_number == orderNumber) {
      return getNeedOffset() + orderIndex
    }
  }

  return null
}

function checkNeedOrderNumberUnique(orderNumber) {
  let needRow = findNeedRow(orderNumber)

  return needRow === null
}

function addNeed(orderData) {  
  if(orderData.order_number && !checkNeedOrderNumberUnique(orderData.order_number)) {
    return false
  }

  needsSheet.appendRow([
    orderData.date_of_adoption,
    orderData.date_of_shipping,
    "'" + orderData.order_number,
    orderData.diameter,
    orderData.length_min,
    orderData.length_max,
    orderData.width,
    orderData.stone_shape,
    orderData.stone_color
  ]);

  return true
}


function moveNeedToAssembly(orderNumber) {
  let orderData = findNeed(orderNumber)
    if (!orderData) {
    throw new Error(`Заказа с номером ${orderNumber} уже существует в потребностях`)
  }

  if (findAssembly(orderNumber)) {
    throw new Error(`Заказ с номером ${orderNumber} уже существует в сборке`)
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

  let isRemovedFromNeed = removeNeed(orderNumber)
  if (!isRemovedFromNeed) {  
    throw new Error(`Заказ с номером ${orderNumber} не был удален из потребностей`)  
  }
}

function moveNeedToPolishing(orderNumber) {
  let orderData = findNeed(orderNumber)
    if (!orderData) {
    throw new Error(`Заказа с номером ${orderNumber} уже существует в потребностях`)
  }

  if (findPolishing(orderNumber)) {
    throw new Error(`Заказ с номером ${orderNumber} уже существует в полировке`)
  }

  addPolishing({
    date_of_adoption: formatDate(Date.now()),
    order_number: orderData.order_number,
    diameter: orderData.diameter,
    length_min: orderData.length_min,
    length_max: orderData.length_max,
    width: orderData.width,
    stone_shape: orderData.stone_shape,
    stone_color: orderData.stone_color
  })

  let isRemovedFromNeed = removeNeed(orderNumber)
  if (!isRemovedFromNeed) {  
    throw new Error(`Заказ с номером ${orderNumber} не был удален из потребностей`)  
  }
}

function removeNeed(orderNumber) {
  let needRow = findNeedRow(orderNumber)
  if (needRow) {
    needsSheet.deleteRow(needRow)
    return true
  }

  return false
}

function updateNeed(orderNumber, needData) {
  let needRow = findNeedRow(orderNumber)
  if (!needRow) {
    throw new Error(`Заказа с номером ${orderNumber} не сущестует в потребностях`)
  }  

  let needColumnsMap = getNeedColumnsMap()

  for(column = 0; column < needColumnsMap.length; column++) {
    let field = needColumnsMap[column]
    let value = needData[field];

    if (value !== undefined) {
      needsSheet.getRange(needRow, column).setValue(value);     
    }
  }
}

function findNeed(orderNumber)
{
  let orders = getNeeds()  
  let need = orders.find((need) => need.order_number == orderNumber)

  return need;
}

function getNeeds()
{
  var data = needsSheet
    .getRange(getNeedOffset(), 1, needsSheet.getLastRow(), 9)
    .getValues()
    .filter(v => v.filter(c => c).length)
    .map(need => prepareNeed(need));    

  return data;
}

function prepareNeed(needData)
{
  let needObj = {} 

  getNeedColumnsMap().forEach((field, column) => {
    let value = needData[column - 1];
    if (value !== undefined) {
      if (['date_of_adoption', 'date_of_shipping'].includes(field)) {
        value = formatDate(value)
      }
      needObj[field] = value
    }
  })

  needObj.stone_colors = stoneColors
  needObj.stone_shapes = stoneShapes

  return needObj
}

function getNeedsStringified()
{
  let orders = getNeeds()  

  return JSON.stringify(orders)
}



