# ToneMatrix Redux

[Click on the boxes and make music!](https://www.maxlaumeister.com/tonematrix/) This project is an HTML5 revival of [ToneMatrix by Audiotool](https://tonematrix.audiotool.com/), which was originally written in Flash.

<a href="https://www.maxlaumeister.com/tonematrix/"><img alt="ToneMatrix Redux Screenshot" src="/etc/screenshot.png?raw=true" height="300" title="Click To Play!"></a>

[Click To Play](https://www.maxlaumeister.com/tonematrix/)

## How to Play

Visit [https://www.maxlaumeister.com/tonematrix/](https://www.maxlaumeister.com/tonematrix/)

## How To Build

### Setting Up

1. Install nodejs and npm: `sudo apt update; sudo apt install nodejs npm`
2. Install [Gulp CLI](https://gulpjs.com/): `sudo npm install -g gulp-cli`
3. `cd` into the project folder and install dependencies: `npm install`

### Compilation

* To compile for development and generate docs, run `gulp dev`.

* To compile for development and generate docs, start a localhost server, and auto-recompile changes in source files, run `gulp serve`.

* To compile for production (minified, without source maps), run `gulp prod`.

In any case, the compiled application will be in the `dist` folder.

## Useful tools

* Install the `eslint` extension in VS Code by using the built-in extension browser. VS Code should automatically find the `.eslintrc.js` config file and start highlighting lines of js that fail the linter.
* Likewise, you can install and use the `sass-lint` extension.

## TODO

See [Issues](https://github.com/MaxLaumeister/ToneMatrixRedux/issues).
