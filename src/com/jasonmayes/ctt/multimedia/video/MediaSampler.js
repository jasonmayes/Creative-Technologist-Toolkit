/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.multimedia.video.MediaSampler');

goog.require('com.jasonmayes.ctt.polyfills.GetUserMedia');
goog.require('com.jasonmayes.ctt.polyfills.RequestAnimationFrame');
goog.require('com.jasonmayes.ctt.polyfills.VisibilityChange');
goog.require('com.jasonmayes.ctt.polyfills.WindowUrl');
goog.require('com.jasonmayes.ctt.util.Logger');



goog.scope(function() {
  'use strict';

  // Alias for easy referencing below.
  var Video = com.jasonmayes.ctt.multimedia.video;


  /**
   * Associates a canvas with a video or webcam stream.
   * @param {string} canvasId DOM ID of canvas we wish to render to.
   * @param {string} videoId DOM ID of video element we want to get data from.
   * @param {number} interval Number of miliseconds at which we want to sample
   * the video at.
   * @param {Function} callback Function to call after each interval with data.
   * @param {boolean} debug Print debug messages.
   * @param {{videoSrcSelectId: !string, audioSrcSelectId: !string,
   * audioDestSelectId: !string}=} opt_options An object mapping DOM select
   * element IDs for the purpose of changing webcam, audio source, and audio
   * destinations. One or more of the properties can be specified.
   * @constructor
   * @export
   */
  Video.MediaSampler = function(canvasId, videoId, interval, callback, debug,
      opt_options) {

    /** @private {boolean} */
    this.DEBUG_ = debug;
    /** @private {number} */
    this.MIN_ANALYZE_INTERVAL_ = (interval > 30) ? interval : 30;
    /** @private {Function} */
    this.callback_ = callback;
    /** @private {Function} */
    this.vidSuccessCallback_ = function() {};
    /** @private {number} */
    this.lastAnalyzeTime_ = 0;
    /** @private {boolean} */
    this.pageIsVisible_ = true;
    /** @private {?HTMLCanvasElement} */
    this.canvas_ = /** @type HTMLCanvasElement */
        (document.getElementById(canvasId));
    /** @private {?HTMLVideoElement} */
    this.video_ = /** @type HTMLVideoElement */
        (document.getElementById(videoId));
    /** @private {CanvasRenderingContext2D} */
    this.ctx_ = /** @type {CanvasRenderingContext2D} */
        (this.canvas_.getContext('2d'));
    /** @private {ImageData} */
    this.imgData_ = null;
    /** @private {boolean} */
    this.captureMedia_ = false;
    /** @private {boolean} */
    this.webcamStarted_ = false;
    /** @private {string} */
    this.pvHidden_ = com.jasonmayes.ctt.polyfills.VisibilityChange.pvHidden;
    /** @private {string} */
    this.pvVisibilityChange_ = com.jasonmayes.ctt.polyfills.VisibilityChange.pvVisibilityChange;

    // Check if advanced options passed for video/audio src and destination.
    if (opt_options !== undefined) {
      this.selectors_ = [];
      var foundOne = false;
      if (opt_options.audioSrcSelectId !== undefined) {
        this.audioInputSelect_ =
            document.getElementById(opt_options.audioSrcSelectId);
        this.audioInputSelect_.addEventListener('change',
            this.inputDeviceChanged_.bind(this));
        this.selectors_.push(this.audioInputSelect_);
        foundOne = true;
      }
      if (opt_options.audioDestSelectId !== undefined) {
        this.audioOutputSelect_ =
            document.getElementById(opt_options.audioDestSelectId);
        this.audioOutputSelect_.addEventListener('change',
            this.changeAudioDestination_.bind(this));
        this.selectors_.push(this.audioOutputSelect_);
        foundOne = true;
      }
      if (opt_options.videoSrcSelectId !== undefined) {
        this.videoSelect_ = document.getElementById(opt_options.videoSrcSelectId);
        this.videoSelect_.addEventListener('change',
            this.inputDeviceChanged_.bind(this));
        this.selectors_.push(this.videoSelect_);
        foundOne = true;
      }
      if (foundOne) {
        navigator.mediaDevices.enumerateDevices().then(this.gotDevices_
            .bind(this)).catch(this.videoStreamError_.bind(this));
      }
    }

    /**
     * Handle a change in page visibility.
     */
    function handleVisibilityChange() {
      if (document[this.pvHidden_]) {
        this.pageIsVisible_ = false;
      } else {
        this.pageIsVisible_ = true;
      }
      if (this.DEBUG_) {
        this.logger_.log('Visibility: ' + this.pageIsVisible_,
            this.logger_.LogStates.DEBUG);
      }
    }

    document.addEventListener(this.pvVisibilityChange_,
        handleVisibilityChange.bind(this));
  };


  /**
   * Internal logger for all instances of this class.
   * @private
   */
  Video.MediaSampler.prototype.logger_ = new com.jasonmayes.ctt.util.Logger();


  /**
   * Change which speakers to broadcast to.
   * @private
   */
  Video.MediaSampler.prototype.changeAudioDestination_ = function() {
    var audioDestination = this.audioOutputSelect_.value;

    if (typeof this.video_.sinkId !== 'undefined') {
      this.video_.setSinkId(audioDestination)
      .then(function() {
        if (this.DEBUG_) {
          this.logger_.log('Success, audio output device attached: ' +
              audioDestination, this.logger_.LogStates.DEBUG);
        }
      })
      .catch(function(error) {
        if (this.DEBUG_) {
          var errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = 'You need to use HTTPS for selecting audio ' +
                'output device: ' + error;
          }
          this.logger_.log(errorMessage, this.logger_.LogStates.ERROR);
        }
        // Jump back to first output device in the list as it's the default.
        this.audioOutputSelect_.selectedIndex = 0;
      });
    } else {
      if (this.DEBUG_) {
        this.logger_.log('Browser does not support output device selection.',
            this.logger_.LogStates.WARNING);
      }
    }
  };


  /**
   * Swap stream to newly selected input device.
   * @private
   */
  Video.MediaSampler.prototype.inputDeviceChanged_ = function() {
    this.video_.pause();
    var constraints = {};

    if (this.audioInputSelect_) {
      var audioSource = this.audioInputSelect_.value;
      constraints.audio =
          {deviceId: audioSource ? {exact: audioSource} : undefined};
    }

    if (this.videoSelect_) {
      var videoSource = this.videoSelect_.value;
      constraints.video =
          {deviceId: videoSource ? {exact: videoSource} : undefined};
    }

    navigator.getUserMedia(constraints, this.videoStreamSuccess_.bind(this),
        this.videoStreamError_.bind(this));
  };


  /**
   * Handle the discovery of devices to populate selects if specified.
   * @private
   */
  Video.MediaSampler.prototype.gotDevices_ = function(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    var values = this.selectors_.map(function(select) {
      return select.value;
    });

    this.selectors_.forEach(function(select) {
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
    });

    for (var i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      var option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput' && this.audioInputSelect_) {
        option.text = deviceInfo.label ||
            'microphone ' + (this.audioInputSelect_.length + 1);
        this.audioInputSelect_.appendChild(option);
      } else if (deviceInfo.kind === 'audiooutput' && this.audioOutputSelect_) {
        option.text = deviceInfo.label || 'speaker ' +
            (this.audioOutputSelect_.length + 1);
        this.audioOutputSelect_.appendChild(option);
      } else if (deviceInfo.kind === 'videoinput' && this.videoSelect_) {
        option.text = deviceInfo.label || 'camera ' +
            (this.videoSelect_.length + 1);
        this.videoSelect_.appendChild(option);
      } else {
        if (this.DEBUG_) {
          this.logger_.log('Some other kind of source/device: ',
              this.logger_.LogStates.INFO, deviceInfo);
        }
      }
    }
    this.selectors_.forEach(function(select, selectorIndex) {
      if (Array.prototype.slice.call(select.childNodes).some(function(n) {
        return n.value === values[selectorIndex];
      })) {
        select.value = values[selectorIndex];
      }
    });
  };


  /**
   * Main loop that keeps canvas object up to date with latest data from video
   * stream.
   * @private
   */
  Video.MediaSampler.prototype.sampleVideoStream_ = function() {
    if (this.captureMedia_ && this.webcamStarted_) {
      if (((Date.now() - this.lastAnalyzeTime_) > this.MIN_ANALYZE_INTERVAL_) &&
          this.pageIsVisible_) {
        try {
          this.canvas_.width = this.video_.offsetWidth;
          this.canvas_.height = this.video_.offsetHeight;

          this.ctx_.drawImage(this.video_, 0, 0, this.video_.offsetWidth,
              this.video_.offsetHeight);
          this.imgData_ = this.ctx_.getImageData(0, 0, this.canvas_.width,
              this.canvas_.height);
          this.ctx_.putImageData(this.imgData_, 0, 0);

          this.callback_();
          this.lastAnalyzeTime_ = Date.now();

        } catch (e) {
          if (this.DEBUG_) {
            this.logger_.log(e, this.logger_.LogStates.DEBUG);
          }
        }
      }
    }
    if (this.captureMedia_) {
      requestAnimFrame(this.sampleVideoStream_.bind(this));
    }
  };



  /**
   * Intitiate playing of the video.
   * @private
   */
  Video.MediaSampler.prototype.videoInitPlay_ = function() {
    try {
      this.video_.play();
    } catch(e) {
      this.vidSuccessCallback_(e);
    }
    this.webcamStarted_ = true;
    if (this.vidSuccessCallback_) {
      this.vidSuccessCallback_();
    }
  };


  /**
   * Initiate a webcam stream into a video object.
   * @param {!MediaStream} stream
   * @private
   */
  Video.MediaSampler.prototype.videoStreamSuccess_ = function(stream) {
    // Create a new object URL to use as the video's source.
    this.video_.src = /** @type {string} */ (window.URL &&
        window.URL.createObjectURL(stream));

    this.videoInitPlay_();
  };


  /**
   * Handle webcam stream fail.
   * @private
   */
  Video.MediaSampler.prototype.videoStreamError_ = function() {
    if (this.DEBUG_) {
      this.logger_.log('Video error.', this.logger_.LogStates.ERROR);
    }
  };


  /**
   * Start capturing data from user's webcam.
   * @param {Function} successCallback Function to call once source has
   * successfully started.
   * @param {string=} opt_videoUrl Optionally pass video URL to load instead.
   * @export
   */
  Video.MediaSampler.prototype.start = function(successCallback,
      opt_videoUrl) {
    this.captureMedia_ = true;
    this.webcamStarted_ = false;
    this.vidSuccessCallback_ = successCallback;

    if (opt_videoUrl) {
      this.video_.src = opt_videoUrl;
      this.videoInitPlay_();
    } else {
      if (navigator.getUserMedia) {
        // Ask for permission to use the webcam.
        if (this.videoSelect_ !== undefined) {
          this.inputDeviceChanged_();
        } else {
          navigator.getUserMedia({video: true},
              this.videoStreamSuccess_.bind(this),
              this.videoStreamError_.bind(this));
        }
      } else {
        // Not supported by browser.
        this.logger_.log('Your browser does not support getUserMedia',
            this.logger_.LogStates.ERROR);
      }
    }

    requestAnimFrame(this.sampleVideoStream_.bind(this));
    return this.captureMedia_;
  };


  /**
   * Stop capturing data from the webcam.
   * @param {Function} successCallback Function to call once source has
   * successfully stopped.
   * @export
   */
  Video.MediaSampler.prototype.stop = function(successCallback) {
    this.captureMedia_ = false;
    this.webcamStarted_ = false;
    this.video_.pause();
    this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
    if (successCallback) {
      successCallback();
    }
    return this.captureMedia_;
  };


  /**
   * Toggle capture.
   * @param {Function} successCallback Function to call once source has
   * successfully started or stopped.
   * @export
   */
  Video.MediaSampler.prototype.toggle = function(successCallback) {
    return this.captureMedia_ ? this.stop(successCallback) : this.start(successCallback);
  };


  /**
   * Take a JPG snapshot of the current canvas at a desired quality level.
   * @param {number} quality A value between 0 and 1 representing JPG
   * percentage compression level.
   * @export
   */
  Video.MediaSampler.prototype.takeCanvasSnapshot = function(quality) {
    quality = quality ? quality : 0.65;
    return this.canvas_.toDataURL('image/jpeg', quality);
  };

});
