'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Pollution = new Module('pollution');


/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Pollution.register(function(app, auth, system, database) {

  app.set('views',__dirname + '/server/views');

  //We enable routing. By default the Package Object is passed to the routes
  Pollution.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Pollution.menus.add({
    title: 'My Routes',
    link: 'My Routes',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Pollution.aggregateAsset('css', 'pollution.css',{
      weight: 1,
      group: 'header'});

  Pollution.aggregateAsset('js', 'taxi-data.js',{
    weight: 1,
    group: 'footer'});
  Pollution.aggregateAsset('js', 'route-data.js',{
    weight: 1,
    group: 'footer'});
  Pollution.aggregateAsset('js', 'weighted-data.js',{
    weight: 1,
    group: 'footer'});
  Pollution.aggregateAsset('js', 'test-route.js',{
    weight: 1,
    group: 'footer'});
  Pollution.aggregateAsset('js', 'gmapGlobal.js',{
    weight: 1,
    group: 'footer'});


  Pollution.angularDependencies(['ngMap', 'xml']);
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Pollution.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Pollution.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Pollution.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Pollution;
});

