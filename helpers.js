function formatDate(date) {    
  let dateObj = new Date(date)
  let formattedDate = null

  if (!!dateObj.getDate()) {
    let year = dateObj.getFullYear()
    let month = ("0" + (dateObj.getMonth() + 1)).slice(-2)
    let date = ("0" + dateObj.getDate()).slice(-2)
    
    formattedDate = `${year}-${month}-${date}`;
  }  

  return formattedDate
}

function prepareOrderNumber(orderNumber)
{
  return orderNumber ? ("'" + orderNumber) : undefined
}