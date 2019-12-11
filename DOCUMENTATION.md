Documentation - html-duration-picker.js
=========

HTML/JS
------
<details>
  <summary>Click to expand!</summary>
  
### Installation

**Option 1 (CDN)**

Include it in your HTML file, just before the ```</body>``` tag. Like this:

```
<script src="https://cdn.jsdelivr.net/npm/html-duration-picker/dist/html-duration-picker.min.js"></script>
</body>
```

**Option 2 (Download and Include)**

1. To start using html-duration-picker, just download [html-duration-picker.min.js](https://github.com/nadchif/html-duration-picker.js/dist/html-duration-picker.min.js) from the [dist/](https://github.com/nadchif/html-duration-picker.js/dist/) folder.

2. Include it in your HTML file, just before the ```</body>``` tag. Like this:

```
<script src="html-duration-picker.min.js"></script>
</body>
```

### Usage

Add a ```html-duration-picker``` class on any ```<input>``` box. Like this:

```
<input class="html-duration-picker">
```

To update dynamically loaded input boxes, you execute
```
HtmlDurationPicker.refresh();
```

That's it! Let the magic happen!
</details>


Angular
------
<details>
  <summary>Click to expand!</summary>
    
### Installation
Install the package via npm
```
npm i html-duration-picker
```

### Usage

1. Import the package in your Component
```
import * as HtmlDurationPicker from 'html-duration-picker';
```
2. Add a ```html-duration-picker``` class on any ```<input>``` box. Like this:
```
<input type="text" [className]="'html-duration-picker'">
```
3. Initialize the HtmlDurationPicker for the Component
```
  ngAfterViewInit() {
    HtmlDurationPicker.init();
  }
```

To update dynamically loaded input boxes, you execute
```
HtmlDurationPicker.refresh();
```
  
That's it! Let the magic happen!
</details>

