function test_filterAssembly() {
  filter = {
    "order_number": "",
    "stone_shape": "",
    "stone_color": "",
    "diameter": "",
    "length_min": "",
    "length_max": "",
    "width": "",
    "date_of_adoption": {
      "from": null,
      "to": null
    },
    "comment": "Срочно"
  }

  let data = assembliesSheet
      .getRange(getAssemblyOffset(), 1, assembliesSheet.getLastRow(), 9)
      .getValues()
      .filter(filterEmptyRow)
      .map((assembly, assemblyIndex) => prepareAssembly(assembly, assemblyIndex))

  let test = data.filter(makeOrderFilter(filter));

  Logger.log(test.length > 0)

  return
}

function test_filterShipment() {
  filter = {
    "order_number": "",
    "stone_shape": "",
    "stone_color": "",
    "diameter": "",
    "length_min": "",
    "length_max": "",
    "width": "",
    "date_of_adoption": {
      "from": null,
      "to": null
    },
    "comment": "",
    "shipped": null,
    "packed": null,
  }

  let data = shipmentsSheet
      .getRange(getShipmentOffset(), 1, shipmentsSheet.getLastRow(), 9)
      .getValues()
      .filter(filterEmptyRow)
      .map((shipment, shipmentIndex) => prepareAssembly(shipment, shipmentIndex))

  let test = data.filter(makeOrderFilter(filter));

  Logger.log(test.length > 0)

  return
}

function test_updateAssembly() {
  updateAssembly(2,   {
    "order_number": "559966",
    "stone_shape": "бочка",
    "stone_color": "Arabescato беж",
    "length_max": "1600", 
    "width": "1000",
    "date_of_adoption": "",
    "comment": ""
  })
}

function test_updateShipment() {
  updateShipment(0,   {
  "order_number": "1232222-2",
  "stone_shape": "",
  "stone_color": "",
  "diameter": "",
  "length_min": "",
  "length_max": "",
  "width": "",
  "date_of_adoption": "",
  "shipped": "",
  "packed": ""
}
)
}

function test_moveShipmentToAssembly() {
  moveShipmentToAssembly('22212432')
}

function test_removeFree() {
  removeFree(0)
}

function test_removeAssemblyByIndex() {
  removeAssemblyByIndex(2)
}

function test_recoverOrder() {
  recoverOrder(6)
}


