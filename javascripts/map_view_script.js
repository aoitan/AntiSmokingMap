var map;
function map_view_loading() {
    var geo = navigator.geolocation;
    if (geo) {
        geo.getCurrentPosition(
            function (position) {
                window.console.log("測位成功: " + position.coords.latitude + ", " + position.coords.longitude);
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.panTo(latlng);
            },
            function (error) {
                window.alert("測位エラー: " + error.code);
            },
            {
                timeout: 10000
            }
        );
        mapView(35.6853264, 139.7530997);
    } else {
        window.alert("geolocation is null");
    }
}

function mapView(latitude, longitude) {
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
}

function makeMarker(file)
{
    // 画像のURL
    var url = window.URL.createObjectURL(file);

    // 画像サイズ取得
    var reader = new FileReader();
    reader.addEventListener('load', function(e) {
        var img = new Image();
        img.addEventListener('load', function (inE) {
            var imgObj = inE.target;

            // 高さが32になるように拡縮倍率を計算
            var height = imgObj.naturalHeight;
            var width = imgObj.naturalWidth;
            var scale = 32 / height;

            // 倍率をかけた幅
            var scaledWidth = width * scale;

            // マーカー画像
            var icon = new google.maps.MarkerImage(url,
                new google.maps.Size(width, height),
                new google.maps.Point(0, 0),
                new google.maps.Point(0, 0),
                new google.maps.Size(scaledWidth, 32));

            // 位置情報
            var pos = map.getCenter();

            // マーカーを作る
            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                icon: icon
            });

            // マーカーがクリックされたときに表示するinfoウィンドウを作る
            var infoWindow = new google.maps.InfoWindow({
                maxWidth: 320
            });

            // マーカーがクリックされたイベントハンドラ
            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent(
                    // infoウィンドウで表示する内容のHTML
                    '<a href="' + url + '"><img src="' + url + '"></a><br />' +
                    '緯度：' + pos.lat() + '<br />経度：' + pos.lng()
                );
                infoWindow.open(map, marker);
            });
        }, false);
        img.src = e.target.result;
    }, false);
    reader.readAsDataURL(file);
}

function relocation()
{
    var geo = navigator.geolocation;
    if (geo) {
        geo.getCurrentPosition(
            function (position) {
                window.console.log("測位成功: " + position.coords.latitude + ", " + position.coords.longitude);
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.panTo(latlng);
            },
            function (error) {
                window.alert("測位エラー: " + error.code);
            },
            {
                timeout: 60000
            }
        );
    } else {
        window.alert("geolocation is null");
    }
}

function pasteImageDispatch()
{
    if (navigator.userAgent.indexOf("Mobile") > 0) {
        pasteImageMobile();
    }
    else {
        pasteImagePc();
    }
}

function pasteImageMobile()
{
    // イメージピッカー
    var pick = new MozActivity({
       name: "pick",
       data: {
           type: ["image/png", "image/jpg", "image/jpeg"]
       }
    });

    // 取得成功時の処理
    pick.addEventListener('success', function () {
        makeMarker(this.result.blob);
    }, false);

    // 取得失敗時の処理
    pick.addEventListener('error', function () {
        window.alert("画像取得失敗");
    }, false);
}

function pasteImagePcOnChange(fs)
{
    makeMarker(fs[0]);
}

function pasteImagePc()
{
    // ファイルピッカー
    var filePick = document.getElementById("paste_image");
    filePick.click();
}

