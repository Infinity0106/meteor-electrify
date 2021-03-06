describe('[electrify] .electrified dependencies', function(){

  this.timeout(60 * 60 * 1000); // 60mins

  var _ = require('lodash');
  var fs = require('fs');
  var path = require('path');
  var spawn = require('child_process').spawn;

  var should = require('should');
  var shell  = require('shelljs');

  var stdio_config = 'inherit';

  var meteor_bin = 'meteor' + (process.platform == 'win32' ? '.bat' : '');
  var git_bin = 'git' + (process.platform == 'win32' ? '.exe' : '');

  var Electrify = require('../lib');

  var tests_dir  = path.join(require('os').tmpdir(), 'electrify-tests');

  var root_dir = path.join(__dirname, '..');
  var npm_dir  = path.join(root_dir, '.npm', 'node_modules', 'meteor-electrify');

  var meteor_app_dir    = path.join(tests_dir, 'leaderboard');
  var electrify_dir = path.join(meteor_app_dir, '.electrify');

  var electrify;

  before(function(done){
    console.log('preparing test environment');

    process.env.DEVELECTRIFY = true;

    // reset tests dir
    shell.rm('-rf', npm_dir);
    shell.rm('-rf', tests_dir);

    shell.mkdir('-p', tests_dir);

    // crates a sample app and add the package
    spawn(git_bin, ['clone', '--depth=1', 'https://github.com/meteor/leaderboard'], {
      cwd: tests_dir,
      stdio: stdio_config
    }).on('exit', function(){
      // remove mobile platforms
      spawn(meteor_bin, ['remove-platform', 'android', 'ios'], {
        cwd: meteor_app_dir,
        stdio: stdio_config
      }).on('exit', function(){
        // init electrify
        shell.mkdir('-p', electrify_dir);

        electrify = Electrify(electrify_dir);

        shell.rm('-rf', electrify.env.core.root);


        // add electrify package
        spawn(meteor_bin, ['npm', 'install', 'meteor-electrify-client'], {
          cwd: meteor_app_dir,
          stdio: stdio_config,
          env: _.extend({DEVELECTRIFY: true}, process.env)
        }).on('exit', done);
      });
    });
  });

  it('should ensure .electrify dependencies', function(done) {

    process.env.DEVELECTRIFY = false;
    electrify = Electrify(electrify_dir);

    electrify.scaffold.prepare();

    var node_mods           = path.join(electrify_dir, 'node_modules');
    var node_mods_electrify = path.join(node_mods, 'meteor-electrify');

    // sets a previous version already published to ensure its being
    // installed at least
    var pkg_path = path.join(electrify_dir, 'package.json');
    var pkg      = require(pkg_path);

    pkg.dependencies['meteor-electrify'] = '3.0.0';
    fs.writeFileSync(pkg_path, JSON.stringify(pkg, null, 2));

    electrify.app.ensure_deps(function(){
      should(fs.existsSync(node_mods_electrify)).be.ok();
      done();
    });
  });

});