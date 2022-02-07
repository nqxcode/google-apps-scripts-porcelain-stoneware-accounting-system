let Audit = function (section) {  
  this.section = section

  function normalizeObject(object, includeProps) {
    let result = {}    

    object = object || {}

    Object.keys(object).forEach(propertyKey => {
      let propertyValue = object[propertyKey]

      if (includeProps.length > 0 && !includeProps.includes(propertyKey)) {
        return
      }

      result[propertyKey] = (propertyValue || propertyValue === 0) ? String(propertyValue) : null
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

  this.makePayload = function (options) {
    let row = options.row ? `#${options.row}` : null
    let orderNumber = getOrderNumber(options)

    let trackingProps = Audit.getTrackingProps()

    let novel = options.novel ? normalizeObject(options.novel, trackingProps) : null
    let prev = options.prev ? normalizeObject(options.prev, trackingProps) : null
    let diff = novel && prev ? diffObjects(novel, prev) : null

    novel = removeEmpty(novel || {})
    prev = removeEmpty(prev || {})

    let comment = options.comment ? options.comment : Audit.comment

    return {
      row: row ? row : '-',
      orderNumber: orderNumber ? escapeValue(orderNumber) : '-',
      novel: prepareData(novel),
      prev: prepareData(prev),
      diff: prepareData(diff),
      comment: comment,
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

    let payload = this.makePayload(options)

    auditSheet.appendRow([
      formatDateTime(new Date()),
      action,
      Session.getActiveUser().getEmail(),
      this.section,
      payload.row,
      payload.orderNumber,
      payload.diff,
      payload.novel,
      payload.prev,
      payload.comment
    ])
  }
}

Audit.comment = null

Audit.withCommenting = function (tag) {
  Audit.comment = tag
}

Audit.withoutCommenting = function () {
  Audit.comment = null
}

Audit.trackingPropsCallable = null

Audit.setTrackingPropsCallable = function(callable) {
  Audit.trackingPropsCallable = callable
}

Audit.trackingProps = null

Audit.getTrackingProps = function() {
    if (Audit.trackingPropsCallable && Audit.trackingProps === null) {
      Audit.trackingProps = Audit.trackingPropsCallable.call(this)       
    }

    return Audit.trackingProps || []
}

Audit.Action = {CREATE: 'Создание', UPDATE: 'Обновление', DELETE: 'Удаление'}