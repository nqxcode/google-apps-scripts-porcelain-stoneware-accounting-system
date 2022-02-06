let Audit = function (section) {  
  this.section = section

  function filterObject(object, excludeProps) {
    let result = {}
    excludeProps = excludeProps || []

    object = object || {}

    Object.keys(object).forEach(propertyKey => {
      let propertyValue = object[propertyKey]

      if (excludeProps.includes(propertyKey)) {
        return
      }

      result[propertyKey] = propertyValue ? String(propertyValue) : null
    })

    return result
  }

  function diffObjects(o2, o1) {
    return Object
        .keys(o2)
        .reduce((diff, key) => {
              if (o1[key] === o2[key])
                return diff

              return {...diff, [key]: o2[key]}
            },
            {}
        )
  }

  function translateObjectProps(object) {
    let result = {}
    Object.keys(object).forEach((key) => {
      let humanizedKey = trans[key] || key

      result[humanizedKey] = object[key]
    })

    return result
  }

  function objectToString(object) {
    let keyValueList = []
    Object.keys(object).forEach((key) => {
      let value = object[key] || '-'

      keyValueList.push(`${key}: ${value}`)
    })

    let result = keyValueList.join("\n")

    return result
  }

  function removeEmpty(object) {
    let result = {}

    Object.keys(object).forEach(propertyKey => {
      let propertyValue = object[propertyKey]

      if (!propertyValue) {
        return
      }

      result[propertyKey] = propertyValue
    })

    return result
  }

  function sortObjectProps(object) {
    let result = {}

    let columns = Object.keys(trans)

    let sortedKeys = Array(columns.length)
    Object.keys(object).forEach(key => {
      let index = columns.indexOf(key)
      if (index !== -1) {
        sortedKeys[index] = key
      } else {
        sortedKeys.push(key)
      }
    })

    sortedKeys.forEach(key => {
      result[key] = object[key];
    })

    return result
  }

  function prepareData(data) {
    data = data || {}

    if (Object.keys(data).length !== 0) {
      return objectToString(translateObjectProps(sortObjectProps(data)));
    }

    return '-'
  }

  function makePayload(options) {
    let row = options.row ? `#${options.row}` : null
    let orderNumber = getOrderNumber(options)

    const excludeColumns = ['order_index', 'stone_shapes', 'stone_colors']

    let novel = options.novel ? filterObject(options.novel, excludeColumns) : null
    let prev = options.prev ? filterObject(options.prev, excludeColumns) : null
    let diff = novel && prev ? diffObjects(novel, prev) : null

    novel = removeEmpty(novel || {})
    prev = removeEmpty(prev || {})

    return {
      row: row ? row : '-',
      orderNumber: orderNumber ? escapeValue(orderNumber) : '-',
      novel: prepareData(novel),
      prev: prepareData(prev),
      diff: prepareData(diff),
    }
  }

  function getOrderNumber(options) {
    if (options.novel) {
      return options.novel.order_number
    }

    if (options.prev) {
      return options.prev.order_number
    }

    return null
  }

  this.log = function (action, options) {
    options = options || {}

    let payload = makePayload(options)

    auditSheet.appendRow([
      formatDateTime(new Date()),
      action,
      Session.getActiveUser().getEmail(),
      this.section,
      payload.row,
      payload.orderNumber,
      payload.diff,
      payload.novel,
      payload.prev
    ])
  }
}

Audit.Action = {CREATE: 'Создание', UPDATE: 'Обновление', DELETE: 'Удаление'}