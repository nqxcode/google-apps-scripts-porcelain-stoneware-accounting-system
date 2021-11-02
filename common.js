function checkOrderNumberUnique(orderNumber, options) { 
  options = options || {}

  let defaultOptions = {
    throwIfNotUnique: false,
    checkOrderNumberUnique: {
      needs: true,
      polishings: true,
      assemblies: true,
      shipments: true
    }
  }  

  options = {...defaultOptions, ...options};

  if (options.checkOrderNumberUnique.needs) {
    let needRow = findNeedRow(orderNumber)
    if (needRow !== null) {
      if (options.throwIfNotUnique) {
        throw new Error(`Заказ с номером ${orderNumber} уже существует в потребности`)
      }

      return false
    }
  }

  if (options.checkOrderNumberUnique.polishings) {
    let polishingRow = findPolishingRow(orderNumber)
    if (polishingRow !== null) {
      if (options.throwIfNotUnique) {
        throw new Error(`Заказ с номером ${orderNumber} уже существует в полировке`)
      }

      return false
    }
  }

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
  let rules = [
    {field: 'length_max', stoneShapes: ['бочка', 'овал', 'стадион', 'прямоугольник', 'раздвижной стол']},
    {field: 'length_min', stoneShapes: ['раздвижной стол']},                            
    {field: 'width', stoneShapes: ['бочка', 'овал', 'стадион', 'прямоугольник', 'раздвижной стол']},
    {field: 'diameter', stoneShapes: ['круг', 'сектора']}              
  ]

  return rules
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

function prepareFormFieldValue(field, formData)
{
    let value = formData[field]    
    
    let rule = getFormRule(field)
    if (rule) {
      let stoneShape = formData['stone_shape']
      if (stoneShape) {
        let isNeedToReset = !rule.stoneShapes.includes(stoneShape)
        if (isNeedToReset) {
            value = null
        }
      }      
    }

    return value
}