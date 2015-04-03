

/**
 * Directive to change the size of an element when the window is loaded, and on window resize
 * This ensures the gmap always spans the viewport of the page
 */

'use strict';

angular.module( 'mean.pollution')
  .directive('resize', function ($window) {
  return function (scope, element) {

    var w = angular.element($window);
    var changeHeight = function() {

      element.css('height', (w.height() -20) + 'px' );};

      w.bind('resize', function () {
        changeHeight();   // when window size gets changed
      });

      changeHeight(); // when page loads
  };
});