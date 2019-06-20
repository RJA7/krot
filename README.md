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
also put them here.

### Start using
1. Clone repository with the rules described above.
2. Run `npm i`
3. Make sure your cookie crush version has `lib/crot`. If not, fetch latest commit.
4. Run `npm start`. Tool should be available at localhost:3001

After creating layout save it to `Layouts` folder. Use in game. For examples look at some of
gift windows (AchievementGift, ...)

### Phaser extensions
TODO

### Migration
TODO

### TODOs
Fix nineslice children or reject
Make nineslice support trimmed texture
