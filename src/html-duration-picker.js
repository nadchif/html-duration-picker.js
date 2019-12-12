/**
 * @preserve
 * html-duration-picker.js
 *
 * @description Turn an html input box to a duration picker, without jQuery
 * @version [AIV]{version}[/AIV]
 * @author Chif <nadchif@gmail.com>
 * @license GPL-3.0
 *
 */

export default (function() {
  // Gets the time interval (hh or mm or ss) and selects the entire block
  const selectFocus = (event) => {
    // Gets the cursor position and select the nearest time interval
    const cursorPosition = event.target.selectionStart;
    const hourMarker = event.target.value.indexOf(':');
    const minuteMarker = event.target.value.lastIndexOf(':');

    // Something is wrong with the duration format.
    if (hourMarker < 0 || minuteMarker < 0) {
      return;
    }
    // The cursor selection is: hours
    if (cursorPosition < hourMarker) {
      event.target.setAttribute('data-adjustment-mode', 60 * 60);
      event.target.setSelectionRange(0, hourMarker);
      return;
    }
    // The cursor selection is: minutes
    if (cursorPosition > hourMarker && cursorPosition < minuteMarker) {
      event.target.setAttribute('data-adjustment-mode', 60);
      event.target.setSelectionRange(hourMarker + 1, minuteMarker);
      return;
    }
    // The cursor selection is: seconds
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
    const hours = Math.floor(secondsValue / 3600);
    secondsValue %= 3600;
    const minutes = Math.floor(secondsValue / 60);
    const seconds = secondsValue % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    inputBox.value = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };
  const highlightIncrementArea = (inputBox, adjustmentFactor) => {
    const hourMarker = inputBox.value.indexOf(':');
    const minuteMarker = inputBox.value.lastIndexOf(':');
    inputBox.focus();
    inputBox.select();
    if (adjustmentFactor >= 60 * 60) {
      inputBox.selectionStart = 0; // hours mode
      inputBox.selectionEnd = hourMarker;
      return;
    }
    if (adjustmentFactor >= 60) {
      inputBox.selectionStart = hourMarker + 1; // minutes mode
      inputBox.selectionEnd = minuteMarker;
      return;
    }
    inputBox.selectionStart = minuteMarker + 1; // seconds mode
    inputBox.selectionEnd = minuteMarker + 3;
    return;
  };
    // gets the adjustment factor for a picker
  const getAdjustmentFactor = (picker) => {
    let adjustmentFactor = 1;
    if (Number(picker.getAttribute('data-adjustment-mode')) > 0) {
      adjustmentFactor = Number(picker.getAttribute('data-adjustment-mode'));
    }
    return adjustmentFactor;
  };

  // Change the time value;
  const changeValue = (inputBox, direction) => {
    const rawValue = inputBox.value;
    const sectioned = rawValue.split(':');
    const adjustmentFactor = getAdjustmentFactor(inputBox);
    let secondsValue = 0;
    if (sectioned.length === 3) {
      secondsValue = Number(sectioned[2]) + Number(sectioned[1] * 60) + Number(sectioned[0] * 60 * 60);
    }
    switch (direction) {
      case 'up':
        secondsValue += adjustmentFactor;
        break;
      case 'down':
        secondsValue -= adjustmentFactor;
        if (secondsValue < 0) {
          secondsValue = 0;
        }
        break;
    }
    insertFormatted(inputBox, secondsValue);
    highlightIncrementArea(inputBox, adjustmentFactor);
  };

  // shift focus from one unit to another;
  const shiftFocus = (inputBox, toSide) => {
    const adjustmentFactor = getAdjustmentFactor(inputBox);
    switch (toSide) {
      case 'left':
        highlightIncrementArea(inputBox, adjustmentFactor * 60);
        break;
      case 'right':
        highlightIncrementArea(inputBox, adjustmentFactor / 60);
        break;
    }
  };

  // Check data-duration for proper format
  const checkDuration = (selector) => {
    const regex = RegExp('^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$');
    const testResult = regex.test(selector.dataset.duration);
    return testResult;
  };

  // validate any input in the box;
  const validateInput = (event) => {
    const sectioned = event.target.value.split(':');
    if (event.target.dataset.duration && checkDuration(event.target) && sectioned.length !== 3) {
      event.target.value = event.target.dataset.duration; // fallback to data-duration value
      return;
    }
    if (sectioned.length !== 3) {
      event.target.value = '00:00:00'; // fallback to default
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
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      switch (event.key) {
        // use up and down arrow keys to increase value;
        case 'ArrowDown':
          changeValue(event.target, 'down');
          break;
        case 'ArrowUp':
          changeValue(event.target, 'up');
          break;
        // use left and right arrow keys to shift focus;
        case 'ArrowLeft':
          shiftFocus(event.target, 'left');
          break;
        case 'ArrowRight':
          shiftFocus(event.target, 'right');
          break;
      }
      event.preventDefault();
    }

    // The following keys will be accepted when the input field is selected
    const acceptedKeys = ['Backspace', 'ArrowDown', 'ArrowUp', 'Tab'];
    if (isNaN(event.key) && !acceptedKeys.includes(event.key)) {
      event.preventDefault();
      return false;
    }
  };

  const _init = () => {
    // Select all of the input fields with the attribute "html-duration-picker"
    const getInputFields = document.querySelectorAll('input.html-duration-picker');
    getInputFields.forEach((picker) => {
    // Set the default text and apply some basic styling to the duration picker
      if (picker.getAttribute('data-upgraded') == 'true') {
        return; // in case some developer calls this or includes it twice
      }
      const currentPickerStyle = picker.currentStyle || window.getComputedStyle(picker);
      const pickerRightMargin = currentPickerStyle.marginRight;
      const pickerLeftMargin = currentPickerStyle.marginLeft;
      const totalPickerWidth = currentPickerStyle.width;
      picker.setAttribute('data-upgraded', true);
      picker.value = picker.dataset.duration && checkDuration(picker) ? picker.dataset.duration : '00:00:00';
      picker.style.textAlign = 'right';
      picker.style.paddingRight = '20px';
      picker.style.boxSizing = 'border-box';
      picker.style.width = '100%';
      picker.style.margin = 0;
      picker.style.cursor = 'text';
      picker.setAttribute('aria-label', 'Duration Picker');
      picker.addEventListener('keydown', handleKeydown);
      picker.addEventListener('select', selectFocus); // selects a block of hours, minutes etc
      picker.addEventListener('mouseup', selectFocus); // selects a block of hours, minutes etc
      picker.addEventListener('change', validateInput);
      picker.addEventListener('blur', validateInput);
      picker.addEventListener('keyup', validateInput);
      picker.addEventListener('drop', (event) => event.preventDefault());

      // Create the up and down buttons
      const scrollUpBtn = document.createElement('button');
      const scrollDownBtn = document.createElement('button');
      const scrollButtons = [scrollUpBtn, scrollDownBtn];

      scrollUpBtn.setAttribute('aria-label', 'Increase duration');
      scrollUpBtn.setAttribute('style', `text-align:center; width: 16px;padding: 0px 4px; border:none; cursor:default;
        height:${(picker.offsetHeight/2)-1}px !important; position:absolute; top: 1px;`);
      scrollDownBtn.setAttribute('aria-label', 'Decrease duration');
      scrollDownBtn.setAttribute('style', `text-align:center; width: 16px;padding: 0px 4px; border:none; cursor:default; 
        height:${(picker.offsetHeight/2)-1}px !important; position:absolute; top: ${(picker.offsetHeight/2)-1}px;`);

      // Create the carets in the buttons. These can be replaced by images, font icons, or text.
      const caretUp = document.createElement('div');
      const caretDown = document.createElement('div');
      caretUp.setAttribute('style', `width:0;height:0;
        border-style:solid;border-width:0 4px 5px 4px; border-color:transparent transparent #000 transparent`);
      caretDown.setAttribute('style', `width:0;height:0;
        border-style:solid;border-width:5px 4px 0 4px; border-color:#000 transparent transparent transparent`);
      // Insert the carets into the up and down buttons
      scrollDownBtn.appendChild(caretDown);
      scrollUpBtn.appendChild(caretUp);

      // Add event listeners to buttons
      scrollButtons.forEach((btn) => {
        let intervalId;
        btn.addEventListener('mousedown', (event) => {
          event.preventDefault();
          if (btn == scrollUpBtn) {
            changeValue(picker, 'up');
            intervalId = setInterval(changeValue, 200, picker, 'up');
          } else {
            changeValue(picker, 'down');
            intervalId = setInterval(changeValue, 200, picker, 'down');
          }
        });
        btn.addEventListener('mouseup', () => clearInterval(intervalId));
        btn.addEventListener('mouseleave', () => clearInterval(intervalId));
      });

      // this div houses the increase/decrease buttons
      const controlsDiv = document.createElement('div');
      controlsDiv.setAttribute('style', `display:inline-block; position: absolute;top:1px;left: ${parseFloat(totalPickerWidth) - 20}px;
        height:${picker.offsetHeight}px; padding:2px 0`);

      // Add buttons to controls div
      controlsDiv.appendChild(scrollUpBtn);
      controlsDiv.appendChild(scrollDownBtn);

      // this div wraps around existing input, then appends control div
      const controlWrapper = document.createElement('div');
      controlWrapper.setAttribute('style', `display: inline-block; position: relative; background: transparent; 
        padding: 0px; width: ${totalPickerWidth}; margin-left: ${pickerLeftMargin}; margin-right: ${pickerRightMargin};`);

      picker.parentNode.insertBefore(controlWrapper, picker);
      controlWrapper.appendChild(picker);
      controlWrapper.appendChild(controlsDiv);
      return;
    });
    return true;
  };

  window.addEventListener('DOMContentLoaded', () => _init());
  return {
    init: _init,
    refresh: _init,
  };
})();
