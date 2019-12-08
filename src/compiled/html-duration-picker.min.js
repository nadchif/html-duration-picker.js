(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["HtmlDurationPicker"] = factory();
	else
		root["HtmlDurationPicker"] = factory();
})(typeof self !== "undefined" ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/html-duration-picker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/html-duration-picker.js":
/*!*************************************!*\
  !*** ./src/html-duration-picker.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/**\n * @preserve\n * html-duration-picker.js\n *\n * @description Turn an html input box to a duration picker, without jQuery\n * @version 1.0.8\n * @author Chif <nadchif@gmail.com>\n * @license GPL v3\n *\n */\n/* harmony default export */ __webpack_exports__[\"default\"] = ((function () {\n  // The following keys will not be blocked from working within the input field\n  const acceptedKeys = ['Backspace', 'ArrowDown', 'ArrowUp', 'Tab']; // Gets the current select block hhh or mm or ss\n  // and selects the entire block\n\n  const selectFocus = event => {\n    // get cursor position and select nearest block;\n    const cursorPosition = event.target.selectionStart;\n    const hourMarker = event.target.value.indexOf(':');\n    const minuteMarker = event.target.value.lastIndexOf(':');\n\n    if (hourMarker < 0 || minuteMarker < 0) {\n      // something wrong with the format. just return;\n      return;\n    } // cursor is in the hours region\n\n\n    if (cursorPosition < hourMarker) {\n      event.target.setAttribute('data-adjustment-mode', 60 * 60);\n      event.target.setSelectionRange(0, hourMarker);\n      return;\n    } // cursor is in the minutes region\n\n\n    if (cursorPosition > hourMarker && cursorPosition < minuteMarker) {\n      event.target.setAttribute('data-adjustment-mode', 60);\n      event.target.setSelectionRange(hourMarker + 1, minuteMarker);\n      return;\n    } // cursor is in the seconds region\n\n\n    if (cursorPosition > minuteMarker) {\n      event.target.setAttribute('data-adjustment-mode', 1);\n      event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);\n      return;\n    }\n\n    event.target.setAttribute('data-adjustment-mode', 'ss');\n    event.target.setSelectionRange(minuteMarker + 1, minuteMarker + 3);\n    return;\n  }; // Inserts a formatted value into the input box\n\n\n  const insertFormatted = (inputBox, secondsValue) => {\n    let hours = Math.floor(secondsValue / 3600);\n    secondsValue %= 3600;\n    let minutes = Math.floor(secondsValue / 60);\n    let seconds = secondsValue % 60;\n    minutes = String(minutes).padStart(2, '0');\n    hours = String(hours).padStart(2, '0');\n    seconds = String(seconds).padStart(2, '0');\n    inputBox.value = hours + ':' + minutes + ':' + seconds;\n  };\n\n  const highlightIncrementArea = (inputBox, adjustmentFactor) => {\n    const hourMarker = inputBox.value.indexOf(':');\n    const minuteMarker = inputBox.value.lastIndexOf(':');\n    inputBox.focus();\n    inputBox.select();\n\n    if (adjustmentFactor >= 60 * 60) {\n      inputBox.selectionStart = 0; // hours mode\n\n      inputBox.selectionEnd = hourMarker;\n      return;\n    }\n\n    if (adjustmentFactor >= 60) {\n      inputBox.selectionStart = hourMarker + 1; // minutes mode\n\n      inputBox.selectionEnd = minuteMarker;\n      return;\n    }\n\n    inputBox.selectionStart = minuteMarker + 1; // seconds mode\n\n    inputBox.selectionEnd = minuteMarker + 3;\n    return;\n  }; // gets the adjustment factor for a picker\n\n\n  const getAdjustmentFactor = picker => {\n    let adjustmentFactor = 1;\n\n    if (Number(picker.getAttribute('data-adjustment-mode')) > 0) {\n      adjustmentFactor = Number(picker.getAttribute('data-adjustment-mode'));\n    }\n\n    return adjustmentFactor;\n  }; // increase time value;\n\n\n  const increaseValue = inputBox => {\n    const rawValue = inputBox.value;\n    const sectioned = rawValue.split(':');\n    const adjustmentFactor = getAdjustmentFactor(inputBox);\n    let secondsValue = 0;\n\n    if (sectioned.length === 3) {\n      secondsValue = Number(sectioned[2]) + Number(sectioned[1] * 60) + Number(sectioned[0] * 60 * 60);\n    }\n\n    secondsValue += adjustmentFactor;\n    insertFormatted(inputBox, secondsValue);\n    highlightIncrementArea(inputBox, adjustmentFactor);\n  }; // decrease time value;\n\n\n  const decreaseValue = inputBox => {\n    const rawValue = inputBox.value;\n    const sectioned = rawValue.split(':');\n    const adjustmentFactor = getAdjustmentFactor(inputBox);\n    let secondsValue = 0;\n\n    if (sectioned.length === 3) {\n      secondsValue = Number(sectioned[2]) + Number(sectioned[1] * 60) + Number(sectioned[0] * 60 * 60);\n    }\n\n    secondsValue -= adjustmentFactor;\n\n    if (secondsValue < 0) {\n      secondsValue = 0;\n    }\n\n    insertFormatted(inputBox, secondsValue);\n    highlightIncrementArea(inputBox, adjustmentFactor);\n  }; // shift focus from one unit to another;\n\n\n  const shiftFocus = (inputBox, toSide) => {\n    const adjustmentFactor = getAdjustmentFactor(inputBox);\n\n    switch (toSide) {\n      case 'left':\n        highlightIncrementArea(inputBox, adjustmentFactor * 60);\n        break;\n\n      case 'right':\n        highlightIncrementArea(inputBox, adjustmentFactor / 60);\n        break;\n    }\n  }; // validate any input in the box;\n\n\n  const validateInput = event => {\n    const sectioned = event.target.value.split(':');\n\n    if (sectioned.length !== 3) {\n      event.target.value = '00:00:00'; // fallback to default\n\n      return;\n    }\n\n    if (isNaN(sectioned[0])) {\n      sectioned[0] = '00';\n    }\n\n    if (isNaN(sectioned[1]) || sectioned[1] < 0) {\n      sectioned[1] = '00';\n    }\n\n    if (sectioned[1] > 59 || sectioned[1].length > 2) {\n      sectioned[1] = '59';\n    }\n\n    if (isNaN(sectioned[2]) || sectioned[2] < 0) {\n      sectioned[2] = '00';\n    }\n\n    if (sectioned[2] > 59 || sectioned[2].length > 2) {\n      sectioned[2] = '59';\n    }\n\n    event.target.value = sectioned.join(':');\n  };\n\n  const handleKeydown = event => {\n    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {\n      switch (event.key) {\n        // use up and down arrow keys to increase value;\n        case 'ArrowDown':\n          decreaseValue(event.target);\n          break;\n\n        case 'ArrowUp':\n          increaseValue(event.target);\n          break;\n        // use left and right arrow keys to shift focus;\n\n        case 'ArrowLeft':\n          shiftFocus(event.target, 'left');\n          break;\n\n        case 'ArrowRight':\n          shiftFocus(event.target, 'right');\n          break;\n      }\n\n      event.preventDefault(); // prevent default\n    }\n\n    if (isNaN(event.key) && !acceptedKeys.includes(event.key)) {\n      event.preventDefault(); // prevent default\n\n      return false;\n    }\n  }; // Ugrading the pickers\n\n\n  const _init = () => {\n    // select all input fields with the attribute \"html-duration-picker\"\n    document.querySelectorAll('input[html-duration-picker]').forEach(picker => {\n      // Set default text and Apply some basic styling to the picker\n      if (picker.getAttribute('data-upgraded') == 'true') {\n        return; // in case some developer calls this or includes it twice\n      }\n\n      const currentPickerStyle = picker.currentStyle || window.getComputedStyle(picker);\n      const pickerRightMargin = currentPickerStyle.marginRight;\n      const pickerLeftMargin = currentPickerStyle.marginLeft;\n      const totalPickerWidth = currentPickerStyle.width;\n      picker.setAttribute('data-upgraded', true);\n      picker.value = '00:00:00';\n      picker.style.textAlign = 'right';\n      picker.style.paddingRight = '20px';\n      picker.style.boxSizing = 'border-box';\n      picker.style.width = '100%';\n      picker.style.margin = 0;\n      picker.style.cursor = 'text';\n      picker.setAttribute('aria-label', 'Duration Picker');\n      picker.addEventListener('keydown', handleKeydown);\n      picker.addEventListener('select', selectFocus); // selects a block of hours, minutes etc\n\n      picker.addEventListener('mouseup', selectFocus); // selects a block of hours, minutes etc\n\n      picker.addEventListener('change', validateInput);\n      picker.addEventListener('blur', validateInput);\n      picker.addEventListener('keyup', validateInput);\n      picker.addEventListener('drop', event => event.preventDefault()); // These are the carets in the buttons.\n      // Can be replaced by images/font icons or text\n\n      const caretUp = document.createElement('div');\n      const caretDown = document.createElement('div');\n      caretUp.setAttribute('style', `width:0;height:0;\n    border-style:solid;border-width:0 4px 5px 4px; border-color:transparent transparent #000 transparent`);\n      caretDown.setAttribute('style', `width:0;height:0;\n    border-style:solid;border-width:5px 4px 0 4px; border-color:#000 transparent transparent transparent`); // These are action buttons for scrolling values up or down\n\n      const scrollUpBtn = document.createElement('button');\n      const scrollDownBtn = document.createElement('button');\n      const scrollButtons = [scrollUpBtn, scrollDownBtn];\n      scrollUpBtn.setAttribute('aria-label', 'Increase duration');\n      scrollDownBtn.setAttribute('aria-label', 'Decrease duration');\n      scrollUpBtn.setAttribute('style', `text-align:center; width: 16px;padding: 0px 4px; border:none; cursor:default;\n    height:${picker.offsetHeight / 2 - 1}px !important; position:absolute; top: 1px;`);\n      scrollDownBtn.setAttribute('style', `text-align:center; width: 16px;padding: 0px 4px; border:none;\n    height:${picker.offsetHeight / 2 - 1}px !important; position:absolute; top: ${picker.offsetHeight / 2 - 1}px;`); // insert carets into buttons\n\n      scrollDownBtn.appendChild(caretDown);\n      scrollUpBtn.appendChild(caretUp); // add event listeners to buttons\n\n      let intervalId;\n      scrollButtons.forEach(btn => {\n        btn.addEventListener('mousedown', event => {\n          event.preventDefault();\n\n          if (btn == scrollUpBtn) {\n            increaseValue(picker);\n            intervalId = setInterval(increaseValue, 200, picker);\n          } else {\n            decreaseValue(picker);\n            intervalId = setInterval(decreaseValue, 200, picker);\n          }\n        });\n        btn.addEventListener('mouseup', () => {\n          clearInterval(intervalId);\n        });\n        btn.addEventListener('mouseleave', () => {\n          clearInterval(intervalId);\n        });\n      }); // this div houses the increase/decrease buttons\n\n      const controlsDiv = document.createElement('div');\n      controlsDiv.setAttribute('style', `display:inline-block; position: absolute;top:1px;left: ${parseFloat(totalPickerWidth) - 20}px;\n    height:${picker.offsetHeight}px; padding:2px 0`); // add buttons to controls div;\n\n      controlsDiv.appendChild(scrollUpBtn);\n      controlsDiv.appendChild(scrollDownBtn); // this div wraps around existing input, then appends control div\n\n      const controlWrapper = document.createElement('div');\n      controlWrapper.style.padding = '0px';\n      controlWrapper.style.display = 'inline-block';\n      controlWrapper.style.background = 'transparent';\n      controlWrapper.style.width = totalPickerWidth;\n      controlWrapper.style.position = 'relative';\n      controlWrapper.style.marginLeft = pickerLeftMargin;\n      controlWrapper.style.marginRight = pickerRightMargin;\n      picker.parentNode.insertBefore(controlWrapper, picker);\n      controlWrapper.appendChild(picker);\n      controlWrapper.appendChild(controlsDiv);\n      return;\n    });\n    return true;\n  }; // listen for document ready\n\n\n  window.addEventListener('DOMContentLoaded', () => {\n    _init();\n  });\n  return {\n    init: _init,\n    refresh: _init\n  };\n})());\n\n//# sourceURL=webpack://HtmlDurationPicker/./src/html-duration-picker.js?");

/***/ })

/******/ })["default"];
});