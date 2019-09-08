## krot-pixi

This module allows your PIXI 5 application to create layouts generate by KROT editor

### How to use
#### Somewhere in main flow
<pre>
const { init } = require('krot-pixi');

init(PIXI);
</pre>

Now you can require yours layouts and create instances

#### On view classes
<pre>
const MyLayout = require('./my-layout');
new MyLayout();
</pre>

All the objects are accessible by name.

You can also specify class for some objects, they will be put in arrays.
Make sure all the names and class names are unique in single layout.

#### Example
<pre>
const ui = new MyLayout();

ui.someName.x = 0;

ui.someClassName.forEach(object => object.x = 0);
</pre>
