/**
* @description Sets elements' backgroud color
* @param {object} elem Element to work on
*/
function toggleColor(elem) {
  const COLOR = $('#colorPicker').val();
  elem.css('background-color', COLOR);
}

/**
* @description Creates a table grid
* @param {number} height Height of the grid
* @param {number} width Wodth of the grid
*/
function makeGrid(height, width) {
  let table = $('#pixel_canvas');
  // clear the table
  table.children().remove();

  // build the grid
  let tbody = $('<tbody></tbody>');
  for (let r = 0; r < height; ++r) {
    let row = $('<tr></tr>');
    for (let c = 0; c < width; ++c) {
      row.append($('<td></td>'));
    }
    tbody.append(row);
    table.append(tbody);
  }
}

/**
* @description Creates a grid according to sizes
*/
$('#sizePicker').submit(function(evt) {
  makeGrid($('#input_height').val(), $('#input_width').val());
  evt.preventDefault();
})

// Track mouse state for continuous movement processing
let mouseState = null;

/**
* @description Processes continuous mouse movement on the canvas
*/
$('#pixel_canvas').on('mousedown mouseup mousemove', 'td', function(evt) {
  if (evt.type === 'mousemove' && mouseState === 'mousedown') {
    toggleColor($(this));
  } else if (evt.type === 'mouseup') {
    mouseState = 'mouseup';
  } else if (evt.type === 'mousedown') {
    mouseState = 'mousedown';
  }
})

/**
* @description Processes mouse clicks on the canvas
*/
$('#pixel_canvas').on('click', 'td', function(evt) {
  mouseState = null;
  toggleColor($(this));
})
