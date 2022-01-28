function getAssemblyOffset() {
  return 4
}

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

    return columnsMap;
}

function findAssemblyRow(orderNumber) {
  let assemblies = getAssemblies()  

  for(assemblyIndex = 0; assemblyIndex < assemblies.length; assemblyIndex++) {
    if (assemblies[assemblyIndex].order_number == orderNumber) {
      return getAssemblyOffset() + assemblyIndex
    }
  }

  return null
}

function getAssemblyRowByIndex(orderIndex) { 
  return getAssemblyOffset() + orderIndex
}

function addAssembly(assemblyData, options)
{  
  options = options || {}  
  let orderNumber = generateOrderNumber(assemblyData.order_number, options)
  let assemblyColumnsMap = getAssemblyColumnsMap()

  let hasAnyFilled = false
  for(column = 1; column <= assemblyColumnsMap.length; column++) {
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
    assemblyData.stone_color
  ]);
}

function updateAssembly(orderIndex, assemblyData) {
  let assemblyRow = getAssemblyRowByIndex(orderIndex)
  let assemblyColumnsMap = getAssemblyColumnsMap()


  for(column = 0; column < assemblyColumnsMap.length; column++) {
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

function moveAssemblyToShipment(orderNumber)
{
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
        needs: false,
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

function moveAssemblyToFree(orderIndex)
{
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
      stone_color: orderData.stone_color
    }
  )

  let isRemovedFromAssembly = removeAssemblyByIndex(orderIndex)
  if (!isRemovedFromAssembly) {
    throw new Error(`Заказ с номером по порядку ${orderIndex + 1} не был удален из сборки`)
  }
}

function findAssembly(orderNumber)
{
  let assemblies = getAssemblies()  
  let assembly = assemblies.find((assembly) => assembly.order_number == orderNumber)

  return assembly;
}

function getAssemblyByIndex(orderIndex)
{
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


function getAssemblies()
{
  let data = assembliesSheet
    .getRange(getAssemblyOffset(), 1, assembliesSheet.getLastRow(), 8)
    .getValues()
    .filter(filterRow)
    .map((assembly, assemblyIndex) => prepareAssembly(assembly, assemblyIndex));    

  return data;
}

function prepareAssembly(assemblyData, orderIndex)
{
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

function getAssembliesStringified() 
{
  let orders = getAssemblies()  

  return JSON.stringify(orders)
}