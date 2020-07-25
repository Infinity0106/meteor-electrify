var fs = require('fs');
var path = require('path');
var shell = require('shelljs');

module.exports = function ($) {
  return new Scaffold($);
};

function Scaffold($) {
  this.$ = $;
  this.log = require('./log')($, 'electrify:scaffold');
}

Scaffold.prototype.prepare = function () {

  this.log.info('ensuring basic structure');

  shell.mkdir('-p', this.$.env.app.bin);
  shell.mkdir('-p', this.$.env.core.tmp);
  shell.mkdir('-p', this.$.env.core.root);

  var index = path.join(this.$.env.app.root, 'index.js');
  var packageJson = path.join(this.$.env.app.root, 'package.json');
  var config = path.join(this.$.env.app.root, 'electrify.json');
  var gitignore = path.join(this.$.env.app.root, '.gitignore');

  var index_tmpl = path.join(__dirname, 'templates', 'index.js');

  if (!fs.existsSync(index)) {
    fs.writeFileSync(index, fs.readFileSync(index_tmpl, 'utf8'));
  }

  console.log("acafalskdjfklasdj de package")
  if (!fs.existsSync(packageJson)) {
    fs.writeFileSync(packageJson, JSON.stringify({
      name: 'my-electrified-app',
      main: 'index.js',
      author: "autor",
      version: "0.1.0",
      dependencies: {
        "electron": "9.1.1",
        "meteor-electrify": "github:infinity0106/meteor-electrify"
      }
    }, null, 2));
  }

  if (!fs.existsSync(config)) {
    fs.writeFileSync(config, JSON.stringify({
      "plugins": []
    }, null, 2));
  }

  if (!fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, [
      '.DS_Store', '.dist', 'app',
      'bin', 'db', 'node_modules'
    ].join('\n'));
  }
};
