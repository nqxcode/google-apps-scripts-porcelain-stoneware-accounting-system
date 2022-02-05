let Audit = function (section) {
  this.section = section
  function filterObject(object) {
    let result = {}

    object = object || {}

    Object.keys(object).forEach(propertyKey => {
        let propertyValue = object[propertyKey]
        if (typeof propertyValue === 'object' || Array.isArray(propertyValue)) {
          return
        }

        result[propertyKey] = propertyValue
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

  function humanizeObject(object) {
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

    return keyValueList.join("\n")
  }

  function prepareObject(object) {
    return objectToString(humanizeObject(filterObject(object)))
  }

  this.log = function (action, options) {
    options = options || {}

    let newData = options.new ? prepareObject(options.new) : null
    let prevData = options.prev ? prepareObject(options.prev) : null
    let diffData = newData && prevData ? diffObjects(newData, prevData) : null

    auditSheet.appendRow([
      formatDateTime(new Date()),
      action,
      Session.getActiveUser().getEmail(),
      this.section,
      diffData ? diffData : '-',
      newData ? diffData : '-',
      prevData ? prevData : '-',
    ])
  }
}

Audit.Action = {CREATE: 'Создание', UPDATE: 'Обновление', DELETE: 'Удаление'}