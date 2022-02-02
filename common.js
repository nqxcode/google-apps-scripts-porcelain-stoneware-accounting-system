function checkOrderNumberUnique(orderNumber, options) {
  options = options || {}

  let defaultOptions = {
    throwIfNotUnique: false,
    checkOrderNumberUnique: {
      assemblies: true,
      shipments: true
    }
  }

  options = {...defaultOptions, ...options};

  if (options.checkOrderNumberUnique.assemblies) {
    let assemblyRow = findAssemblyRow(orderNumber)
    if (assemblyRow !== null) {
      if (options.throwIfNotUnique) {
        throw new Error(`Заказ с номером ${orderNumber} уже существует в сборке`)
      }

      return false
    }
  }

  if (options.checkOrderNumberUnique.shipments) {
    let shipmentRow = findShipmentRow(orderNumber)
    if (shipmentRow !== null) {
      if (options.throwIfNotUnique) {
        throw new Error(`Заказ с номером ${orderNumber} уже существует в отгрузке`)
      }

      return false
    }

    return true
  }
}

function getFormRules()
{
  return [
    {field: 'length_max', stoneShapes: ['бочка', 'овал', 'стадион', 'прямоугольник', 'раздвижной стол']},
    {field: 'length_min', stoneShapes: ['раздвижной стол']},
    {field: 'width', stoneShapes: ['бочка', 'овал', 'стадион', 'прямоугольник', 'раздвижной стол']},
    {field: 'diameter', stoneShapes: ['круг', 'сектора', 'крутилка']}
  ]
}

function getFormRule(field)
{
  let rules = getFormRules();
  for(ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    let rule = rules[ruleIndex]
    if (rule.field === field) {
      return rule
    }
  }

  return null
}

function getAllStoneShapes()
{
  return getFormRules()
    .map(rule => rule.stoneShapes)
    .reduce(function(accumulator, stoneShapes) { return accumulator.concat(stoneShapes) }, [])
    .filter(function(value, index, self) { return self.indexOf(value) === index })
}

function prepareFormFieldValue(field, formData)
{
  let value = formData[field]

  let rule = getFormRule(field)
  if (rule) {
    let stoneShape = String(formData['stone_shape']).toLowerCase()
    if (stoneShape) {
      let isNeedToReset = false

      let allStoneShapes = getAllStoneShapes()
      if (allStoneShapes.includes(stoneShape)) {
        isNeedToReset = !rule.stoneShapes.includes(stoneShape)
      }

      if (isNeedToReset) {
        value = null
      }
    }
  }

  return value
}

function generateOrderNumber(orderNumber, options)
{
  options = options || {}

  if(orderNumber) {
    let attempt = 1
    let newOrderNumber = orderNumber
    while(true) {
      try {
        checkOrderNumberUnique(newOrderNumber, {...options, ...{throwIfNotUnique: true}})
      } catch(Error) {
        newOrderNumber = `${orderNumber}-${attempt + 1}`
        attempt++
        continue
      }
      orderNumber = newOrderNumber
      break
    }
  }

  return orderNumber
}

function filterEmptyRow(row) {
  return row.filter(cell => cell !== '').length;
}

function makeOrderFilter(filter) {
  return function (orderObj) {
    if (Object.keys(filter).length === 0) {
      return true
    }

    let isMatch = true;

    Object.keys(filter).forEach(name => {
      switch (name) {
        case 'stone_shape':
          if (filter[name]) {
            isMatch = isMatch && filter[name] === orderObj[name]
          }

          break
        case 'date_of_adoption':
          if ((filter.date_of_adoption.from || filter.date_of_adoption.to) && !orderObj[name]) {
            isMatch = false
            break
          }

          if (filter.date_of_adoption.from) {
            const date = new Date(orderObj[name])
            const fromDate = new Date(filter.date_of_adoption.from)

            isMatch = isMatch && date >= fromDate
          }

          if (filter.date_of_adoption.to) {
            const date = new Date(orderObj[name])
            const toDate = new Date(filter.date_of_adoption.to)

            isMatch = isMatch && date <= toDate
          }

          break
        case 'comment':
          if (filter[name]) {
            isMatch = String(orderObj[name]).toLowerCase().indexOf(String(filter[name]).toLowerCase()) > -1
          }

          break
        default:
          if (filter[name]) {
            isMatch = isMatch && filter[name] === orderObj[name]
          }
      }
    })

    return isMatch
  }
}
