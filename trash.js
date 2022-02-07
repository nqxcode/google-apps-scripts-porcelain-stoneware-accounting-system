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
  try {
    let trashItem = findTrashItem(orderIndex);
    if (trashItem) {
      Audit.withCommenting('Восстановление заказа из корзины: добавление в соответствующий раздел')
      Trash.recover(trashItem)

      Audit.withCommenting('Восстановление заказа из корзины: удаление из корзины')
      removeTrashItem(orderIndex)
    }
  } finally {
    Audit.withoutCommenting()
  }
}

function removeOrder(orderIndex) {
  try {
    let trashItem = findTrashItem(orderIndex);
    if (trashItem) {
      Audit.withCommenting('Безвозвратное удаление заказа из корзины')
      removeTrashItem(orderIndex)
    }
  } finally {
    Audit.withoutCommenting()
  }
}

function findTrashItem(orderIndex) {
  let trashItems = getTrash()
  let trashItem = trashItems[orderIndex] || null

  return trashItem
}

function getTrashRowByIndex(orderIndex) {
  return getTrashOffset() + orderIndex
}

function removeTrashItem(orderIndex) {
  let trashItem = findTrashItem(orderIndex)
  if (trashItem) {
    trashSheet.deleteRow(getTrashRowByIndex(trashItem.order_index))
    audit.trash.log(Audit.Action.DELETE, {prev: trashItem, row: getTrashRowByIndex(orderIndex)})
  }
}