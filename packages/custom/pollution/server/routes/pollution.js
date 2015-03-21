'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Pollution, app, auth, database) {

  app.get('/pollution/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/pollution/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/pollution/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/pollution/example/render', function(req, res, next) {
    Pollution.render('index', {
      package: 'pollution'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
