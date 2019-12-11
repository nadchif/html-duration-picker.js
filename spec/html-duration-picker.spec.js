const {JSDOM} = require('jsdom');

const dom = new JSDOM(`<html><body><input type="text"><input type="text" html-duration-picker data-duration="00:20:00"></body></html>`);
global.window = dom.window;
global.document = dom.window.document;


describe('HTML Duration Picker', () => {
  const HtmlDurationPicker = require('../dist/html-duration-picker.min.js');

  const testPicker = document.querySelector('[html-duration-picker]');

  beforeEach(function() {
  });

  it('should upgrade input box with html-duration-picker attribute', ()=> {
    expect(testPicker.getAttribute('data-upgraded')).toEqual('true');
  });

  it('should upgrade set a start value in xx:xx:xx format', ()=> {
    expect(testPicker.value).toMatch('^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$');
  });

  it('should upgrade set a start value of 00:20:00', ()=> {
    expect(testPicker.value).toEqual('00:20:00');
  });

  it('should not allow alphabetic characters input ', ()=> {
    testPicker.focus();
    const event = new window.KeyboardEvent('keydown', {key: '3'});
    testPicker.dispatchEvent(event);
    expect(testPicker.value).toMatch('^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$');
  });
});
