/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.classification.KNN');

goog.require('com.jasonmayes.ctt.structs.LabelledTuple');
goog.require('com.jasonmayes.ctt.util.Logger');



goog.scope(function() {
  'use strict';

  // Alias for easy referencing below.
  var Classification = com.jasonmayes.ctt.classification;


  /**
   * K Nearest Neighbour classifier.
   * @param {number} k How many neighbours to use in classification.
   * @param {Array<com.jasonmayes.ctt.structs.LabelledTuple>} neighbours An
   *   array of labelled tuples of same dimensionality.
   * @constructor
   * @export
   */
  Classification.KNN = function(k, neighbours) {
    this.k_ = k;
    this.neighbours_ = (neighbours === undefined) ? [] : neighbours;
    this.labels_ = [];
  };


  /**
   * Internal logger for all instances of this class.
   * @private
   */
  Classification.KNN.prototype.logger_ = new com.jasonmayes.ctt.util.Logger();


  /**
   * Generate a JS safe variable name version of a a string.
   * @param {string} text Unsafe text.
   * @returns {string}
   * @private
   */
  Classification.KNN.prototype.textToVarName_ = function(text) {
    return text.replace(/[\W_]+/g, '');
  };



  /**
   * Calculate the euclidean distance between two points of the same
   *     dimensionality.
   * @param {Array<number>} a First point.
   * @param {Array<number>} b Second point.
   * @returns {number}
   * @private
   */
  Classification.KNN.prototype.calculateEuclideanDistance_ = function(a, b) {
    var sumDeltas_ = 0;

    if (a.length !== b.length) {
      this.logger_.log('All neighbours and points to be classified using KNN ' +
          'should have same dimensionality.', this.logger_.LogStates.WARNING);
    }

    // Calculate in lower dimensions if not equal dimensions.
    for (var n = 0; n < Math.min(a.length, b.length); n++) {
      sumDeltas_ += Math.pow(a[n] - b[n], 2);
    }

    return Math.sqrt(sumDeltas_);
  };


  /**
   * Compares two result objects from classification by distance.
   * @param {Object} a First object.
   * @param {Object} b Second object.
   * @returns {number}
   * @private
   */
  Classification.KNN.prototype.compare_ = function(a, b) {
    return (a.distance === b.distance) ? 0 : ((a.distance < b.distance) ? -1 : 1);
  };


  /**
   * Add another neighbour to be used in calculations.
   * @param {com.jasonmayes.ctt.structs.LabelledTuple} labelledTuple A new
   *     labelled data point to add.
   * @export
   */
  Classification.KNN.prototype.add = function(labelledTuple) {
    this.neighbours_.push(labelledTuple);
  };


  /**
   * Classify a tuple. Returns most likely label.
   * @param {Array<number>} tuple An unlabelled tuple to classify which is of
   *     same dimensionality as our neighbours.
   * @returns {string}
   * @export
   */
  Classification.KNN.prototype.classify = function(unlabelledTuple) {
    // TODO: @JasonMayes optimize by presorting tuples and then finding ones
    // already somewhat close to the one wanting to be classified to minimize
    // search space.

    // TODO: @JasonMayes Normalize tuple dimensions to avoid issues when one
    // dimension is much larger scale than other?
    var closestK_ = [];
    var lastClosestK = this.k_ - 1;

    for (var n = 0; n < this.neighbours_.length; n++) {
      // Keep track of labels and counts for stats.
      var safeLabel = 'JML_' + this.textToVarName_(this.neighbours_[n].getLabel());
      this.labels_[safeLabel] = (this.labels_[safeLabel] === undefined) ?
          1 : this.labels_[safeLabel] + 1;

      var distance = this.calculateEuclideanDistance_(unlabelledTuple,
          this.neighbours_[n].getValues());
      // Initially populate closest with first k elements found.
      if (closestK_.length < this.k_) {
        closestK_.push({
            'label': this.neighbours_[n].getLabel(),
            'distance': distance
        });
        closestK_.sort(this.compare_);
      } else {
        // Replace last closestK if something is less than the current top K
        // shortest distances.
        if (distance < closestK_[lastClosestK].distance) {
          closestK_.splice(lastClosestK);
          closestK_.push({
              'label': this.neighbours_[n].getLabel(),
              'distance': distance
          });
          closestK_.sort(this.compare_);
        }
      }
    }

    // Find the most common nearest neighbour label.
    var closestKLabelCounts_ = [];
    var bestLabelCount = 0;
    var bestLabel = '';

    for (var i = 0; i < closestK_.length; i++) {
      var safeVar = 'JMC_' + this.textToVarName_(closestK_[i].label);
      if (closestKLabelCounts_[safeVar] === undefined) {
        closestKLabelCounts_[safeVar] = {
            'label': closestK_[i].label,
            'count': 1
        };
      } else {
        closestKLabelCounts_[safeVar].count++;
      }
      if (closestKLabelCounts_[safeVar].count > bestLabelCount) {
        bestLabelCount = closestKLabelCounts_[safeVar].count;
        bestLabel = closestKLabelCounts_[safeVar].label;
      }
    }

    return {'result': bestLabel, 'data': closestKLabelCounts_};
  };
});
