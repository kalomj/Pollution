'use strict';

/*
 * Defining the Package
 */
  var Module = require('meanio').Module;
  var Gmap = new Module('gmap');
/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
  Gmap.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Gmap.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  /*Gmap.menus.add({
    title: 'gmap example page',
    link: 'gmap example page',
    roles: ['authenticated'],
    menu: 'main'
  });*/



  Gmap.angularDependencies(['google-maps']);

  // Aggregate css
  Gmap.aggregateAsset('css', 'gmap.css');

  
  /*
  Gmap.aggregateAsset('js', '/packages/map/public/assets/lib/lodash/dist/lodash.min.js', {
        absolute: true,
        weight:1   , // We want the googleapis to be loaded before
        global: true
    });
  
  Gmap.aggregateAsset('js', '/gmap/assets/lib/googleapis/maps.js', {
        absolute: true,
        global: true
    });

  // Satisfy dependencies
  
  Gmap.aggregateAsset('js', '/gmap/assets/lib/angular-google-maps/dist/angular-google-maps.min.js', {
        absolute: true,
        group:
        global: true
    });
*/
/*
  Gmap.aggregateAsset('js', 'googleapis/maps.js',{
    global: true,
    weight: 1,
    group: 'header'
  });
*/

  Gmap.aggregateAsset('js', 'googleapis/places.js',{
    global: true,
    weight: -4,
    group: 'header'
  });

  Gmap.aggregateAsset('js', '../lib/angular-google-maps/dist/angular-google-maps.min.js',{
    weight: 4,
    absolute: false
  });
  
  Gmap.aggregateAsset('js', '../lib/lodash/dist/lodash.min.js',{
    weight: 3,
    global: true,
    absolute: false
  });

  /*

  Gmap.aggregateAsset('js', '../lib/lodash/dist/lodash.min.js', {
        absolute: false,
        weight:1   , // We want the googleapis to be loaded before
        global: true
    });
*/


  return Gmap;
});
