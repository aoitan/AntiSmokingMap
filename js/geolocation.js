var Geoloc = (function () {
    function Geoloc() {
        this.geo = null;
        this.geo = navigator.geolocation;
    }
    Geoloc.getInstance = function () {
        if (!this.instance_) {
            this.instance_ = new Geoloc();
        }
        return this.instance_;
    };
    Geoloc.prototype.getCurrentPosition = function (option) {
        var _this = this;
        var p = new Promise(function (resolve, reject) {
            _this.geo.getCurrentPosition(function (position) {
                resolve(position);
            }, function (error) {
                reject(error);
            }, option);
        });
        return p;
    };
    Geoloc.prototype.watchPosition = function (cb, errorCb, option) {
        this.watchId = this.geo.watchPosition(cb, errorCb, option);
    };
    Geoloc.prototype.clearWatch = function () {
        this.geo.clearWatch(this.watchId);
    };
    Geoloc.instance_ = null;
    return Geoloc;
})();
