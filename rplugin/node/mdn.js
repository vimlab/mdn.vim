var fs = require('fs');
var mdn = require('../../mdn');

plugin.command('Mdn', { nargs: '*' }, function (nvim, args, done) {

  nvim.commandOutput('vnew', function (err) {
    if (err) return done(err);

    nvim.commandOutput('setlocal buftype=nofile', function(err) {
      if (err) return done(err);

      nvim.setCurrentLine('... Loading http://mdn.io/' + args.join(' ') + ' ...', function (err) {
        if (err) return done(err);

        mdn(args.join(' '), function (err, out) {
          if (err) return done(err);

          nvim.commandOutput('exe bufwinnr("mdn.vim") . "wincmd w"', function (err) {
            if (err) return done(err);

            nvim.setCurrentLine('', function (err) {
              if (err) return done(err);

              fs.writeFileSync('/tmp/mdn.vim', out.join('\n'));
              nvim.commandOutput('read /tmp/mdn.vim', function (err) {
                if (err) return done(err);
                nvim.commandOutput('setlocal nomodifiable', function(err) {
                  if (err) return done(err);
                  done();
                });
              });

            });

          });
        });
      });
    });


  });

});


