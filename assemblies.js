function getAssemblyOffset() {
  return 4
}
const all = 'Все'

function getAssemblyColumnsMap() {
  let columnsMap = []

  columnsMap[1] = 'date_of_adoption'
  columnsMap[2] = 'order_number'
  columnsMap[3] = 'diameter'
  columnsMap[4] = 'length_min'
  columnsMap[5] = 'length_max'
  columnsMap[6] = 'width'
  columnsMap[7] = 'stone_shape'
  columnsMap[8] = 'stone_color'
  columnsMap[9] = 'comment'

  return columnsMap;
}

function findAssemblyRow(orderNumber) {
  let assemblies = getAssemblies()

  for (assemblyIndex = 0; assemblyIndex < assemblies.length; assemblyIndex++) {
    if (assemblies[assemblyIndex].order_number == orderNumber) {
      return getAssemblyOffset() + assemblyIndex
    }
  }

  return null
}

function getAssemblyRowByIndex(orderIndex) {
  return getAssemblyOffset() + orderIndex
}

function addAssembly(assemblyData, options) {
  options = options || {}
  let orderNumber = generateOrderNumber(assemblyData.order_number, options)
  let assemblyColumnsMap = getAssemblyColumnsMap()

  let hasAnyFilled = false
  for (column = 1; column <= assemblyColumnsMap.length; column++) {
    let field = assemblyColumnsMap[column]
    let value = assemblyData[field]

    hasAnyFilled = hasAnyFilled || !!value
  }

  if (!hasAnyFilled) {
    throw new Error(`Чтобы добавить заказ в сборку, нужно заполнить хотя бы одно поле`)
  }

  assemblyData.date_of_adoption = assemblyData.date_of_adoption ? assemblyData.date_of_adoption : formatDate(Date.now())
  assemblyData.order_number = orderNumber

  let preparedData = escapeObjectProps(assemblyData)

  assembliesSheet.appendRow([
    preparedData.date_of_adoption,
    preparedData.order_number,
    preparedData.diameter,
    preparedData.length_min,
    preparedData.length_max,
    preparedData.width,
    preparedData.stone_shape,
    preparedData.stone_color,
    preparedData.comment,
  ]);

  audit.assemblies.log(Audit.Action.CREATE, {novel: assemblyData, row: assembliesSheet.getLastRow()})
}

function updateAssembly(orderIndex, assemblyData) {
  let assemblyRow = getAssemblyRowByIndex(orderIndex)
  let prevAssemblyData = getAssemblyByIndex(orderIndex)
  let assemblyColumnsMap = getAssemblyColumnsMap()

  if (assemblyData.order_number) {
    assemblyData.order_number = generateOrderNumber(assemblyData.order_number, {current: orderIndex})
  }

  for (column = 0; column < assemblyColumnsMap.length; column++) {
    let field = assemblyColumnsMap[column]
    let value = prepareFormFieldValue(field, assemblyData)

    if (value !== undefined) {
      assembliesSheet.getRange(assemblyRow, column).setValue(escapeValue(value));
    }
  }

  audit.assemblies.log(Audit.Action.UPDATE, {novel: assemblyData, prev: prevAssemblyData, row: getAssemblyRowByIndex(orderIndex)})
}

function moveAssemblyToShipment(orderNumber) {
  let orderData = findAssembly(orderNumber)
  if (!orderData) {
    throw new Error(`Заказа с номером ${orderNumber} не существует в сборке`)
  }

  addShipment(
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
          assemblies: false,
          shipments: true
        }
      }
  )

  let isRemovedFromAssembly = removeAssemblyByIndex(orderData.order_index)
  if (!isRemovedFromAssembly) {
    throw new Error(`Заказ с номером ${orderNumber} не был удален из сборки`)
  }
}

function moveAssemblyToFree(orderIndex) {
  let orderData = getAssemblyByIndex(orderIndex)
  if (!orderData) {
    throw new Error(`Заказа с номером по порядку ${orderIndex + 1} не существует в сборке`)
  }

  addFree(
      {
        date_of_adoption: formatDate(Date.now()),
        diameter: orderData.diameter,
        length_min: orderData.length_min,
        length_max: orderData.length_max,
        width: orderData.width,
        stone_shape: orderData.stone_shape,
        stone_color: orderData.stone_color,
        comment: orderData.comment
      }
  )

  let isRemovedFromAssembly = removeAssemblyByIndex(orderIndex)
  if (!isRemovedFromAssembly) {
    throw new Error(`Заказ с номером по порядку ${orderIndex + 1} не был удален из сборки`)
  }
}

function findAssembly(orderNumber) {
  let assemblies = getAssemblies()
  let assembly = assemblies.find((assembly) => assembly.order_number == orderNumber)

  return assembly;
}

function getAssemblyByIndex(orderIndex) {
  let assemblies = getAssemblies()
  let assembly = assemblies[orderIndex] || null

  return assembly;
}

function removeAssemblyByIndex(orderIndex) {
  let assemblyData = getAssemblyByIndex(orderIndex)
  if (!assemblyData) {
    return false
  }

  trash.assemblies.put(assemblyData)
  assembliesSheet.deleteRow(getAssemblyRowByIndex(assemblyData.order_index))
  audit.assemblies.log(Audit.Action.DELETE, {prev: assemblyData, row: getAssemblyRowByIndex(assemblyData.order_index)})

  return true
}


function getAssemblies(filter) {
  filter = filter || {}

  let data = assembliesSheet
      .getRange(getAssemblyOffset(), 1, assembliesSheet.getLastRow(), 9)
      .getValues()
      .filter(filterEmptyRow)
      .map((assembly, assemblyIndex) => prepareAssembly(assembly, assemblyIndex))
      .filter(makeOrderFilter(filter));

  return data;
}

function prepareAssembly(assemblyData, orderIndex) {
  let assemblyObj = {}

  assemblyObj.order_index = orderIndex;

  getAssemblyColumnsMap().forEach((field, column) => {
    let value = assemblyData[column - 1];
    if (value !== undefined) {
      if (field === 'date_of_adoption') {
        value = formatDate(value)
      }
      assemblyObj[field] = value
    }
  })


  assemblyObj.stone_colors = stoneColors
  assemblyObj.stone_shapes = stoneShapes

  return assemblyObj
}

function getAssembliesStringified(filter, calleeTab) {
  filter = filter || {}
  let assemblyStoneShapes = getAssemblyStoneShapes()

  let assemblies = {}
  assemblyStoneShapes.forEach((stoneShape) => {
    assemblies[stoneShape] = getAssemblies({
      ...filter,
      ...{stone_shape: stoneShape === all ? (calleeTab === all ? filter.stone_shape : null) : stoneShape}
    })
  })

  return JSON.stringify({
    assemblyStoneShapes: assemblyStoneShapes,
    assemblies: assemblies
  })
}

function getAssemblyStoneShapes() {
  let allVariant = all
  let stoneShapes = getStoneShapes()

  return [allVariant].concat(stoneShapes)
}
