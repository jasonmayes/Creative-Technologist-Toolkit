/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.structs.LabelledTuple');

goog.require('com.jasonmayes.ctt.structs.Tuple');



goog.scope(function() {
  'use strict';

  // Alias for easy referencing below.
  var Structs = com.jasonmayes.ctt.structs;
  var Tuple = com.jasonmayes.ctt.structs.Tuple;


  /**
   * Tuple of arbitary dimensionality.
   * @param {string} label Classification label.
   * @param {Array<number>} values Tuple's value.
   * @constructor
   * @export
   */
  Structs.LabelledTuple = function(label, values) {
    this.values_ = new Tuple(values);
    this.label_ = label;
  };


  /**
   * Returns the current label for this labelled tuple.
   * @returns {string}
   * @export
   */
  Structs.LabelledTuple.prototype.getLabel = function () {
    return this.label_;
  };


  /**
   * Return how many dimensions the tuple has.
   * @returns {Array<number>}
   * @export
   */
  Structs.LabelledTuple.prototype.getValues = function () {
    return this.values_.getValues();
  };


  /**
   * Tuple of arbitary dimensionality.
   * @param {Array<number>} values Tuple's value.
   * @export
   */
  Structs.LabelledTuple.prototype.replaceValues = function (values) {
    this.values_ = values;
  };
});
