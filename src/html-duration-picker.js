/* global PICKER_STYLES_CSS_CONTENTS */

/**
 * @preserve
 * html-duration-picker.js
 *
 * @description Turn an html input box to a duration picker, without jQuery
 * @version [AIV]{version}[/AIV]
 * @author Chif <nadchif@gmail.com>
 * @license Apache-2.0
 *
 */

export default (function () {
  // IE9+ support forEach:
  if (window.NodeList && !window.NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  /*
  DO NOT CHANGE THE LINE BELOW. IT IS REQUIRED TO INSERT STYLES FROM 'style.css'
  */
  const pickerStyles = PICKER_STYLES_CSS_CONTENTS;
  /*
  DO NOT CHANGE THE LINE ABOVE. IT IS REQUIRED TO INSERT STYLES FROM 'style.css'
  */

  /**
   * Get current cursor selection
   * @param {Event} event
   * @param {Boolean} hideSeconds - should this picker show seconds or not
   * @return {{cursorSelection: 'hours' | 'minutes' | 'seconds', hideSeconds: Boolean, hourMarker: Number, minuteMarker: Number}}
   */

  const getCursorSelection = (event, hideSeconds) => {
    const {
      target: {selectionStart, value},
    } = event;
    const hourMarker = value.indexOf(':');
    const minuteMarker = value.lastIndexOf(':');
    let cursorSelection;

    // The cursor selection is: hours
    if (selectionStart <= hourMarker) {
      cursorSelection = 'hours';
    } else if (hideSeconds || selectionStart <= minuteMarker) {
      // The cursor selection is: minutes
      cursorSelection = 'minutes';
    } else if (!hideSeconds && selectionStart > minuteMarker) {
      // The cursor selection is: seconds
      cursorSelection = 'seconds';
    }
    return {cursorSelection, hideSeconds, hourMarker, minuteMarker};
  };

  /**
   * Set the 'data-adjustment-factor' attribute for a picker
   * @param {*} inputBox
   * @param {3600 | 60 | 1} adjustmentFactor
   */
  const updateActiveAdjustmentFactor = (inputBox, adjustmentFactor) => {
    inputBox.setAttribute('data-adjustment-factor', adjustmentFactor);
  };

  /**
   * Gets the position of the cursor after a click event, then matches to
   * time interval (hh or mm or ss) and selects (highlights) the entire block
   * @param {Event} event - focus/click event
   * @return {void}
   */
  const focusFullTimeUnitArea = (event) => {
    const inputBox = event.target;
    const hideSeconds = shouldHideSeconds(inputBox);
    // Gets the cursor position and select the nearest time interval
    const {cursorSelection, hourMarker, minuteMarker} = getCursorSelection(event, hideSeconds);

    // Something is wrong with the duration format.
    if (!cursorSelection) {
      return;
    }
    const cursorAdjustmentFactor = hideSeconds ? 3 : 0;
    switch (cursorSelection) {
      case 'hours':
        updateActiveAdjustmentFactor(inputBox, 3600);
        event.target.setSelectionRange(0, hourMarker);
        return;
      case 'minutes':
        updateActiveAdjustmentFactor(inputBox, 60);
        event.target.setSelectionRange(hourMarker + 1, minuteMarker + cursorAdjustmentFactor);
        return;
      case 'seconds':
        updateActiveAdjustmentFactor(inputBox, 1);
        event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);
        return;
      default:
        updateActiveAdjustmentFactor(inputBox, 1);
        event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);
        return;
    }
  };

  /**
   * Get whether the picker passed must hide seconds
   * @param {*} inputBox
   * @return {Boolean}
   */
  const shouldHideSeconds = (inputBox) => {
    return inputBox.dataset.hideSeconds !== undefined && inputBox.dataset.hideSeconds !== 'false';
  };

  /**
   * Manually creates and fires an Event
   * @param {*} type
   * @param {*} option - event options
   * @return {Event}
   */
  const createEvent = (type, option = {bubbles: false, cancelable: false}) => {
    if (typeof Event === 'function') {
      return new Event(type);
    } else {
      const event = document.createEvent('Event');
      event.initEvent(type, option.bubbles, option.cancelable);
      return event;
    }
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
    const value = `${formattedHours}:${formattedMinutes}`;

    // Don't use setValue method here because
    // it breaks the arrow keys and arrow buttons control over the input
    inputBox.value = !shouldHideSeconds(inputBox) ? `${value}:${formattedSeconds}` : value;

    // manually trigger an "input" event for other event listeners
    inputBox.dispatchEvent(createEvent('input'));
  };

  /**
   * Highlights/selects the time unit area hh, mm or ss of a picker
   * @param {*} inputBox
   * @param {3600 |60 | 1} adjustmentFactor
   * @param {Boolean} forceInputFocus
   */
  const highlightTimeUnitArea = (inputBox, adjustmentFactor, forceInputFocus = true) => {
    const hourMarker = inputBox.value.indexOf(':');
    const minuteMarker = inputBox.value.lastIndexOf(':');
    const hideSeconds = shouldHideSeconds(inputBox);
    if (forceInputFocus) {
      inputBox.focus();
      inputBox.select();
    }

    if (adjustmentFactor >= 60 * 60) {
      inputBox.selectionStart = 0; // hours mode
      inputBox.selectionEnd = hourMarker;
    } else if (!hideSeconds && adjustmentFactor < 60) {
      inputBox.selectionStart = minuteMarker + 1; // seconds mode
      inputBox.selectionEnd = minuteMarker + 3;
    } else {
      inputBox.selectionStart = hourMarker + 1; // minutes mode
      inputBox.selectionEnd = hourMarker + 3;
      adjustmentFactor = 60;
    }

    if (adjustmentFactor >= 1 && adjustmentFactor <= 3600) {
      inputBox.setAttribute('data-adjustment-factor', adjustmentFactor);
    }
  };
  // gets the adjustment factor for a picker
  const getAdjustmentFactor = (inputBox) => {
    let adjustmentFactor = 1;
    if (Number(inputBox.getAttribute('data-adjustment-factor')) > 0) {
      adjustmentFactor = Number(inputBox.getAttribute('data-adjustment-factor'));
    }
    return adjustmentFactor;
  };

  /**
   * set value for a picker
   * @param {*} inputBox
   * @param {*} value
   */
  const setValue = (inputBox, value) => {
    // This is a "cross-browser" way to set the input value
    // that doesn't cause the cursor jumping to the end of the input on Safari
    inputBox.setAttribute('value', value);
  };

  /**
   * Increases or decreases duration value by up and down arrow keys
   * @param {*} inputBox
   * @param {'up' | 'down'} direction
   */
  const changeValueByArrowKeys = (inputBox, direction) => {
    const adjustmentFactor = getAdjustmentFactor(inputBox);
    let secondsValue = durationToSeconds(inputBox.value);
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
    const constrainedValue = applyMinMaxConstraints(inputBox, secondsValue);
    insertFormatted(inputBox, constrainedValue);
  };

  /**
   * shift focus (text selection) between hh, mm, and ss with left and right arrow keys;
   * @param {*} inputBox
   * @param {'left' | 'right'} direction
   */
  const shiftTimeUnitAreaFocus = (inputBox, direction) => {
    const adjustmentFactor = getAdjustmentFactor(inputBox);
    switch (direction) {
      case 'left':
        highlightTimeUnitArea(inputBox, adjustmentFactor * 60);
        break;
      case 'right':
        highlightTimeUnitArea(inputBox, adjustmentFactor / 60);
        break;
      default:
    }
  };

  /**
   * Checks if a given string value is in valid duration format
   * @param {String} value
   * @param {Boolean} hideSeconds
   * @return {Boolean}
   */
  const isValidDurationFormat = (value, hideSeconds) => {
    const pattern = hideSeconds ? '^[0-9]{2,3}:[0-5][0-9]$' : '^[0-9]{2,3}:[0-5][0-9]:[0-5][0-9]$';
    const regex = RegExp(pattern);
    return regex.test(value);
  };

  /**
   *  Applies a picker's min and max duration constraints to a given value
   * @param {*} inputBox
   * @param {Number} value in seconds
   * @return {void}
   */
  const applyMinMaxConstraints = (inputBox, value) => {
    const {maxDuration, minDuration} = getMinMaxConstraints(inputBox);
    return Math.min(Math.max(value, minDuration), maxDuration);
  };

  /**
   * Converts a given duration string to seconds
   * @param {String} value
   * @return {Number}
   */
  const durationToSeconds = (value) => {
    if (!(isValidDurationFormat(value) || isValidDurationFormat(value, true))) {
      return 0;
    }
    const sectioned = value.split(':');
    if (sectioned.length < 2) {
      return 0;
    } else {
      return Number(sectioned[2] || 0) + Number(sectioned[1] * 60) + Number(sectioned[0] * 60 * 60);
    }
  };

  /**
   * Handles any user input attempts into a picker
   * @param {*} event
   * @return {void}
   */
  const handleUserInput = (event) => {
    const inputBox = event.target;
    const hideSeconds = shouldHideSeconds(inputBox);
    const {cursorSelection} = getCursorSelection(event, hideSeconds);
    const sectioned = inputBox.value.split(':');

    if (
      inputBox.dataset.duration &&
      isValidDurationFormat(inputBox.dataset.duration, hideSeconds) &&
      ((hideSeconds && sectioned.length !== 2) || (!hideSeconds && sectioned.length !== 3))
    ) {
      setValue(inputBox, inputBox.dataset.duration); // fallback to data-duration value
      return;
    }
    if (!hideSeconds && sectioned.length !== 3) {
      setValue(inputBox, '00:00:00'); // fallback to default
      return;
    } else if (hideSeconds && sectioned.length !== 2) {
      setValue(inputBox, '00:00'); // fallback to default
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
    if (
      !hideSeconds &&
      sectioned[1].length === 2 &&
      sectioned[1].slice(-1) === event.key &&
      cursorSelection === 'minutes'
    ) {
      shiftTimeUnitAreaFocus(inputBox, 'right');
    }
    if (!hideSeconds) {
      if (isNaN(sectioned[2]) || sectioned[2] < 0) {
        sectioned[2] = '00';
      }
      if (sectioned[2] > 59 || sectioned[2].length > 2) {
        sectioned[2] = '59';
      }
    }

    setValue(inputBox, sectioned.join(':'));
    const adjustmentFactor = getAdjustmentFactor(inputBox);
    highlightTimeUnitArea(inputBox, adjustmentFactor);
  };

  const insertWithConstraints = (event) => {
    const inputBox = event.target;
    const duration = inputBox.value || inputBox.dataset.duration;
    const secondsValue = durationToSeconds(duration);
    insertFormatted(inputBox, applyMinMaxConstraints(inputBox, secondsValue));
  };

  /**
   * Handles all key down event in the picker. It will also apply validation
   * and block unsupported keys like alphabetic characters
   * @param {*} event
   * @return {void}
   */
  const handleKeydown = (event) => {
    const changeValueKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'];
    if (changeValueKeys.includes(event.key)) {
      switch (event.key) {
        // use up and down arrow keys to increase value;
        case 'ArrowDown':
          changeValueByArrowKeys(event.target, 'down');
          break;
        case 'ArrowUp':
          changeValueByArrowKeys(event.target, 'up');
          break;
        // use left and right arrow keys to shift focus;
        case 'ArrowLeft':
          shiftTimeUnitAreaFocus(event.target, 'left');
          break;
        case 'ArrowRight':
          shiftTimeUnitAreaFocus(event.target, 'right');
          break;
        case 'Enter':
          insertWithConstraints(event);
          event.target.blur();
          break;
        default:
      }
      event.preventDefault();
    }

    // Allow tab to change selection and escape the input
    if (event.key === 'Tab') {
      const preAdjustmentFactor = getAdjustmentFactor(event.target);
      const rightAdjustValue = shouldHideSeconds(event.target) ? 3600 : 60;
      const direction = event.shiftKey ? 'left' : 'right';
      shiftTimeUnitAreaFocus(event.target, direction);
      if (
        (direction === 'left' && preAdjustmentFactor < 3600) ||
        (direction === 'right' && preAdjustmentFactor >= rightAdjustValue)
      ) {
        event.preventDefault();
      }
    }

    // The following keys will be accepted when the input field is selected
    const acceptedKeys = ['Backspace', 'ArrowDown', 'ArrowUp', 'Tab'];
    if (isNaN(event.key) && !acceptedKeys.includes(event.key)) {
      event.preventDefault();
      return false;
    }
  };

  const getDurationAttributeValue = (inputBox, name, defaultValue) => {
    const value = inputBox.dataset[name];
    if (isValidDurationFormat(value, shouldHideSeconds(inputBox))) {
      return durationToSeconds(value);
    } else {
      return defaultValue;
    }
  };

  /**
   * Gets the min and max constraints of a picker
   * @param {*} inputBox
   * @return {{minDuration: string, maxDuration: string}} constraints
   */
  const getMinMaxConstraints = (inputBox) => {
    const minDuration = getDurationAttributeValue(inputBox, 'durationMin', 0);
    const maxDuration = getDurationAttributeValue(inputBox, 'durationMax', Infinity);
    return {
      minDuration,
      maxDuration,
    };
  };

  const getInitialDuration = (inputBox) => {
    const duration = getDurationAttributeValue(inputBox, 'duration', 0);
    const secondsValue = durationToSeconds(duration);
    return applyMinMaxConstraints(inputBox, secondsValue);
  };
  /**
   * Initialize all the pickers
   * @param {Boolean} addCSStoHead  add CSS style sheet to document body
   * @return {void}
   */
  const _init = (addCSStoHead) => {
    // append styles to DOM
    if (addCSStoHead) {
      const head = document.head || document.getElementsByTagName('head')[0];
      const style = document.createElement('style');
      head.appendChild(style);
      style.styleSheet
        ? (style.styleSheet.cssText = pickerStyles) // IE8 and below.
        : style.appendChild(document.createTextNode(pickerStyles));
    }

    // Select all of the input fields with the attribute "html-duration-picker"
    const getInputFields = document.querySelectorAll('input.html-duration-picker');
    getInputFields.forEach((inputBox) => {
      // Set the default text and apply some basic styling to the duration picker
      if (!(inputBox.getAttribute('data-upgraded') == 'true')) {
        const currentInputBoxStyle = inputBox.currentStyle || window.getComputedStyle(inputBox);
        const inputBoxRightMargin = currentInputBoxStyle.marginRight;
        const inputBoxLeftMargin = currentInputBoxStyle.marginLeft;
        const inputBoxRightBorder = parseFloat(currentInputBoxStyle.borderRight);
        const inputBoxLeftBorder = parseFloat(currentInputBoxStyle.borderLeft);
        const inputBoxRightPadding = parseFloat(currentInputBoxStyle.paddingRight);
        const inputBoxLeftPadding = parseFloat(currentInputBoxStyle.paddingLeft);
        let totalInputBoxWidth;
        const currentInputBoxWidth = parseFloat(currentInputBoxStyle.width);
        if (currentInputBoxStyle.boxSizing === 'content-box') {
          totalInputBoxWidth =
            currentInputBoxWidth +
            inputBoxRightBorder +
            inputBoxLeftBorder +
            inputBoxRightPadding +
            inputBoxLeftPadding;
        } else {
          totalInputBoxWidth = currentInputBoxWidth;
        }
        inputBox.setAttribute('data-upgraded', true);
        if (
          !inputBox.value ||
          !isValidDurationFormat(inputBox.value, shouldHideSeconds(inputBox))
        ) {
          insertFormatted(inputBox, getInitialDuration(inputBox));
        }

        inputBox.setAttribute('aria-label', 'Duration Picker');
        inputBox.addEventListener('keydown', handleKeydown);
        inputBox.addEventListener('focus', focusFullTimeUnitArea); // selects a block of hours, minutes etc
        inputBox.addEventListener('mouseup', focusFullTimeUnitArea); // selects a block of hours, minutes etc
        inputBox.addEventListener('change', handleUserInput);
        inputBox.addEventListener('blur', insertWithConstraints);
        inputBox.addEventListener('keyup', handleUserInput);
        inputBox.addEventListener('drop', (event) => event.preventDefault());

        // Create the up and down buttons
        const scrollUpBtn = document.createElement('button');
        const scrollDownBtn = document.createElement('button');
        const scrollButtons = [scrollUpBtn, scrollDownBtn];

        // set css classes
        scrollUpBtn.setAttribute('class', 'scroll-btn');
        scrollDownBtn.setAttribute('class', 'scroll-btn');

        // set button to 'button' to prevent 'submit' action in forms
        scrollUpBtn.setAttribute('type', 'button');
        scrollDownBtn.setAttribute('type', 'button');

        // set aria-labels for accessibility
        scrollUpBtn.setAttribute('aria-label', 'Increase duration');
        scrollDownBtn.setAttribute('aria-label', 'Decrease duration');

        // set inline-styles for positioning
        scrollUpBtn.setAttribute(
          'style',
          `height:${inputBox.offsetHeight / 2 - 1}px !important; top: 1px;`,
        );
        scrollDownBtn.setAttribute(
          'style',
          `height:${inputBox.offsetHeight / 2 - 1}px !important; top: ${
            inputBox.offsetHeight / 2 - 1
          }px;`,
        );

        // Create the carets in the buttons. These can be replaced by images, font icons, or text.
        const caretUp = document.createElement('div');
        const caretDown = document.createElement('div');

        // set css classes
        caretUp.setAttribute('class', 'caret caret-up');
        caretDown.setAttribute('class', 'caret caret-down ');

        // Insert the carets into the up and down buttons
        scrollDownBtn.appendChild(caretDown);
        scrollUpBtn.appendChild(caretUp);

        // Add event listeners to buttons
        scrollButtons.forEach((btn) => {
          let intervalId;
          btn.addEventListener('mousedown', (event) => {
            event.target.style.transform = 'translateY(1px)';
            event.preventDefault();
            if (btn == scrollUpBtn) {
              changeValueByArrowKeys(inputBox, 'up');
              intervalId = setInterval(changeValueByArrowKeys, 200, inputBox, 'up');
            } else {
              changeValueByArrowKeys(inputBox, 'down');
              intervalId = setInterval(changeValueByArrowKeys, 200, inputBox, 'down');
            }
          });
          // handle enter key to increase value, for better accessibility ux
          btn.addEventListener('keypress', (event) => {
            event.target.style.transform = 'translateY(1px)';
            if (event.key == 'Enter') {
              event.preventDefault();
              if (btn == scrollUpBtn) {
                changeValueByArrowKeys(inputBox, 'up');
              } else {
                changeValueByArrowKeys(inputBox, 'down');
              }
            }
          });

          if (btn === scrollUpBtn) {
            btn.addEventListener('keydown', (event) => {
              if (event.key === 'Tab' && event.shiftKey) {
                highlightTimeUnitArea(inputBox, 1);
                event.preventDefault();
              }
            });
          }

          btn.addEventListener('keyup', (event) => {
            if (event.key == 'Enter') {
              const adjustmentFactor = getAdjustmentFactor(inputBox);
              highlightTimeUnitArea(inputBox, adjustmentFactor);
            }
          });
          btn.addEventListener('mouseup', (event) => {
            event.target.style.transform = 'translateY(0)';
            const adjustmentFactor = getAdjustmentFactor(inputBox);
            highlightTimeUnitArea(inputBox, adjustmentFactor);
            clearInterval(intervalId);
          });
          btn.addEventListener('mouseleave', (event) => {
            event.target.style.transform = 'translateY(0)';
            if (intervalId) {
              clearInterval(intervalId);
              const adjustmentFactor = getAdjustmentFactor(inputBox);
              highlightTimeUnitArea(inputBox, adjustmentFactor);
            }
          });
        });

        // this div houses the increase/decrease buttons
        const controlsDiv = document.createElement('div');
        // set css classes
        controlsDiv.setAttribute('class', 'controls');

        // set inline styles
        controlsDiv.setAttribute(
          'style',
          `left: ${totalInputBoxWidth - 20}px;
        height:${inputBox.offsetHeight}px;`,
        );

        // Add buttons to controls div
        controlsDiv.appendChild(scrollUpBtn);
        controlsDiv.appendChild(scrollDownBtn);

        // this div wraps around existing input, then appends control div
        const controlWrapper = document.createElement('div');

        // set css classes
        controlWrapper.setAttribute('class', 'html-duration-picker-input-controls-wrapper');
        // set inline styles
        controlWrapper.setAttribute(
          'style',
          `width: ${totalInputBoxWidth}px; margin-left: ${inputBoxLeftMargin}; margin-right: ${inputBoxRightMargin};`,
        );
        // add the div just before the picker
        inputBox.parentNode.insertBefore(controlWrapper, inputBox);
        // move the picker into the wrapper div
        controlWrapper.appendChild(inputBox);
        // add the scrolling control buttons into the wrapper div
        controlWrapper.appendChild(controlsDiv);
      }
    });
    return true;
  };

  window.addEventListener('DOMContentLoaded', () => _init(true));
  return {
    init: () => _init(true),
    refresh: () => _init(false),
  };
})();
