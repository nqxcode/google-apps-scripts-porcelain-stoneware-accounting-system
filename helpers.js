function formatDate(date, options) {    
  let defaultOptions = {withTime: false}

  options = options || {}
  options = {...defaultOptions, ...options}

  let dateObj = new Date(date)
  let formattedDate = null

  if (!!dateObj.getDate()) {
    let year = dateObj.getFullYear()
    let month = ("0" + (dateObj.getMonth() + 1)).slice(-2)
    let date = ("0" + dateObj.getDate()).slice(-2)
    
    formattedDate = `${year}-${month}-${date}`;

    if (options.withTime) {
        var hours = dateObj.getHours();
        var minutes = dateObj.getMinutes();
        var seconds = dateObj.getSeconds();

        formattedDate = `${formattedDate} ${hours}:${minutes}:${seconds}`
    }
  }  

  return formattedDate
}

function formatDateTime(date) {
  return formatDate(date, {withTime: true})
}

function escapeObjectProps(object) {
  let preparedObject = {};

  Object.keys(object).forEach(key => {
    preparedObject[key] = escapeValue(object[key])
  })

  return preparedObject
}

function escapeValue(value)
{
  if (value) {
    if (!String(value).startsWith("'")) {
     return "'" + value
    }
  }

  return null
}