const {JSDOM} = require('jsdom');

const dom = new JSDOM(`
<html><body><input type="text"><input type="text" class="html-duration-picker other-class" data-duration="00:90:00"></body></html>
`);
global.window = dom.window;
global.document = dom.window.document;

describe('Duration Picker', () => {
  const HtmlDurationPicker = require('../src/compiled/html-duration-picker.js');
  const testPicker = document.querySelector('.html-duration-picker');
  HtmlDurationPicker.init();

  describe('after init', () => {
    it('should upgrade input box with html-duration-picker attribute', () => {
      expect(testPicker.getAttribute('data-upgraded')).toEqual('true');
    });
    it('should upgrade set a start value in xx:xx:xx format', () => {
      expect(testPicker.value).toMatch('^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$');
    });
    it('should not override other existing classes', () => {
      const classList = Array.from(testPicker.classList);
      expect(classList).toContain('html-duration-picker');
      expect(classList).toContain('other-class');
    });
  });

  describe('minute (mm) value', () => {
    const sectioned = testPicker.value.split(':');
    it('should be less than 60', () => {
      expect(Number(sectioned[1])).toBeLessThan(60);
    });
    it('should be more than -1', () => {
      expect(Number(sectioned[1])).toBeGreaterThan(-1);
    });
  });

  describe('seconds (ss) value', () => {
    const sectioned = testPicker.value.split(':');
    it('should be less than 60', () => {
      expect(Number(sectioned[2])).toBeLessThan(60);
    });
    it('should be more than 0', () => {
      expect(Number(sectioned[2])).toBeGreaterThan(-1);
    });
  });

  describe('after losing focus', () => {
    it('should fall back from "dummytext" to valid xx:xx:xx', () => {
      testPicker.focus();
      testPicker.value = 'dummytext';
      testPicker.blur();
      expect(testPicker.value).toMatch('^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$');
    });

    it('should fall back from "00:90:00" to valid xx:xx:xx', () => {
      testPicker.focus();
      testPicker.value = '00:90:00';
      testPicker.blur();
      expect(testPicker.value).toMatch('^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$');
    });
  });

  describe('default mode arrow buttons are clicked 2x', () => {
    let testPicker;
    beforeEach(() => {
      const dom = new JSDOM(`
      <html><body><input type="text">
        <input type="text" class="html-duration-picker other-class" />
        </body></html>
      `);
      global.document = dom.window.document;
      global.window = dom.window;

      testPicker = document.querySelector('.html-duration-picker');
      HtmlDurationPicker.init();
    });
    const simulateEvent = (event, node) => {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent(event, false, true);
      node.dispatchEvent(evt);
    };
    it('should increase hh to 2', () => {
      testPicker.focus();
      const controls = testPicker.nextSibling;
      // 1
      simulateEvent('mousedown', controls.childNodes[0]);
      simulateEvent('mouseup', controls.childNodes[0]);
      // 2
      simulateEvent('mousedown', controls.childNodes[0]);
      simulateEvent('mouseup', controls.childNodes[0]);
      expect(testPicker.value).toEqual('02:00:00');
    });
  });

  describe('data-hide-seconds mode arrow buttons are clicked 2x', () => {
    let testPicker;
    beforeEach(() => {
      const dom = new JSDOM(`
      <html><body><input type="text">
        <input type="text" class="html-duration-picker other-class" data-hide-seconds="true" />
        </body></html>
      `);
      global.document = dom.window.document;
      global.window = dom.window;

      testPicker = document.querySelector('.html-duration-picker');
      HtmlDurationPicker.init();
    });
    const simulateEvent = (event, node) => {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent(event, false, true);
      node.dispatchEvent(evt);
    };
    it('should increase hh to 2', () => {
      testPicker.focus();
      const controls = testPicker.nextSibling;
      // 1
      simulateEvent('mousedown', controls.childNodes[0]);
      simulateEvent('mouseup', controls.childNodes[0]);
      // 2
      simulateEvent('mousedown', controls.childNodes[0]);
      simulateEvent('mouseup', controls.childNodes[0]);
      expect(testPicker.value).toEqual('02:00');
    });
  });

  describe('with min value and duration', () => {
    let testPicker;
    beforeEach(() => {
      const dom = new JSDOM(`
      <html><body><input type="text">
        <input type="text" class="html-duration-picker other-class" data-duration="00:29:00" data-duration-min="00:30:00" />
        </body></html>
      `);
      global.document = dom.window.document;
      global.window = dom.window;

      testPicker = document.querySelector('.html-duration-picker');
      HtmlDurationPicker.init();
    });
    it('should set min value if duration is less than min value', () => {
      expect(testPicker.value).toEqual('00:30:00');
    });
  });

  describe('with min value and max value', () => {
    let testPicker;
    beforeEach(() => {
      const dom = new JSDOM(`
      <html><body><input type="text">
      <input type="text" class="html-duration-picker other-class" data-duration-max="00:31:00" data-duration-min="00:30:00" />
      </body></html>`);
      global.document = dom.window.document;
      testPicker = document.querySelector('.html-duration-picker');
      HtmlDurationPicker.init();
    });

    it('should set min value to duration if duration not defined', () => {
      expect(testPicker.value).toEqual('00:30:00');
    });

    it('should set min value if value is lower min value', () => {
      testPicker.focus();
      testPicker.value = '00:29:00';
      testPicker.blur();
      expect(testPicker.value).toEqual('00:30:00');
    });

    it('should set max value if value is greater max value', () => {
      testPicker.focus();
      testPicker.value = '00:35:00';
      testPicker.blur();
      expect(testPicker.value).toEqual('00:31:00');
    });
  });

  describe('with invalid value', () => {
    let testPicker;
    beforeEach(() => {
      const dom = new JSDOM(
        `<html><body><input type="text"><input type="text" class="html-duration-picker other-class" value="abcd"></body></html>`,
      );
      global.document = dom.window.document;
      testPicker = document.querySelector('.html-duration-picker');
      HtmlDurationPicker.init();
    });
    it('should set 00:00:00 or data-duration when provided an invalid value', () => {
      expect(testPicker.value).toEqual('00:00:00');
    });
  });
});
