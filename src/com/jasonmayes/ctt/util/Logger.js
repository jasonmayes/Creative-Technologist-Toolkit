/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.util.Logger');



goog.scope(function() {
  'use strict';

  // Alias for easy referencing below.
  var Util = com.jasonmayes.ctt.util;


  /**
   * Class for common logging functionality, including direct DOM logging.
   * @param {Element=} opt_domElement Optionally pass the DOM element to log
   * to when calling domLog(). Saves having to pass it each time in the future.
   * @constructor
   * @export
   */
  Util.Logger = function(opt_domElement) {
    if (opt_domElement !== undefined) {
      this.element_ = opt_domElement;
    }
  };



  /**
   * Logging status types.
   * @enum {string}
   * @export
   */
  Util.Logger.prototype.LogStates = {
    LOG: 'log',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    DEBUG: 'debug'
  };


  /**
   * Log to console.
   * @param {string} msg Text to log.
   * @param {string} level Log level type.
   * @param {Object=} opt_obj Optional object to pass to be printed.
   * @export
   */
  Util.Logger.prototype.log = function(msg, level, opt_obj) {
    switch (level) {
      case this.LogStates.LOG:
        opt_obj ? console.log(msg, opt_obj) : console.log(msg);
        break;
      case this.LogStates.DEBUG:
        opt_obj ? console.debug(msg, opt_obj) : console.debug(msg);
        break;
      case this.LogStates.INFO:
        opt_obj ? console.info(msg, opt_obj) : console.info(msg);
        break;
      case this.LogStates.WARNING:
        opt_obj ? console.warn(msg, opt_obj) : console.warn(msg);
        break;
      case this.LogStates.ERROR:
        opt_obj ? console.error(msg, opt_obj) : console.error(msg);
        break;
      default:
        opt_obj ? console.log(msg, opt_obj) : console.log(msg);
    }
  }


  /**
   * Log to DOM.
   * @param {string} msg Text to log.
   * @param {string} level Log level type.
   * @param {Element=} opt_element DOM element to append log text.
   * @export
   */
  Util.Logger.prototype.domLog = function(msg, level, opt_element) {
    var p = document.createElement('p');
    p.textContent = msg;
    p.setAttribute('class', level + ' msg');
    if (opt_element === undefined && this.element_ !== undefined) {
      this.element_.appendChild(p);
    } else {
      opt_element.appendChild(p);
    }
  };

});
