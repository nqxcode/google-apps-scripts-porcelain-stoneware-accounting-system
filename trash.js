function getTrashOffset() {
  return 3
}

function getTrashStringified() {
  let orders = getTrash()

  return JSON.stringify(orders)
}

function getTrash() {
  let data = trashSheet
      .getRange(getTrashOffset(), 1, trashSheet.getLastRow(), 16)
      .getValues()
      .filter(filterEmptyRow)
      .map((trashItem, trashItemIndex) => prepareTrashItem(trashItem, trashItemIndex))

  return data
}

function prepareTrashItem(trashItemData, trashIndex) {
  let trashItemObj = {}

  trashItemObj.order_index = trashIndex;

  Trash.getColumnsMap().forEach((field, column) => {
    let value = trashItemData[column - 1];
    if (value !== undefined) {
      if (field === 'date_of_adoption') {
        value = formatDate(value)

      } else if (field === 'date') {
        value = formatDateTime(value)
      }

      trashItemObj[field] = value
    }
  })

  return trashItemObj
}


function recoverOrder(orderIndex) {
  let trashItem = findTrashItem(orderIndex);
  if (trashItem) {
    Trash.recover(trashItem)
  }
}

function findTrashItem(orderIndex) {
  let trashItems = getTrash()
  let trashItem = trashItems[orderIndex] || null

  return trashItem
}