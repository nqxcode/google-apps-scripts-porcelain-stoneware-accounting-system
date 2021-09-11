function getShipmentOffset() {
  return 4
}  

function getShipmentColumnsMap() {
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

function checkShipmentOrderNumberUnique(orderNumber) {
  let shipmentRow = findShipmentRow(orderNumber)

  return shipmentRow === null
}

function addShipment(orderData) {
  if(orderData.order_number && !checkShipmentOrderNumberUnique(orderData.order_number)) {
    return false
  }

  shipmentsSheet.appendRow([
    orderData.date_of_adoption,    
    prepareOrderNumber(orderData.order_number),
    orderData.diameter,
    orderData.length_min,
    orderData.length_max,
    orderData.width,
    orderData.stone_shape,
    orderData.stone_color
  ]);

  return true
}

function findShipmentRow(orderNumber) {
  let shipments = getShipments()  

  for(shipmentIndex = 0; shipmentIndex < shipments.length; shipmentIndex++) {
    if (shipments[shipmentIndex].order_number == orderNumber) {
      return getShipmentOffset() + shipmentIndex
    }
  }

  return null
}

function findShipment(orderNumber)
{
  let orders = getShipments()  
  let shipment = orders.find((shipment) => shipment.order_number == orderNumber)

  return shipment;
}

function removeShipment(orderNumber) {
  let shipmentRow = findShipmentRow(orderNumber)
  if (shipmentRow) {
    shipmentsSheet.deleteRow(shipmentRow)
    return true
  }

  return false
}

function moveShipmentToFree(orderNumber) {
  let orderData = findShipment(orderNumber)
    if (!orderData) {
    throw new Error(`Заказа с номером ${orderNumber} уже существует в отгруженных`)
  }

  addFree({
    diameter: orderData.diameter,
    length_min: orderData.length_min,
    length_max: orderData.length_max,
    width: orderData.width,
    stone_shape: orderData.stone_shape,
    stone_color: orderData.stone_color
  })

  let isRemovedFromShipment = removeShipment(orderNumber)
  if (!isRemovedFromShipment) {  
    throw new Error(`Заказ с номером ${orderNumber} не был удален из отгруженных`)  
  }
}

function getShipments()
{
  let data = shipmentsSheet
    .getRange(getShipmentOffset(), 1, shipmentsSheet.getLastRow(), 8)
    .getValues()
    .filter(v => v.filter(c => c).length)
    .map(shipment => prepareShipment(shipment));    

  return data;
}

function prepareShipment(shipmentData)
{
  let shipmentObj = {}

  getShipmentColumnsMap().forEach((field, column) => {
    let value = shipmentData[column - 1];
    if (value !== undefined) {
      if (field === 'date_of_adoption') {
        value = formatDate(value)
      }
      shipmentObj[field] = value
    }
  })
    

  shipmentObj.stone_colors = stoneColors
  shipmentObj.stone_shapes = stoneShapes

  return shipmentObj
}

function getShipmentsStringified() 
{
  let orders = getShipments()  

  return JSON.stringify(orders)
}
