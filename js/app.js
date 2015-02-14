// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(start);

  // ---

  function start() {

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations

    settingFirstPosition();
    initHttpd();
  }

  function settingFirstPosition() {
    var geo = Geoloc.getInstance();
    var currentPos = geo.getCurrentPosition();
    currentPos.then((pos) => {
      var mapFrame = document.getElementById('map_frame');
      var posStr = JSON.stringify({
        "coords": {
          "accuracy": pos.coords.accuracy,
          "altitude": pos.coords.altitude,
          "altitudeAccuracy": pos.coords.altitudeAccuracy,
          "heading": pos.coords.heading,
          "latitude": pos.coords.latitude,
          "longitude": pos.coords.longitude,
          "speed": pos.coords.speed
        },
        "timestamp": pos.timestamp
      });
      mapFrame.contentWindow.postMessage('current:' + posStr, 'http://aoitan.github.io');
    }).catch((error) => {
      console.log(error);
    });
  }

  var httpServer = null;
  var HTTP_405 = new HttpError(405, 'Method Not Allowed');

  function initHttpd() {
    httpServer = new HttpServer();
    httpServer.start(5000);
    httpServer.get('/simple', (request, response, oncomplete) => {
      //var params = querySplit(request.queryString);
      if (request.Method === 'POST') {
        var geo = Geoloc.getInstance();
        var cp = geo.getCurrentPosition();
        cp.then((pos) => {
          // サーバたたく
          console.log('POST request received');
        });
        oncomplete();
      } else {
        oncomplete(HTTP_501);
      }
    });
    httpServer.get('/detail', (request, response, oncomplete) => {
    });
  }

  /*
  function querySplit(query) {
    var params = [];
    query.split('&').forEach((item) => {
      var kv = item.split('=');
      params.push({kv[0]: kv[1]});
    });
    return params;
  }
  */
});
