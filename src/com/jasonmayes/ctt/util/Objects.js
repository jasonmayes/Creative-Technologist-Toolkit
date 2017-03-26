/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.util.Objects');



/**
 * Common object utilities.
 * @export
 */
com.jasonmayes.ctt.util.Objects = (function() {
  'use strict';

  return {
    /**
     * Replace object property values with those from a partial or full object
     * whose property values match those in the original object.
     * @param {!Object} obj Original object you wish to modify.
     * @param {!Object} changedProperties Object with properties that
     * have changed to update the original object with.
     */
    replaceProperties: function(obj, changedProperties) {

      var optionsKeys = Object.keys(obj);
      for(var i = 0; i < optionsKeys.length; i++) {
        if (changedProperties.hasOwnProperty(optionsKeys[i])) {
          obj[optionsKeys[i]] = changedProperties[optionsKeys[i]];
        }
      }
    }
  };
})();
