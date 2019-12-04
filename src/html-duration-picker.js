/**
 * @preserve
 * html-duration-picker.js
 *
 * @description Turn an html input box to a duration picker, without jQuery
 * @version 1.0.1
 * @author Chif <nadchif@gmail.com>
 * @license GPL v3
 *
 */

(function(window, document) {
  // The following keys will not be blocked from working within the input field

  const acceptedKeys = [
    'Backspace',
    'ArrowDown',
    'ArrowUp',
    'Tab',
  ];

  // Gets the current select block hhh or mm or ss
  // and selects the entire block

  const selectFocus = (event) => {
    // Get cursor position and select nearest block;
    const cursorPosition = event.target.selectionStart;
    const hourMarker = event.target.value.indexOf(':');
    const minuteMarker = event.target.value.lastIndexOf(':');

    if (hourMarker < 0 || minuteMarker < 0) {
      // Something wrong with the format. just return;
      return;
    }
    // Cursor is in the hours region
    if (cursorPosition < hourMarker) {
      event.target.setAttribute('data-adjustment-mode', 60 * 60);
      event.target.setSelectionRange(0, hourMarker);
      return;
    }
    // Cursor is in the minutes region
    if (cursorPosition > hourMarker && cursorPosition < minuteMarker) {
      event.target.setAttribute('data-adjustment-mode', 60);
      event.target.setSelectionRange(hourMarker + 1, minuteMarker);
      return;
    }
    // Cursor is in the seconds region
    if (cursorPosition > minuteMarker) {
      event.target.setAttribute('data-adjustment-mode', 1);
      event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);
      return;
    }
    event.target.setAttribute('data-adjustment-mode', 'ss');
    event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);
    return;
  };

  // Inserts a formatted value into the input box
  const insertFormatted = (inputBox, secondsValue) => {
    let hours = Math.floor(secondsValue / 3600);
    secondsValue %= 3600;
    let minutes = Math.floor(secondsValue / 60);
    let seconds = secondsValue % 60;
    minutes = String(minutes).padStart(2, '0');
    hours = String(hours).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    inputBox.value = hours + ':' + minutes + ':' + seconds;
  };
  const highlightIncrementArea = (inputBox, adjustmentFactor) => {
    const hourMarker = inputBox.value.indexOf(':');
    const minuteMarker = inputBox.value.lastIndexOf(':');
    inputBox.focus();
    inputBox.select();
    if (adjustmentFactor >= 60 * 60) {
      inputBox.selectionStart = 0; // Hours mode
      inputBox.selectionEnd = hourMarker;
      return;
    }
    if (adjustmentFactor >= 60) {
      inputBox.selectionStart = hourMarker + 1; // Minutes mode
      inputBox.selectionEnd = minuteMarker;
      return;
    }
    inputBox.selectionStart = minuteMarker + 1; // Seconds mode
    inputBox.selectionEnd = minuteMarker + 3;
    return;
  };

  // Increase time value;
  const increaseValue = (inputBox) => {
    const rawValue = inputBox.value;
    const sectioned = rawValue.split(':');

    let adjustmentFactor = 1;
    if (Number(inputBox.getAttribute('data-adjustment-mode')) > 0) {
      adjustmentFactor = Number(inputBox.getAttribute('data-adjustment-mode'));
    }
    let secondsValue = 0;
    if (sectioned.length === 3) {
      secondsValue =
        Number(sectioned[2]) +
        Number(sectioned[1] * 60) +
        Number(sectioned[0] * 60 * 60);
    }
    secondsValue += adjustmentFactor;
    insertFormatted(inputBox, secondsValue);
    highlightIncrementArea(inputBox, adjustmentFactor);
  };

  // Decrease time value;
  const decreaseValue = (inputBox) => {
    const rawValue = inputBox.value;
    const sectioned = rawValue.split(':');
    let adjustmentFactor = 1;
    if (Number(inputBox.getAttribute('data-adjustment-mode')) > 0) {
      adjustmentFactor = Number(inputBox.getAttribute('data-adjustment-mode'));
    }
    let secondsValue = 0;
    if (sectioned.length === 3) {
      secondsValue =
        Number(sectioned[2]) +
        Number(sectioned[1] * 60) +
        Number(sectioned[0] * 60 * 60);
    }
    secondsValue -= adjustmentFactor;
    if (secondsValue < 0) {
      secondsValue = 0;
    }
    insertFormatted(inputBox, secondsValue);
    highlightIncrementArea(inputBox, adjustmentFactor);
  };

  // Validate any input in the box;
  const validateInput = (event) => {
    const sectioned = event.target.value.split(':');
    if (sectioned.length !== 3) {
      event.target.value = '00:00:00'; // Fallback to default
      return;
    }
    if (isNaN(sectioned[0])) {
      sectioned[0] = '00';
    }
    if (isNaN(sectioned[1]) || sectioned[1] < 0) {
      sectioned[1] = '00';
    }
    if (sectioned[1] > 59 || sectioned[1].length > 2) {
      sectioned[1] = '59';
    }
    if (isNaN(sectioned[2]) || sectioned[2] < 0) {
      sectioned[2] = '00';
    }
    if (sectioned[2] > 59 || sectioned[2].length > 2) {
      sectioned[2] = '59';
    }
    event.target.value = sectioned.join(':');
  };

  const handleKeydown = (event) => {
    // Use arrow keys to increase value;
    if (event.key == 'ArrowDown' || event.key == 'ArrowUp') {
      if (event.key == 'ArrowDown') {
        decreaseValue(event.target);
      }
      if (event.key == 'ArrowUp') {
        increaseValue(event.target);
      }
      event.preventDefault(); // Prevent default
    }

    if (isNaN(event.key) && !acceptedKeys.includes(event.key)) {
      event.preventDefault(); // Prevent default
      return false;
    }
  };

  // Ugrading the pickers

  // Listen for document ready
  window.addEventListener('DOMContentLoaded', () => {
    // Select all input fields with the attribute "html-duration-picker"
    document.querySelectorAll('input[html-duration-picker]').forEach((picker) => {
      // Set default text and Apply some basic styling to the picker
      if (picker.getAttribute('data-upgraded') == 'true') {
        return; // In case some developer calls this or includes it twice
      }

      const totalPickerWidth = picker.offsetWidth;
      picker.setAttribute('data-upgraded', true);
      picker.value = '00:00:00';
      picker.style.textAlign = 'right';
      picker.style.width = `${totalPickerWidth}px`;
      picker.style.margin = 0;
      picker.style.paddingRight = '20px';
      picker.style.cursor = 'text';
      picker.setAttribute('aria-label', 'Duration Picker');
      picker.addEventListener('keydown', handleKeydown);
      picker.addEventListener('select', selectFocus); // Selects a block of hours, minutes etc
      picker.addEventListener('mouseup', selectFocus); // Selects a block of hours, minutes etc
      picker.addEventListener('change', validateInput);
      picker.addEventListener('blur', validateInput);
      picker.addEventListener('keyup', validateInput);
      picker.addEventListener('drop', (event) => event.preventDefault());


      // These are the carets in the buttons.
      // Can be replaced by images/font icons or text

      const caretUp = document.createElement('div');
      const caretDown = document.createElement('div');

      caretUp.setAttribute('style', `width:0;height:0;
      border-style:solid;border-width:0 4px 5px 4px; border-color:transparent transparent #000 transparent`);
      caretDown.setAttribute('style', `width:0;height:0;
      border-style:solid;border-width:5px 4px 0 4px; border-color:#000 transparent transparent transparent`);

      // These are action buttons for scrolling values up or down
      const scrollUpBtn = document.createElement('button');
      const scrollDownBtn = document.createElement('button');
      const scrollButtons = [scrollUpBtn, scrollDownBtn];

      scrollUpBtn.setAttribute('aria-label', 'Increase duration');
      scrollDownBtn.setAttribute('aria-label', 'Decrease duration');

      scrollUpBtn.setAttribute('style', `text-align:center; width: 16px;padding: 0px 4px; border:none;
      height:${(picker.offsetHeight/2)-1}px !important; position:absolute; top: 1px;`);
      scrollDownBtn.setAttribute('style', `text-align:center; width: 16px;padding: 0px 4px; border:none;
      height:${(picker.offsetHeight/2)-1}px !important; position:absolute; top: ${(picker.offsetHeight/2)}px;`);

      // Insert carets into buttons
      scrollDownBtn.appendChild(caretDown);
      scrollUpBtn.appendChild(caretUp);

      // Add event listeners to buttons
      let intervalId;

      scrollButtons.forEach((btn) => {
        btn.addEventListener('mousedown', (event) => {
          event.preventDefault();
          if (btn == scrollUpBtn) {
            increaseValue(picker);
            intervalId = setInterval(increaseValue, 200, picker);
          } else {
            decreaseValue(picker);
            intervalId = setInterval(decreaseValue, 200, picker);
          }
        });

        btn.addEventListener('mouseup', (event) => {
          clearInterval(intervalId);
        });

        btn.addEventListener('mouseleave', (event) => {
          clearInterval(intervalId);
        });
      });

      // This div houses the increase/decrease buttons
      const controlsDiv = document.createElement('div');

      controlsDiv.setAttribute('style', `display:inline-block; position: absolute;top:0px;right: 18px;
      height:${picker.offsetHeight}px; padding:2px 0`);

      // Add buttons to controls div;
      controlsDiv.appendChild(scrollUpBtn);
      controlsDiv.appendChild(scrollDownBtn);

      // This div wraps around existing input, then appends control div
      const controlWrapper = document.createElement('div');
      controlWrapper.style.padding = '0px';
      controlWrapper.style.display = 'inline-block';
      controlWrapper.style.background = 'transparent';
      controlWrapper.style.width = `${totalPickerWidth}px`;
      controlWrapper.style.position = 'relative';

      controlWrapper.appendChild(controlsDiv);
      picker.parentNode.insertBefore(controlWrapper, picker);
      controlWrapper.appendChild(picker);
      return;
    });
  });
})(window, document);
