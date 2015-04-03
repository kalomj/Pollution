'use strict';

// The Package is past automatically as first parameter
module.exports = function(Gmap, app, auth, database) {

  app.get('/gmap/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/gmap/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/gmap/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/gmap/example/render', function(req, res, next) {
    Gmap.render('index', {
      package: 'gmap'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
