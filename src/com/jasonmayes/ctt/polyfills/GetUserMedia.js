/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.polyfills.GetUserMedia');



/**
 * Cross browser support to fetch the correct getUserMedia object.
 * @export
 */
com.jasonmayes.ctt.polyfills.GetUserMedia = (function() {
  'use strict';

  navigator['getUserMedia'] = navigator['getUserMedia'] ||
      navigator['webkitGetUserMedia'] || navigator['mozGetUserMedia'] ||
      navigator['msGetUserMedia'];
})();
