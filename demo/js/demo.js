/**
 * Examples for using all key parts of CTT.
 * @author Jason Mayes (www.jasonmayes.com)
 */

var j = new com.jasonmayes.ctt.CTT();


var audioManager = com.jasonmayes.ctt.multimedia.audio.AudioPlayer;
audioManager.init();




var logger =
    new com.jasonmayes.ctt.util.Logger(document.querySelector('#console'));
logger.domLog('CTT Created!', logger.LogStates.INFO);
logger.domLog('CTT Created!', logger.LogStates.WARNING);
logger.domLog('CTT Created!', logger.LogStates.LOG);
logger.domLog('CTT Created!', logger.LogStates.ERROR);
logger.domLog('CTT Created!', logger.LogStates.DEBUG);




var sc = new com.jasonmayes.ctt.network.ServerCommunicator({
    debug: true,
    server: '//httpbin.org/',
    path: '/post',
    requestType: 'POST'
});

var payload = [
  {
    'name': 'bob',
    'data': '23'
  }
];

function onSuccess(data) {
  console.log(data);
}

function onError (error) {
  console.log(error);
}

sc.sendJsonData(JSON.stringify(payload), onSuccess, onError);




function analyzeStream() {
  console.log('Canvas updated, do something...');
}

var MEDIA_OPTIONS = {
  'videoSrcSelectId': 'videoSource'
};

// Force live canvas update to be no more than 30 FPS.
var media = new com.jasonmayes.ctt.multimedia.video.MediaSampler('canvas',
    'video', 1000, analyzeStream, true, MEDIA_OPTIONS);

media.start(function() { console.log("Media Started."); }, '../demo/big_buck_bunny.mp4');


// KNN Classification test.

var LT = com.jasonmayes.ctt.structs.LabelledTuple;

var neighbours = [];

for (var n = 0; n < 50; n++) {
  var x = Math.floor(Math.random() * 100);
  var y = Math.floor(Math.random() * 100);
  var z = Math.floor(Math.random() * 100);
  neighbours.push(new LT('low', [x, y, z]));
}

for (var n = 0; n < 50; n++) {
  var x = Math.floor(Math.random() * 100) + 100;
  var y = Math.floor(Math.random() * 100);
  var z = Math.floor(Math.random() * 100) + 50;
  neighbours.push(new LT('high', [x, y, z]));
}

var knn = new com.jasonmayes.ctt.classification.KNN(5, neighbours);

console.log(knn.classify([100, 21, 40]));