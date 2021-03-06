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

function addShipment(orderData, options) {
  options = options || {}  

  let orderNumber = generateOrderNumber(orderData.order_number, options)

  shipmentsSheet.appendRow([
    orderData.date_of_adoption,    
    prepareValue(orderNumber),
    orderData.diameter,
    orderData.length_min,
    orderData.length_max,
    orderData.width,
    orderData.stone_shape,
    orderData.stone_color
  ]);
}

function updateShipment(orderNumber, shipmentData) {
  let shipmentRow = findShipmentRow(orderNumber)
  if (!shipmentRow) {
    throw new Error(`Заказа с номером ${orderNumber} не сущестует в отгрузке`)
  }  

  let shipmentColumnsMap = getShipmentColumnsMap()

  for(column = 0; column < shipmentColumnsMap.length; column++) {
    let field = shipmentColumnsMap[column]
    let value = prepareFormFieldValue(field, shipmentData);

    if (value !== undefined) {
      shipmentsSheet.getRange(shipmentRow, column).setValue(value);     
    }
  }
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
    throw new Error(`Заказа с номером ${orderNumber} уже существует в отгрузке`)
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
    throw new Error(`Заказ с номером ${orderNumber} не был удален из отгрузки`)  
  }
}

function moveShipmentToAssembly(orderNumber)
{
  let orderData = findShipment(orderNumber)
  if (!orderData) {
    throw new Error(`Заказа с номером ${orderNumber} не существует в отгрузке`)
  }

  addAssembly(
    {
      date_of_adoption: formatDate(Date.now()),
      order_number: orderData.order_number,
      diameter: orderData.diameter,
      length_min: orderData.length_min,
      length_max: orderData.length_max,
      width: orderData.width,
      stone_shape: orderData.stone_shape,
      stone_color: orderData.stone_color
    },
    {
      checkOrderNumberUnique: {
        needs: false,
        polishings: false,
        assemblies: true,
        shipments: false
      }
    }
  )

  let isRemovedFromShipment = removeShipment(orderNumber)
  if (!isRemovedFromShipment) {
    throw new Error(`Заказ с номером ${orderNumber} не был удален из отгрузки`)
  }
} 

function moveShipmentToPolishing(orderNumber)
{
  let orderData = findShipment(orderNumber)
  if (!orderData) {
    throw new Error(`Заказа с номером ${orderNumber} не существует в отгрузке`)
  }

  addPolishing(
    {
      date_of_adoption: formatDate(Date.now()),
      order_number: orderData.order_number,
      diameter: orderData.diameter,
      length_min: orderData.length_min,
      length_max: orderData.length_max,
      width: orderData.width,
      stone_shape: orderData.stone_shape,
      stone_color: orderData.stone_color
    },
    {
      checkOrderNumberUnique: {
        needs: false,
        polishings: true,
        assemblies: false,
        shipments: false
      }
    }
  )

  let isRemovedFromShipment = removeShipment(orderNumber)
  if (!isRemovedFromShipment) {
    throw new Error(`Заказ с номером ${orderNumber} не был удален из отгрузки`)
  }
}

function getShipments()
{
  let data = shipmentsSheet
    .getRange(getShipmentOffset(), 1, shipmentsSheet.getLastRow(), 8)
    .getValues()
    .filter(filterRow)
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
