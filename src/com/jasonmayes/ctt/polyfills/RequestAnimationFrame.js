/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.polyfills.RequestAnimationFrame');



/**
 * RequestAnimationFrame shim with setTimeout fallback.
 * @export
 */
com.jasonmayes.ctt.polyfills.RequestAnimationFrame = (function() {
  'use strict';

  window['requestAnimFrame'] = (function(){
    return  window['requestAnimationFrame'] ||
        window['webkitRequestAnimationFrame'] ||
        window['mozRequestAnimationFrame'] ||
        function(callback) {
          window.setTimeout(callback, 1000 / 30);
        };
  })();
})();
