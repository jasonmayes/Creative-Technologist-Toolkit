/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.multimedia.audio.AudioPlayer');

goog.require('com.jasonmayes.ctt.util.Logger');



/**
 * Simple Audio manager. This is not class, this is a singleton.
 * @typedef {{init: {Function}, loadSound: {Function}, playBuffer: {Function}, toggleAudioMute: {Function}, fadeVolume: {Function}}}
 * @export
 */
com.jasonmayes.ctt.multimedia.audio.AudioPlayer = (function() {
  'use strict';

  var logger = new com.jasonmayes.ctt.util.Logger();
  var context = null;
  var audioBuffers = [];
  var sources = [];
  var callback = null;
  var isMuted = false;

  var soundLoadInProgress = false;
  var loadBuffer = [];


  function soundLoadSuccess(buffer) {
    audioBuffers.push(buffer);
    callback(audioBuffers.length - 1);
    soundLoadInProgress = false;
    popQueue();
  }


  function soundLoadError(error) {
    logger.log('Error loading sound', logger.LogStates.ERROR);
    callback(-1);
    soundLoadInProgress = false;
    popQueue();
  }


  function popQueue() {
    if (loadBuffer.length > 0) {
      var tmp = loadBuffer.shift();
      com.jasonmayes.ctt.multimedia.audio.AudioPlayer.loadSound(tmp.url, tmp.cback);
    }
  }


  return {
    /**
     * Initiate sound engine.
     */
    init: function() {
      try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
        logger.log('Audio Player initiated.', logger.LogStates.INFO);
      }
      catch(e) {
        logger.log('Web Audio API not supported by browser', logger.LogStates.ERROR);
      }
    },

    loadSound: function(url, cback) {
      if (context !== null) {
        if (!soundLoadInProgress) {
          soundLoadInProgress = true;
          var request = new XMLHttpRequest();
          callback = cback;
          request.open('GET', url, true);
          request.responseType = 'arraybuffer';
          // Decode asynchronously
          request.onload = function() {
            context.decodeAudioData(request.response, soundLoadSuccess,
                soundLoadError);
          }
          request.send();
        } else {
          loadBuffer.push({'url':url, 'cback':cback});
        }
      } else {
        cback(-1);
      }
    },

    playBuffer: function(index, loop) {
      if ((context !== null) && (audioBuffers.length > 0)) {
        // Creates a sound source.
        sources.push(context.createBufferSource());
        var current = sources.length - 1;
        // Tell the source which sound to play.
        sources[current].buffer = audioBuffers[index];
        // Connect the source to the context's destination (the speakers).
        sources[current].connect(context.destination);
        // Force looping.
        sources[current].loop = loop;
        // Play the source now.
        sources[current].start(0);
      }
    },

    toggleAudioMute: function() {
      var i = sources.length;
      while (i--) {
        if (isMuted) {
          sources[i].gain.value = 1;
        } else {
          sources[i].gain.value = 0;
        }
        isMuted = !isMuted;
      }
    },

    /**
     * Take an audio src and fade the volume to a given value.
     * @param {Object} audioSrc The reference to the HTML5 audio/video element
     * we are controling volume for.
     * @param {number} level The volume level we want to achieve (to 2dp).
     * @param {Function} success Function to call when audio level reached.
     */
    fadeVolume: function (audioSrc, level, success) {
      var incrementor = 0.01;
      if (level < audioSrc.volume) {
        incrementor = -incrementor;
      }
      setTimeout(function(){
        try {
          audioSrc.volume += incrementor;
          if (((audioSrc.volume < level) && (incrementor > 0)) ||
              ((audioSrc.volume > level) && (incrementor < 0))) {
            com.jasonmayes.ctt.multimedia.audio.AudioPlayer.fadeVolume(audioSrc,
                level, success);
          } else {
            success();
          }
        } catch (e) {
          // exceeded bounds, drop out of recursion.
          success();
        }
      }, 42);
    }
  };
})();
