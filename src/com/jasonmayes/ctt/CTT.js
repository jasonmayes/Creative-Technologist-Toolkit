/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.CTT');

goog.require('com.jasonmayes.ctt.classification.KNN');
goog.require('com.jasonmayes.ctt.multimedia.audio.AudioPlayer');
goog.require('com.jasonmayes.ctt.multimedia.video.MediaSampler');
goog.require('com.jasonmayes.ctt.network.ServerCommunicator');
goog.require('com.jasonmayes.ctt.polyfills.GetUserMedia');
goog.require('com.jasonmayes.ctt.polyfills.RequestAnimationFrame');
goog.require('com.jasonmayes.ctt.polyfills.VisibilityChange');
goog.require('com.jasonmayes.ctt.polyfills.WindowUrl');
goog.require('com.jasonmayes.ctt.structs.Tuple');
goog.require('com.jasonmayes.ctt.structs.LabelledTuple');
goog.require('com.jasonmayes.ctt.util.Logger');
goog.require('com.jasonmayes.ctt.util.Objects');



/**
 * A library for things that actually matter.
 * @constructor
 * @export
 */
com.jasonmayes.ctt.CTT = function() {

};
