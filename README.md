# Gt - Graphics tool

### Goal
Separate layout code from business logic. Use gui for layout creation.

### CookieCrush dependencies
Currently there are couple of dependencies from cookie crush in order to avoid code duplication and
preserve single source of truth.
1. Phaser extensions are located in `cookie-crush-2/lib/gt` directory.
And this project has some pointers to that directory. So you need to clone this repository
into same folder with cookie crush. Example: `projects/cookie-crush-2` -> `projects/gt`
Note also that `cookie-crush-2` folder should be exactly the same, because it's the part of path.
2. Fonts. You can find fonts in `/out folder`. So when adding some new fonts to game, you need
also to put them here.
3. Paths to assets (spritesheets, images, img).

### Start using
1. Clone repository with the rules described above.
2. Run `npm i`
3. Make sure your cookie crush version has `lib/gt`. If not, fetch latest commit.
4. Run `npm start`. Tool should be available at localhost:3001

After creating layout save it to `Layouts` folder. Use in game. For examples look at some of
gift windows (AchievementGift, ...)

### Phaser extensions
You can find Phaser extensions in cookie-crush-2/lib/gt

##### Sprite
* _terms - Array of functions. Used to check whether click event should be dispatched.
* _scaleTween - Tween. Used to avoid parallel scale tweens run.
* addTerm - Method. Pushes function into terms array.
* scaleOnClick - Boolean. If true scale tween will be played on click.
* textureName - String. Similar to frameName, but accepts both texture key or frame name.

If sprite inputEnabled is set to true, the object will always use hand cursor.
To disable hand cursor use `sprite.input.useHandCursor = true;﻿` after `sprite.inputEnabled = true`.

##### Text
* maxWidth (_maxWidth). Number. Used to limit text max width, reducing font size.
* maxHeight (_maxHeight). Number. Used to limit text max height, reducing font size.
* maxFontSize (_maxFontSize). Number. Used to limit text font size.

Minimum font size will be used according to the three above properties.

wordWrapWidth will be always equal maxWidth.

* icons _icons. TextIcon. Used to inline images into text. 
NOTE: this object must stay immutable. 
If you want to edit it use spread operator: `text.icons = {...text.icons, newIcon: new TextIcon("textureName")}`

* updateText method was overridden in order to support the above features.
However some phaser text features are omitted (tabs and multistyle).
If you want to use those omitted features, assign any none zero value to `text.style.tabs`.
In this case original updateText method will be used, but without max size and icons support.


### Migration
Checkout ui-to-gt branch on cookie-crush-2 repo.

### TODOs
Fix nineslice children or reject
Make nineslice support trimmed texture
