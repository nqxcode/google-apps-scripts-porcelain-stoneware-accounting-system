function getShipmentOffset() {
  return 4
}

const yes = 'да'
const no = 'нет'

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
  columnsMap[9] = 'shipped'
  columnsMap[10] = 'packed'

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
    orderData.stone_color,
    orderData.shipped,
    orderData.packed,
  ]);
}

function updateShipment(orderIndex, shipmentData) {
  let shipmentRow = getShipmentRowByIndex(orderIndex)
  let shipmentColumnsMap = getShipmentColumnsMap()

  for (column = 0; column < shipmentColumnsMap.length; column++) {
    let field = shipmentColumnsMap[column]
    let value = prepareFormFieldValue(field, shipmentData);

    if (value !== undefined) {
      shipmentsSheet.getRange(shipmentRow, column).setValue(value);
    }
  }
}

function findShipmentRow(orderNumber) {
  let shipments = getShipments()

  for (shipmentIndex = 0; shipmentIndex < shipments.length; shipmentIndex++) {
    if (shipments[shipmentIndex].order_number == orderNumber) {
      return getShipmentOffset() + shipmentIndex
    }
  }

  return null
}

function getShipmentRowByIndex(orderIndex) {
  return getShipmentOffset() + orderIndex
}

function findShipment(orderNumber) {
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

function moveShipmentToAssembly(orderNumber) {
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

function getShipments(filter) {
  filter = filter || {}

  let data = shipmentsSheet
      .getRange(getShipmentOffset(), 1, shipmentsSheet.getLastRow(), 10)
      .getValues()
      .filter(filterEmptyRow)
      .map(shipment => prepareShipment(shipment))
      .filter(makeOrderFilter(filter))

  return data
}

function prepareShipment(shipmentData) {
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

function getShipmentsStringified(filter) {
  let orders = getShipments(filter)

  return JSON.stringify(orders)
}
