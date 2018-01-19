/**
* @description Sets elements' backgroud color
* @param {object} elem Element to work on
*/
function toggleColor(elem) {
  const color = $('#colorPicker').val();
  elem.css('background-color', color);
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
      row.append($('<td class="grid-item"></td>'));
    }
    tbody.append(row);
    table.append(tbody);
  }
}

/**
* @description Converts rgb[a] color to hex color
* @param {number} color rgb color
* @return hex color
*/
function colorToHex(color) {
  var ctx = document.createElement('canvas').getContext('2d');
  ctx.strokeStyle = color;
  return ctx.strokeStyle;
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
// Track pipette selection
let pipetteActive = null;

/**
* @description Processes continuous mouse movement on the canvas
*/
$('#pixel_canvas').on('mousedown mouseup mousemove', 'td', function(evt) {
  if (pipetteActive) {
    return;
  }
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
  if (pipetteActive) {
    let color = $(this).css('background-color');
    let hexColor = colorToHex(color);
    $('#colorPicker').val(hexColor);
    $('#colorPicker').change();
  } else {
    mouseState = null;
    toggleColor($(this));
  }
})

/**
* @description Drops painting state
  when release mouse button outside canvas
*/
$('body').on('mouseup', function(evt) {
  mouseState = null;
})

/**
* @description Drops painting state
  when mouse seizes/drags underlying element
*/
$('#pixel_canvas').on('pointercancel', 'td', function(evt) {
  mouseState = null;
})

/**
* @description Handles color change on a simulated color-picker
*/
$('#colorPicker').on('change', function(evt) {
  $(this).parent().css('background-color', $(this).val());
})

/**
* @description Enables color picker (pipette tool)
*/
$('#pipette').click(function(evt) {
  $(this).parent().toggleClass('pressed')
  pipetteActive = true;
  document.body.style.cursor = 'pointer';
  evt.stopPropagation();
})

/**
* @description Disables color picker (pipette tool)
*/
$('body').click(function(evt) {
  if (pipetteActive) {
    $('#pipette').parent().toggleClass('pressed')
    pipetteActive = false;
    document.body.style.cursor = 'auto';
  }
})

// Set initial color
$('#colorPicker').val('#0000FF');
$('#colorPicker').change();
