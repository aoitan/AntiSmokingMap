/// <reference path="../typings/es6-promise/es6-promise.d.ts" />

var DEBUG = true;

class Database {
  static instance_: any = null;

  constructor() {
  }

  static getInstance(): Database {
    if (!this.instance_) {
      this.instance_ = new Database();
    }
    return this.instance_;
  }

  getWarning(pos: any, rad: Number, type: Number): Promise<any> {
    // http://firefox-team9.azurewebsites.net/smoking/get_warning
    var p = new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.onload = () => {
        if (DEBUG) console.log('status: ' + xhr.responseText);
        resolve(JSON.parse(xhr.responseText));
      };
      xhr.onerror = (err) => {
        reject(err);
      };
      var url = 'http://firefox-team9.azurewebsites.net/smoking/get_warning?' +
                'lat=' + pos.coords.latitude +
                '&lng=' + pos.coords.longitude +
                '&rad=' + rad;
      url = (type === 0)? url: url + '&type=' + type;
      if (DEBUG) console.log('xhr: ' + url);
      xhr.open('GET', url);
      xhr.send();
    });
    return p;
  }

  add(pos, type: Number): Promise<any> {
    // http://firefox-team9.azurewebsites.net/smoking/add
    var p = new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.onload = () => {
        resolve(JSON.parse(xhr.responseText));
      };
      xhr.onerror = (err) => {
        reject(err);
      };
      var lat = this.floor(pos.coords.latitude, 10000000000); // 10桁丸め
      var lng = this.floor(pos.coords.longitude, 10000000000); // 10桁丸め
      xhr.open('POST', 'http://firefox-team9.azurewebsites.net/smoking/add?' +
                       'lat=' + lat +
                       '&lng=' + lng +
                       '&type=' + type);
      xhr.send();
    });
    return p;
  }

  private floor(value, ratio) {
    return Math.floor(value + ratio) / ratio;
  }
}
