## krot-pixi
##
##### This is client library, which allows *KROT* layouts be integrated into your game.

* KROT is a program, where you can visually create and edit PIXI layouts.


##
##### Contact
* roman.kopanskyi@gmail.com

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

All the objects are accessible by name so they should be unique for single layout.

#### Example
<pre>
const ui = new MyLayout();

ui.someName.x = 0;
</pre>
