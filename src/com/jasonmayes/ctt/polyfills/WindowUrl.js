/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.polyfills.WindowUrl');



/**
 * Cross browser support for window.URL.
 * @export
 */
com.jasonmayes.ctt.polyfills.WindowUrl = (function() {
  'use strict';

  window['URL'] = window['URL'] || window['webkitURL'] || window['mozURL'] ||
      window['msURL'];
})();
