let Audit = function (section) {
  this.section = section

  function normalizeObject(object) {
    let result = {}

    object = object || {}

    Object.keys(object).forEach(propertyKey => {
        let propertyValue = object[propertyKey]
        if (typeof propertyValue === 'object' || Array.isArray(propertyValue)) {
          return
        }

        if (propertyKey === 'order_index') {
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

    let columns = [
      'order_number',
      'stone_shape',
      'stone_color',
      'diameter',
      'length_min,',
      'length_max',
      'width',
      'date_of_adoption',
      'shipped',
      'packed',
      'with_worktop',
      'comment',
    ]

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

  this.log = function (action, options) {
    options = options || {}

    let row = options.row ? `#${options.row}` : '-'

    let newData = options.novel ? normalizeObject(options.novel) : null
    let prevData = options.prev ? normalizeObject(options.prev) : null
    let diffData = newData && prevData ? diffObjects(newData, prevData) : null

    auditSheet.appendRow([
      formatDateTime(new Date()),
      action,
      Session.getActiveUser().getEmail(),
      this.section,
      row,
      prepareData(diffData),
      prepareData(removeEmpty(newData || {})),
      prepareData(removeEmpty(prevData || {}))
    ])
  }
}

Audit.Action = {CREATE: 'Создание', UPDATE: 'Обновление', DELETE: 'Удаление'}