/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.polyfills.VisibilityChange');



goog.scope(function() {
  'use strict';

  var pf = com.jasonmayes.ctt.polyfills;


  /**
   * Page Visibility.
   * @type {{pvHidden: string, pvVisibilityChange: string}}
   * @export
   */
  pf.VisibilityChange = (function() {
    /** @type {string} */
    var pvHidden = '';
    /** @type {string} */
    var pvVisibilityChange = '';

    if (typeof document['hidden'] !== 'undefined') {
      pvHidden = 'hidden';
      pvVisibilityChange = 'visibilitychange';
    } else if (typeof document['mozHidden'] !== 'undefined') {
      pvHidden = 'mozHidden';
      pvVisibilityChange = 'mozvisibilitychange';
    } else if (typeof document['msHidden'] !== 'undefined') {
      pvHidden = 'msHidden';
      pvVisibilityChange = 'msvisibilitychange';
    } else if (typeof document['webkitHidden'] !== 'undefined') {
      pvHidden = 'webkitHidden';
      pvVisibilityChange = 'webkitvisibilitychange';
    }

    return {
      'pvHidden': pvHidden,
      'pvVisibilityChange': pvVisibilityChange
    };
  })();
});
