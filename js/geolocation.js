var Util;
(function (Util) {
    var Geolocation = (function () {
        function Geolocation() {
            this.geo = null;
            this.geo = navigator.geolocation;
        }
        Geolocation.getInstance = function () {
            if (!this.instance_) {
                this.instance_ = new Geolocation();
            }
            return this.instance_;
        };
        Geolocation.prototype.getCurrentPosition = function (option) {
            var _this = this;
            var p = new Promise(function (resolve, reject) {
                _this.geo.getCurrentPosition(function (position) {
                    resolve(position);
                }, function (error) {
                    reject(position);
                }, option);
            });
            return p;
        };
        Geolocation.prototype.watchPosition = function (cb, errorCb, option) {
            this.watchId = this.geo.watchPosition(cb, errorCb, option);
        };
        Geolocation.prototype.clearWatch = function () {
            this.geo.clearWatch(this.watchId);
        };
        Geolocation.instance_ = null;
        return Geolocation;
    })();
    Util.Geolocation = Geolocation;
})(Util || (Util = {}));
