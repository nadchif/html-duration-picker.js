const {JSDOM} = require('jsdom');

const dom = new JSDOM(`<html><body><input type="text"><input type="text" class="html-duration-picker" data-duration="00:90:00"></body></html>`);
global.window = dom.window;
global.document = dom.window.document;

describe('Duration Picker', () => {
  const HtmlDurationPicker = require('../dist/html-duration-picker.min.js');
  const testPicker = document.querySelector('.html-duration-picker');
  HtmlDurationPicker.init();

  describe('after init', ()=>{
    it('should upgrade input box with html-duration-picker attribute', ()=> {
      expect(testPicker.getAttribute('data-upgraded')).toEqual('true');
    });
    it('should upgrade set a start value in xx:xx:xx format', ()=> {
      expect(testPicker.value).toMatch('^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$');
    });
  });

  describe('minute (mm) value', ()=>{
    const sectioned = testPicker.value.split(':');
    it('should be less than 60', ()=> {
      expect(Number(sectioned[1])).toBeLessThan(60);
    });
    it('should be more than 0', ()=> {
      expect(Number(sectioned[1])).toBeGreaterThan(-1);
    });
  });

  describe('seconds (ss) value', ()=>{
    const sectioned = testPicker.value.split(':');
    it('should be less than 60', ()=> {
      expect(Number(sectioned[2])).toBeLessThan(60);
    });
    it('should be more than 0', ()=> {
      expect(Number(sectioned[2])).toBeGreaterThan(-1);
    });
  });

  describe('after losing focus', ()=>{
    it('should fall back from "dummytext" to valid xx:xx:xx', ()=> {
      testPicker.focus();
      testPicker.value = 'dummytext';
      testPicker.blur();
      expect(testPicker.value).toMatch('^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$');
    });

    it('should fall back from "00:90:00" to valid xx:xx:xx', ()=> {
      testPicker.focus();
      testPicker.value = '00:90:00';
      testPicker.blur();
      expect(testPicker.value).toMatch('^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$');
    });
  });
});
