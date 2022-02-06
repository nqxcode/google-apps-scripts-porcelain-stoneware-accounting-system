let Trash = function (section) {
  this.section = section

  function objectToRow(object) {
    let result = []
    let columnsMap = Trash.getColumnsMap()

    columnsMap.forEach(function (column) {
      result.push(object[column] || '')
    })

    return result
  }

  this.put = function (orderObject) {
    if (!Trash.enabled) {
      return
    }

    let rowObject = {
      ...{
        date: formatDateTime(new Date()),
        user: Session.getActiveUser().getEmail(),
        section: this.section,
        row: getAssemblyRowByIndex(orderObject.order_index)
      },
      ...escapeObjectProps(orderObject)
    }

    trashSheet.appendRow(objectToRow(rowObject))
  }

  this.recover = function (orderObject) {
    // TODO realize recover
  }
}

Trash.enabled = true

Trash.withoutPuttingToTrash = function (callable) {
  try {
    Trash.enabled = false
    callable()
  } catch (Error) {
    throw Error
  } finally {
    Trash.enabled = true
  }
}

Trash.getColumnsMap = function () {
  let columnsMap = []

  columnsMap[1] = 'date'
  columnsMap[2] = 'user'
  columnsMap[3] = 'section'
  columnsMap[4] = 'row'
  columnsMap[5] = 'date_of_adoption'
  columnsMap[6] = 'order_number'
  columnsMap[7] = 'diameter'
  columnsMap[8] = 'length_min'
  columnsMap[9] = 'length_max'
  columnsMap[10] = 'width'
  columnsMap[11] = 'stone_shape'
  columnsMap[12] = 'stone_color'
  columnsMap[13] = 'shipped'
  columnsMap[14] = 'packed'
  columnsMap[15] = 'comment'
  columnsMap[16] = 'with_worktop'

  return columnsMap;
}