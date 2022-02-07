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

  this.getRow = function (orderObject) {
    switch (this.section) {
      case sheetNames.assemblies:
        return getAssemblyRowByIndex(orderObject.order_index);
      case sheetNames.shipments:
        return getShipmentRowByIndex(orderObject.order_index)
      case sheetNames.free:
        return getFreeRowByIndex(orderObject.order_index)
    }
  }

  this.copy = function (orderObject) {
    let rowObject = {
      ...{
        date: formatDateTime(new Date()),
        user: Session.getActiveUser().getEmail(),
        section: this.section,
        row: this.getRow(orderObject)
      },
      ...escapeObjectProps(orderObject)
    }

    trashSheet.appendRow(objectToRow(rowObject))
  }

  this.put = function(orderObject) {
    if (Trash.enabled) {
      this.copy(orderObject)
    }    

    let orderIndex = orderObject.order_index

    switch (this.section) {
      case sheetNames.assemblies:        
        assembliesSheet.deleteRow(getAssemblyRowByIndex(orderIndex))
        break

      case sheetNames.shipments:
        shipmentsSheet.deleteRow(getShipmentRowByIndex(orderIndex))
        break

      case sheetNames.free:
        freeSheet.deleteRow(getFreeRowByIndex(orderIndex))
        break
    }
}
}

Trash.enabled = true

Trash.withPermanentDeletion = function (callable) {
  try {
    Trash.enabled = false
    callable()
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

Trash.recover = function (orderObject) {
  switch (orderObject.section) {
    case sheetNames.assemblies:
      Audit.withCommenting('Восстановление заказа из корзины: добавление в сборку')
      addAssembly(orderObject)
      break

    case sheetNames.shipments:
      Audit.withCommenting('Восстановление заказа из корзины: добавление в отгрузку')
      addShipment(orderObject)
      break

    case sheetNames.free:
      Audit.withCommenting('Восстановление заказа из корзины: добавление в свободные')
      addFree(orderObject)
      break
  }
}