/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.structs.Tuple');



goog.scope(function() {
  'use strict';

  // Alias for easy referencing below.
  var Structs = com.jasonmayes.ctt.structs;


  /**
   * Tuple of arbitary dimensionality.
   * @param {Array<number>} values Tuple values.
   * @constructor
   * @export
   */
  Structs.Tuple = function(values) {
    this.values_ = values;
  };


  /**
   * Return how many dimensions the tuple has.
   * @returns {number}
   * @export
   */
  Structs.Tuple.prototype.getDimensions = function() {
    return this.values_.length;
  };


  /**
   * Return how many dimensions the tuple has.
   * @returns {Array<number>}
   * @export
   */
  Structs.Tuple.prototype.getValues = function() {
    return this.values_;
  };

});
