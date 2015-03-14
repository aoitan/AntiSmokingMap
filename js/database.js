/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
var DEBUG = true;
var Database = (function () {
    function Database() {
    }
    Database.getInstance = function () {
        if (!this.instance_) {
            this.instance_ = new Database();
        }
        return this.instance_;
    };
    Database.prototype.getWarning = function (pos, rad, type) {
        // http://firefox-team9.azurewebsites.net/smoking/get_warning
        var p = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest({ mozSystem: true });
            xhr.onload = function () {
                if (DEBUG)
                    console.log('status: ' + xhr.responseText);
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.onerror = function (err) {
                reject(err);
            };
            var url = 'http://firefox-team9.azurewebsites.net/smoking/get_warning?' + 'lat=' + pos.coords.latitude + '&lng=' + pos.coords.longitude + '&rad=' + rad;
            url = (type === 0) ? url : url + '&type=' + type;
            if (DEBUG)
                console.log('xhr: ' + url);
            xhr.open('GET', url);
            xhr.send();
        });
        return p;
    };
    Database.prototype.add = function (pos, type) {
        var _this = this;
        // http://firefox-team9.azurewebsites.net/smoking/add
        var p = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest({ mozSystem: true });
            xhr.onload = function () {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.onerror = function (err) {
                reject(err);
            };
            var lat = _this.floor(pos.coords.latitude, 10000000000); // 10桁丸め
            var lng = _this.floor(pos.coords.longitude, 10000000000); // 10桁丸め
            xhr.open('POST', 'http://firefox-team9.azurewebsites.net/smoking/add?' + 'lat=' + lat + '&lng=' + lng + '&type=' + type);
            xhr.send();
        });
        return p;
    };
    Database.prototype.floor = function (value, ratio) {
        return Math.floor(value + ratio) / ratio;
    };
    Database.instance_ = null;
    return Database;
})();
