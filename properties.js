let stoneColors = getStoneColors()
let stoneShapes = getStoneShapes()

function getPropertyRowOffset() {
  return 4
}

function getColorColumnOffset()
{
  return 1
}

function getShapeColumnOffset()
{
  return 2
}

function getStoneColors()
{    
  return propertiesSheet
    .getRange(getPropertyRowOffset(), getColorColumnOffset(), propertiesSheet.getLastRow())
    .getValues()
    .filter(filterEmptyRow)
    .map(v => v[0])
}

function getStoneShapes()
{    
  return propertiesSheet
    .getRange(getPropertyRowOffset(), getShapeColumnOffset(), propertiesSheet.getLastRow())
    .getValues()
    .filter(filterEmptyRow)
    .map(v => v[0])
}

function getStoneColorsStringified() {
  return JSON.stringify(stoneColors)
}

function getStoneShapesStringified() {
  return JSON.stringify(stoneShapes)
}

function addStoneColor(formObj) {
  if(formObj.stone_color && !checkColorUnique(formObj.stone_color)) {
    return false
  }

  propertiesSheet.appendRow([formObj.stone_color]);

  audit.properties.log(Audit.Action.CREATE, {novel: {stone_color: formObj.stone_color}, row: propertiesSheet.getLastRow()})

  return true
}

function checkColorUnique(colorName) {
  let colorRow = findColorRow(colorName)

  return colorRow === null
}

function findColorRow(colorName) {
  let colors = getStoneColors()  

  for(colorIndex = 0; colorIndex < colors.length; colorIndex++) {
    if (colors[colorIndex] == colorName) {
      return getPropertyRowOffset() + colorIndex
    }
  }

  return null
}

function getColorRowByIndex(colorIndex) 
{
  return getPropertyRowOffset() + colorIndex
}

function checkShapeUnique(shapeName) {
  let shapeRow = findShapeRow(shapeName)

  return shapeRow === null
}

function findShapeRow(shapeName) {
  let shapes = getStoneShapes()  

  for(shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
    if (shapes[shapeIndex] == shapeName) {
      return getPropertyRowOffset() + shapeIndex
    }
  }

  return null
}

function getShapeRowByIndex(shapeIndex) 
{
  return getPropertyRowOffset() + shapeIndex
}

function removeStoneColor(colorIndex) {
  let _stoneColors = stoneColors.slice() // copy array

  let deleted = _stoneColors.splice(colorIndex, 1); // remove by index
  let deletedIndex = colorIndex

  for (colorIndex = 0; colorIndex <= stoneColors.length; colorIndex++) {
    let colorRow = getColorRowByIndex(colorIndex)
    propertiesSheet.getRange(colorRow, getColorColumnOffset()).setValue('');       
  }

  for (colorIndex = 0; colorIndex <= _stoneColors.length; colorIndex++) {
    let colorRow = getColorRowByIndex(colorIndex)
    propertiesSheet.getRange(colorRow, getColorColumnOffset()).setValue(_stoneColors[colorIndex]);       
  }

  audit.properties.log(Audit.Action.DELETE, {prev: {stone_color: deleted}, row: getPropertyRowOffset() + deletedIndex})
}

function addStoneShape(shapeData)
{
  if(shapeData.stone_shape && !checkShapeUnique(shapeData.stone_shape)) {
    return false
  }

  let shapeRow = getShapeRowByIndex(stoneShapes.length)
  propertiesSheet.getRange(shapeRow, getShapeColumnOffset()).setValue(shapeData.stone_shape);  

  audit.properties.log(Audit.Action.CREATE, {novel: {stone_shape: shapeData.stone_shape}, row: shapeRow})

  return true
}

function removeStoneShape(shapeIndex)
{
  let _stoneShapes = stoneShapes.slice() // copy array
  
  let deleted = _stoneShapes.splice(shapeIndex, 1); // remove by index
  let deletedIndex = shapeIndex

  for (shapeIndex = 0; shapeIndex <= stoneShapes.length; shapeIndex++) {
    let shapeRow = getShapeRowByIndex(shapeIndex)
    propertiesSheet.getRange(shapeRow, getShapeColumnOffset()).setValue('');       
  }

  for (shapeIndex = 0; shapeIndex <= _stoneShapes.length; shapeIndex++) {
    let shapeRow = getShapeRowByIndex(shapeIndex)
    propertiesSheet.getRange(shapeRow, getShapeColumnOffset()).setValue(_stoneShapes[shapeIndex]);       
  }

  audit.properties.log(Audit.Action.DELETE, {prev: {stone_shape: deleted}, row: getPropertyRowOffset() + deletedIndex})
}

