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
  /*
  DO NOT CHANGE THE LINE BELOW. IT IS REQUIRED TO INSERT STYLES FROM 'style.css'
  */
  const pickerStyles = PICKER_STYLES_CSS_CONTENTS; 
  /*
  DO NOT CHANGE THE LINE ABOVE. IT IS REQUIRED TO INSERT STYLES FROM 'style.css'
  */

  // Gets the cursor selection
  const getCursorSelection = (
    { target: { selectionStart, value } },
    hideSeconds,
  ) => {
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

    return { cursorSelection, hideSeconds, hourMarker, minuteMarker };
  };
  // Gets the time interval (hh or mm or ss) and selects the entire block
  const selectFocus = (event) => {
    const hideSeconds = shouldHideSeconds(event.target);
    // Gets the cursor position and select the nearest time interval
    const { cursorSelection, hourMarker, minuteMarker } = getCursorSelection(
      event,
      hideSeconds,
    );

    // Something is wrong with the duration format.
    if (!cursorSelection) {
      return;
    }
    // The cursor selection is: hours
    if (cursorSelection === 'hours') {
      event.target.setAttribute('data-adjustment-mode', 60 * 60);
      event.target.setSelectionRange(0, hourMarker);
      return;
    }
    // The cursor selection is: minutes
    if (cursorSelection === 'minutes') {
      const increment = hideSeconds ? 3 : 0;

      event.target.setAttribute('data-adjustment-mode', 60);
      event.target.setSelectionRange(hourMarker + 1, minuteMarker + increment);
      return;
    }
    // The cursor selection is: seconds
    if (cursorSelection === 'seconds') {
      event.target.setAttribute('data-adjustment-mode', 1);
      event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);
      return;
    }
    event.target.setAttribute('data-adjustment-mode', 'ss');
    event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);
    return;
  };

  const shouldHideSeconds = (inputBox) => {
    return (
      inputBox.dataset.hideSeconds !== undefined &&
      inputBox.dataset.hideSeconds !== 'false'
    );
  };

  const createEvent = (type, option = { bubbles: false, cancelable: false }) => {
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

    inputBox.value = !shouldHideSeconds(inputBox)
      ? `${value}:${formattedSeconds}`
      : value;

    inputBox.dispatchEvent(createEvent('input'));
  };
  const highlightIncrementArea = (inputBox, adjustmentFactor) => {
    const hourMarker = inputBox.value.indexOf(':');
    const minuteMarker = inputBox.value.lastIndexOf(':');
    const hideSeconds = shouldHideSeconds(inputBox);

    inputBox.focus();
    inputBox.select();

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
      inputBox.setAttribute('data-adjustment-mode', adjustmentFactor);
    }
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
    const fixedValue = matchConstraints(inputBox, secondsValue);
    insertFormatted(inputBox, fixedValue);
    // highlightIncrementArea(inputBox, adjustmentFactor);
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
  const checkDuration = (duration, hideSeconds) => {
    const pattern = hideSeconds
      ? '^[0-9]{2,3}:[0-5][0-9]$'
      : '^[0-9]{2,3}:[0-5][0-9]:[0-5][0-9]$';
    const regex = RegExp(pattern);
    return regex.test(duration);
  };

  const matchConstraints = (picker, duration) => {
    const { maxDuration, minDuration } = getConstraints(picker);
    return Math.min(Math.max(duration, minDuration), maxDuration);
  };
  const durationToSeconds = (value) => {
    const sectioned = value.split(':');
    if (sectioned.length < 2) {
      return 0;
    } else {
      return (
        Number(sectioned[2] || 0) +
        Number(sectioned[1] * 60) +
        Number(sectioned[0] * 60 * 60)
      );
    }
  };

  // validate any input in the box;
  const validateInput = (event) => {
    const hideSeconds = shouldHideSeconds(event.target);
    const { cursorSelection } = getCursorSelection(event, hideSeconds);
    const sectioned = event.target.value.split(':');

    if (
      event.target.dataset.duration &&
      checkDuration(event.target.dataset.duration, hideSeconds) &&
      ((hideSeconds && sectioned.length !== 2) ||
        (!hideSeconds && sectioned.length !== 3))
    ) {
      event.target.value = event.target.dataset.duration; // fallback to data-duration value
      return;
    }
    if (!hideSeconds && sectioned.length !== 3) {
      event.target.value = '00:00:00'; // fallback to default
      return;
    } else if (hideSeconds && sectioned.length !== 2) {
      event.target.value = '00:00'; // fallback to default
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
      shiftFocus(event.target, 'right');
    }
    if (!hideSeconds) {
      if (isNaN(sectioned[2]) || sectioned[2] < 0) {
        sectioned[2] = '00';
      }
      if (sectioned[2] > 59 || sectioned[2].length > 2) {
        sectioned[2] = '59';
      }
    }

    event.target.value = sectioned.join(':');
  };

  const insertWithConstraints = (event) => {
    const picker = event.target;
    const duration = picker.value || picker.dataset.duration;
    const secondsValue = durationToSeconds(duration);
    insertFormatted(picker, matchConstraints(picker, secondsValue));
  };

  const handleKeydown = (event) => {
    const changeValueKeys = [
      'ArrowDown',
      'ArrowUp',
      'ArrowLeft',
      'ArrowRight',
      'Enter',
    ];
    if (changeValueKeys.includes(event.key)) {
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
        case 'Enter':
          insertWithConstraints(event);
          event.target.blur();
          break;
      }
      event.preventDefault();
    }

    // Allow tab to change selection and escape the input
    if (event.key === 'Tab') {
      const preAdjustmentFactor = getAdjustmentFactor(event.target);
      const rightAdjustValue = shouldHideSeconds(event.target) ? 3600 : 60;
      const direction = event.shiftKey ? 'left' : 'right';

      shiftFocus(event.target, direction);

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

  const getDurationValue = (picker, name, defaultValue) => {
    const value = picker.dataset[name];
    if (checkDuration(value, shouldHideSeconds(picker))) {
      return durationToSeconds(value);
    } else {
      return defaultValue;
    }
  };

  const getConstraints = (picker) => {
    const minDuration = getDurationValue(picker, 'durationMin', 0);
    const maxDuration = getDurationValue(picker, 'durationMax', Infinity);
    return {
      minDuration,
      maxDuration,
    };
  };

  const getInitialDuration = (picker) => {
    const duration = getDurationValue(picker, 'duration', 0);
    return matchConstraints(picker, duration);
  };
  const _init = () => {
    // append styles to DOM
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    head.appendChild(style);
    style.styleSheet
      ? style.styleSheet.cssText = pickerStyles //IE8 and below.
      : style.appendChild(document.createTextNode(pickerStyles));


    // Select all of the input fields with the attribute "html-duration-picker"
    const getInputFields = document.querySelectorAll(
      'input.html-duration-picker',
    );
    getInputFields.forEach((picker) => {
      // Set the default text and apply some basic styling to the duration picker
      if (picker.getAttribute('data-upgraded') == 'true') {
        return; // in case some developer calls this or includes it twice
      }
      const currentPickerStyle =
        picker.currentStyle || window.getComputedStyle(picker);
      const pickerRightMargin = currentPickerStyle.marginRight;
      const pickerLeftMargin = currentPickerStyle.marginLeft;
      const totalPickerWidth = currentPickerStyle.width;
      picker.setAttribute('data-upgraded', true);
      if (
        !picker.value ||
        !checkDuration(picker.value, shouldHideSeconds(picker))
      ) {
        insertFormatted(picker, getInitialDuration(picker));
      }
      picker.setAttribute('class', 'pickerStyles');
      picker.setAttribute('aria-label', 'Duration Picker');
      picker.addEventListener('keydown', handleKeydown);
      picker.addEventListener('focus', selectFocus); // selects a block of hours, minutes etc
      picker.addEventListener('mouseup', selectFocus); // selects a block of hours, minutes etc
      picker.addEventListener('change', validateInput);
      picker.addEventListener('blur', insertWithConstraints);
      picker.addEventListener('keyup', validateInput);
      picker.addEventListener('drop', (event) => event.preventDefault());

      // Create the up and down buttons
      const scrollUpBtn = document.createElement('button');
      const scrollDownBtn = document.createElement('button');
      const scrollButtons = [scrollUpBtn, scrollDownBtn];

      scrollUpBtn.setAttribute('type', 'button');
      scrollUpBtn.setAttribute('aria-label', 'Increase duration');
      scrollUpBtn.setAttribute('class', 'scrollStyle');
      scrollUpBtn.setAttribute(
        'style',
        `height:${picker.offsetHeight / 2 - 1}px !important; top: 1px;`,
      );
      scrollUpBtn.classList.add('scroll-up');
      scrollDownBtn.setAttribute('type', 'button');
      scrollDownBtn.setAttribute('aria-label', 'Decrease duration');
      scrollDownBtn.setAttribute('class', 'scrollStyle');
      scrollDownBtn.setAttribute(
        'style',
        `height:${picker.offsetHeight / 2 - 1}px !important; top: ${picker.offsetHeight / 2 - 1
        }px;`,
      );
      scrollDownBtn.classList.add('scroll-down');

      // Create the carets in the buttons. These can be replaced by images, font icons, or text.
      const caretUp = document.createElement('div');
      const caretDown = document.createElement('div');
      caretUp.setAttribute('class', 'caretStyle caretUpStyle');
      caretDown.setAttribute('class', 'caretStyle caretDownStyle');
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
            changeValue(picker, 'up');
            intervalId = setInterval(changeValue, 200, picker, 'up');
          } else {
            changeValue(picker, 'down');
            intervalId = setInterval(changeValue, 200, picker, 'down');
          }
        });
        // handle enter key to increase value, for better accessibility ux
        btn.addEventListener('keypress', (event) => {
          event.target.style.transform = 'translateY(1px)';
          if (event.key == 'Enter') {
            event.preventDefault();
            if (btn == scrollUpBtn) {
              changeValue(picker, 'up');
            } else {
              changeValue(picker, 'down');
            }
          }
        });

        if (btn === scrollUpBtn) {
          btn.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' && event.shiftKey) {
              highlightIncrementArea(picker, 1);
              event.preventDefault();
            }
          });
        }

        btn.addEventListener('keyup', (event) => {
          if (event.key == 'Enter') {
            const adjustmentFactor = getAdjustmentFactor(picker);
            highlightIncrementArea(picker, adjustmentFactor);
          }
        });
        btn.addEventListener('mouseup', (event) => {
          event.target.style.transform = 'translateY(0)';
          const adjustmentFactor = getAdjustmentFactor(picker);
          highlightIncrementArea(picker, adjustmentFactor);
          clearInterval(intervalId);
        });
        btn.addEventListener('mouseleave', (event) => {
          event.target.style.transform = 'translateY(0)';
          if (intervalId) {
            clearInterval(intervalId);
            const adjustmentFactor = getAdjustmentFactor(picker);
            highlightIncrementArea(picker, adjustmentFactor);
          }
        });
      });

      // this div houses the increase/decrease buttons
      const controlsDiv = document.createElement('div');
      controlsDiv.setAttribute('class', 'controlsDivStyle');
      controlsDiv.setAttribute(
        'style',
        `left: ${parseFloat(totalPickerWidth) - 20}px;
        height:${picker.offsetHeight}px;`,
      );
      controlsDiv.classList.add('controls');

      // Add buttons to controls div
      controlsDiv.appendChild(scrollUpBtn);
      controlsDiv.appendChild(scrollDownBtn);

      // this div wraps around existing input, then appends control div
      const controlWrapper = document.createElement('div');
      controlWrapper.setAttribute('class', 'controlWrapperStyle');
      controlWrapper.setAttribute(
        'style',
        `width: ${totalPickerWidth}; margin-left: ${pickerLeftMargin}; margin-right: ${pickerRightMargin};`,
      );
      controlWrapper.classList.add('html-duration-picker-wrapper');

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
