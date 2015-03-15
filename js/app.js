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

　var TYPE_POISON_GUS        = 1; // 毒ガス
　var TYPE_SULFIDIZING_GUS   = 2; // 硫黄化合物
　var TYPE_ALCOHOL           = 3; // アルコール
　var TYPE_ATMOSPHERE        = 4; // 気圧
　var TYPE_DUST              = 5; // ほこり
　var TYPE_RADIO_RAY         = 6; // 放射線量
　var TYPE_WIRETAPPING_RADIO = 7; // 盗聴電波
  var TYPE_TABACO            = 8; // タバコ


  function postPosMessage(cmd, id, pos, type) {
    var mapFrame = document.getElementById('map_frame');
    var posStr = JSON.stringify({
      "id": id,
      "type": type,
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
    postPosMessage('current', -1, pos, -1);
  }

  function postMakeMarker(id, pos, type) {
    postPosMessage('marker', id, pos, type);
  }

  function postMakeMarkerLatLng(id, lat, lng, type) {
    var mapFrame = document.getElementById('map_frame');
    mapFrame.contentWindow.postMessage('latlng:' + JSON.stringify({'id': id, 'lat': lat, 'lng': lng, 'type': type}), 'http://aoitan.github.io');
  }

  function settingFirstPosition() {
    var geo = Geoloc.getInstance();
    var currentPos = geo.getCurrentPosition();
    currentPos.then((pos) => {
      postCurrentPosition(pos);

      geo.watchPosition(
          (pos) => {
            postCurrentPosition(pos);
          }, (err) => {
            console.log(error);
          }, {
            enableHighAccuracy: true,
            maximumAge: 60 * 60 * 1000
          });

      // 危険地帯取得してピン立て
      // http://firefox-team9.azurewebsites.net/smoking/get_warning
      Database.getInstance().getWarning(pos, 10000, 0)
        .then((resp) => {
          resp.data.forEach((item) => {
            console.log('pin lat=' + item.lat + ', lng=' + item.lng);
            postMakeMarkerLatLng(item.id, item.lat, item.lng, item.type);
          });
        }).catch((err) => {
          console.log('error: ' + err);
        });
    }).catch((error) => {
      console.log(error);
    });
  }

  var httpServer = null;

  function floor(value, ratio) {
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
/*/
          if (request.Method === 'POST') {
//*/
            console.log('POST request received');

            // サーバたたく
            // http://firefox-team9.azurewebsites.net/smoking/add
            var xhr = new XMLHttpRequest({mozSystem: true});
            xhr.onload = () => {
              console.log('status: ' + xhr.responseText);
              var resp = JSON.parse(xhr.responseText);
              if  (resp.id) {
                var type = (params.type)? params.type: TYPE_TABACO;
                postMakeMarker(resp.id, pos, params.type);
              }
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
            response.write('200 OK');
            oncomplete();
/*/
          } else {
            response.write('501 Not Implemented');
            oncomplete(HTTP_501);
          }
//*/
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

