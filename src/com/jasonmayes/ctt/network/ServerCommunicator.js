/**
 * @author Jason Mayes (www.jasonmayes.com)
 */
goog.provide('com.jasonmayes.ctt.network.ServerCommunicator');


goog.require('com.jasonmayes.ctt.util.Logger');
goog.require('com.jasonmayes.ctt.util.Objects');

// TODO: Currently expects JSON response. Change so more generic or add option to assume JSON response and only parse if true. Split JSON parse to seperate function.

goog.scope(function() {
  'use strict';

  // Alias for easy referencing below.
  var Network = com.jasonmayes.ctt.network;


  /**
   * Send data to a server and receive the JSON response.
   * @param {!Object} newOptions One level deep object containing keys that
   * override one or more of: 'debug', 'server', 'path', or 'requestType'
   * @constructor
   * @export
   */
  Network.ServerCommunicator = function(newOptions) {
    /**
     * @private {!Object}
     */
    this.options_ = {
      debug: false,
      server: '//localhost',
      path: '/',
      requestType: 'POST'
    };

    // Set new options, if there are any.
    if (newOptions) {
      com.jasonmayes.ctt.util.Objects.replaceProperties(this.options_, newOptions);
    }
  };


  /**
   * Internal logger for all instances of this class.
   * @private
   */
  Network.ServerCommunicator.prototype.logger_ =
      new com.jasonmayes.ctt.util.Logger();


  /**
   * Sends data to the server as a form submit.
   * @param {Array.<Object>} formDataArr An array of objects containing keys
   * for 'name' and 'data' which will be used as the form field names and
   * values.
   * @param {function(*)} callbackSuccess Called upon successful data send
   * with JSON object returned from server.
   * @param {function(*)} callbackError Called upon error in data send
   * with JSON error object returned from server.
   * @export
   */
  Network.ServerCommunicator.prototype.sendFormData = function(formDataArr,
      callbackSuccess, callbackError) {

    if (this.options_.debug) {
      this.logger_.log('Sending image data to API',
          this.logger_.LogStates.DEBUG);
    }

    function handleStateChange() {
      var response = /** @type {string} */ (xhr.response);
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.processApiResponse(JSON.parse(response), callbackSuccess,
              callbackError);
        } else {
          try {
            callbackError(JSON.parse(response));
          } catch(e) {
            callbackError(JSON.parse('{"error": "API did not respond"}'));
          }
        }
      }
    }

    var xhr = new XMLHttpRequest();
    // Handle the responses.
    xhr.onreadystatechange = handleStateChange.bind(this);

    xhr.ontimeout = function() {
      callbackError(JSON.parse('{"error": "API request timed out"}'));
    };

    var formData = new FormData();
    for (var n = 0; n < formDataArr.length; n++) {
      formData.append(formDataArr[n].name, formDataArr[n].data);
    }

    xhr.timeout = 10000; // 10 seconds.
    xhr.open(this.options_.requestType, this.options_.server + this.options_.path);
    xhr.send(formData);
  };


  /**
   * Sends data to the server as text parameters in a POST request.
   * @param {string} textData A JSON encoded string to send.
   * @param {function(*)} callbackSuccess Called upon successful data send
   * with JSON object returned from server.
   * @param {function(*)} callbackError Called upon error in data send
   * with JSON error object returned from server.
   * @export
   */
  Network.ServerCommunicator.prototype.sendJsonData = function(textData,
      callbackSuccess, callbackError) {
    if (this.options_.debug) {
      this.logger_.log('Sending text data to API',
          this.logger_.LogStates.DEBUG);
    }

    function handleStateChange() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callbackSuccess(JSON.parse(xhr.response + ''));
        } else {
          try {
            callbackError(JSON.parse(xhr.response + ''));
          } catch(e) {
            callbackError(JSON.parse('{"error": "API did not respond"}'));
          }
        }
      }
    }

    var xhr = new XMLHttpRequest();
    // Handle the responses.
    xhr.onreadystatechange = handleStateChange.bind(this);

    // If we timeout.
    xhr.ontimeout = function() {
      callbackError(JSON.parse('{"error": "API request timed out"}'));
    };

    xhr.timeout = 10000; // 10 seconds.
    xhr.open(this.options_.requestType, this.options_.server + this.options_.path);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(textData);
  };


  /**
   * Process the response from the API.
   * @param {Object} data JSON object returned from server.
   * @param {function(Object)} callbackSuccess Called upon successful data send
   * with JSON object returned from server.
   * @param {function(Object)} callbackError Called upon error in data send
   * with JSON error object returned from server.
   * @export
   */
  Network.ServerCommunicator.prototype.processApiResponse = function(data,
      callbackSuccess, callbackError) {
    if (this.options_.debug) {
      this.logger_.log('Processing API responses',
                this.logger_.LogStates.DEBUG, data);
    }

    if (data.labels) {
      callbackSuccess(data);
    } else if (data.error) {
      if (this.options_.debug) {
        this.logger_.log('Error in results',
                this.logger_.LogStates.ERROR, data.error.message);
      }
      callbackError(data);
    }
  };

});
