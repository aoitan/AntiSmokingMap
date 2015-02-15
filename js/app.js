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

  function postPosMessage(cmd, pos) {
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
    mapFrame.contentWindow.postMessage(cmd + ':' + posStr, 'http://aoitan.github.io');
  }

  function postCurrentPosition(pos) {
    postPosMessage('current', pos);
  }

  function postMakeMarker(pos) {
    postPosMessage('marker', pos);
  }

  function postMakeMarkerLatLng(lat, lng) {
    var mapFrame = document.getElementById('map_frame');
    mapFrame.contentWindow.postMessage('latlng:' + JSON.stringify({'lat': lat, 'lng': lng}), 'http://aoitan.github.io');
  }

  function settingFirstPosition() {
    var geo = Geoloc.getInstance();
    var currentPos = geo.getCurrentPosition();
    currentPos.then((pos) => {
      postCurrentPosition(pos);

      // 危険地帯取得してピン立て
      // http://firefox-team9.azurewebsites.net/smoking/get_warning
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.onload = () => {
        //console.log('status: ' + xhr.responseText);
        var resp = JSON.parse(xhr.responseText);
        resp.data.forEach((item) => {
          //console.log('pin lat=' + item.lat + ', lng=' + item.lng);
          postMakeMarkerLatLng(item.lat, item.lng);
        });
      };
      xhr.onerror = (err) => {
        console.log('error: ' + err);
      };
      xhr.open('GET', 'http://firefox-team9.azurewebsites.net/smoking/get_warning?' +
                       'lat=' + pos.coords.latitude +
                       '&lng=' + pos.coords.longitude +
                       '&rad=' + 10000);
      xhr.send();
    }).catch((error) => {
      console.log(error);
    });
  }

  var httpServer = null;

  function floor(val, ratio) {
    return Math.floor(value + ratio) / ratio;
  }

  function initHttpd() {
    httpServer = new HttpServer();
    httpServer.start(5000);
    httpServer.get('/simple', (request, response, oncomplete) => {
      console.log('request /simple');
      var params = querySplit(request.queryString);
      var geo = Geoloc.getInstance();
      var cp = geo.getCurrentPosition()
        .then((pos) => {
          console.log('get position ' + pos);

          // 位置更新
          postCurrentPosition(pos);
          return pos;
        }).then((pos) => {
/*
          if (request.Method === 'POST') {
*/
            console.log('POST request received');

            // サーバたたく
            // http://firefox-team9.azurewebsites.net/smoking/add
            var xhr = new XMLHttpRequest({mozSystem: true});
            xhr.onload = () => {
              console.log('status: ' + xhr.responseText);
            };
            xhr.onerror = (err) => {
              console.log('error: ' + err);
            };
            var lat = floor(pos.coords.latitude, 10000000000); // 10桁丸め
            var lng = floor(pos.coords.longitude, 10000000000); // 10桁丸め
            xhr.open('POST', 'http://firefox-team9.azurewebsites.net/smoking/add?' +
                             'lat=' +  +
                             '&lng=' + pos.coords.longitude);
            xhr.send();
            postMakeMarker(pos);
            response.write('200 OK');
            oncomplete();
/*
          } else {
            response.write('501 Not Implemented');
            oncomplete(HTTP_501);
          }
*/
        });
    });
    httpServer.get('/detail', (request, response, oncomplete) => {
      oncomplete(HTTP_501);
    });
  }

  function querySplit(query) {
    var params = [];
    query.split('&').forEach((item) => {
      var kv = item.split('=');
      var key = kv[0];
      var value = kv[1];
      params.push({key: value});
    });
    return params;
  }
});

