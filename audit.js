function Audit (section) {
  this.section = section
  this.Actions = {CREATE: 'Создание', UPDATE: 'Обновление', DELETE: 'Удаление', MOVE: 'Перемещение'}

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
    //return JSON.stringify(humanizeObject(object))
    return objectToString(humanizeObject(object))
  }

  this.log = function (action, newData, prevData) {
    newData = filterObject(newData)
    prevData = filterObject(prevData)
    let diffData = diffObjects(newData, prevData)

    auditSheet.appendRow([
      formatDateTime(new Date()),
      action,
      'User1',
      this.section,
      prepareObject(diffData),
      prepareObject(newData),
      prepareObject(prevData)
    ])
  }
  
}