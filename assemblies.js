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

  assembliesSheet.appendRow([
    assemblyData.date_of_adoption ? assemblyData.date_of_adoption : formatDate(Date.now()),
    prepareValue(orderNumber),
    assemblyData.diameter,
    assemblyData.length_min,
    assemblyData.length_max,
    assemblyData.width,
    assemblyData.stone_shape,
    assemblyData.stone_color,
    assemblyData.comment,
  ]);
}

function updateAssembly(orderIndex, assemblyData) {
  let assemblyRow = getAssemblyRowByIndex(orderIndex)
  let assemblyColumnsMap = getAssemblyColumnsMap()


  for (column = 0; column < assemblyColumnsMap.length; column++) {
    let field = assemblyColumnsMap[column]
    let value = prepareFormFieldValue(field, assemblyData)

    if (value !== undefined) {
      if (field === 'order_number' && value) {
        value = prepareValue(generateOrderNumber(value))
      }
      assembliesSheet.getRange(assemblyRow, column).setValue(value);
    }
  }
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

  let isRemovedFromAssembly = removeAssembly(orderNumber)
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

function removeAssembly(orderNumber) {
  let assemblyRow = findAssemblyRow(orderNumber)
  if (assemblyRow) {
    assembliesSheet.deleteRow(assemblyRow)
    return true
  }

  return false
}

function removeAssemblyByIndex(orderIndex) {
  let assemblyRow = getAssemblyRowByIndex(orderIndex)
  if (assemblyRow) {
    assembliesSheet.deleteRow(assemblyRow)
    return true
  }

  return false
}

function getAssemblies(filter) {
  filter = filter || {}

  let data = assembliesSheet
      .getRange(getAssemblyOffset(), 1, assembliesSheet.getLastRow(), 9)
      .getValues()
      .filter(filterEmptyRow)
      .map((assembly, assemblyIndex) => prepareAssembly(assembly, assemblyIndex))
      .filter(filterAssembly(filter));

  return data;
}

function filterAssembly(filter) {
  return function (assemblyObj) {
    if (Object.keys(filter).length === 0) {
      return true
    }

    let isMatch = true;

    Object.keys(filter).forEach(name => {
      switch (name) {
        case 'stone_shape':
          if (filter[name]) {
            isMatch = isMatch && filter[name] === assemblyObj[name]
          }

          break
        case 'date_of_adoption':
          if ((filter.date_of_adoption.from || filter.date_of_adoption.to) && !assemblyObj[name]) {
            isMatch = false
            break
          }

          if (filter.date_of_adoption.from) {
            const date = new Date(assemblyObj[name])
            const fromDate = new Date(filter.date_of_adoption.from)

            isMatch = isMatch && date >= fromDate
          }

          if (filter.date_of_adoption.to) {
            const date = new Date(assemblyObj[name])
            const toDate = new Date(filter.date_of_adoption.to)

            isMatch = isMatch && date <= toDate
          }

          break
        default:
          if (filter[name]) {
            isMatch = isMatch && filter[name] === assemblyObj[name]
          }
      }
    })

    return isMatch
  }
}

function test_filterAssembly() {
  filter = {
    "order_number": "",
    "stone_shape": "овал",
    "stone_color": "",
    "diameter": "",
    "length_min": "",
    "length_max": "",
    "width": 1000,
    "date_of_adoption": {
      "from": null,
      "to": null
    }
  }

  let data = assembliesSheet
      .getRange(getAssemblyOffset(), 1, assembliesSheet.getLastRow(), 8)
      .getValues()
      .filter(filterEmptyRow)
      .map((assembly, assemblyIndex) => prepareAssembly(assembly, assemblyIndex))

  let test = data.filter(filterAssembly(filter));

  return
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
