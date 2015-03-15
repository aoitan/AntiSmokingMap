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
    // http://gas-map.azurewebsites.net/smoking/get_warning
    var p = new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.onload = () => {
        if (DEBUG) console.log('status: ' + xhr.responseText);
        resolve(JSON.parse(xhr.responseText));
      };
      xhr.onerror = (err) => {
        reject(err);
      };
      var url = 'http://gas-map.azurewebsites.net/smoking/get_warning?' +
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
    // http://gas-map.azurewebsites.net/smoking/add
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
      xhr.open('POST', 'http://gas-map.azurewebsites.net/smoking/add?' +
                       'lat=' + lat +
                       '&lng=' + lng +
                       '&type=' + type);
      xhr.send();
    });
    return p;
  }

  detail(id: Number): Promise<any> {
    // http://gas-map.azurewebsites.net/smoking/detail
    var p = new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.onload = () => {
        resolve(JSON.parse(xhr.responseText));
      };
      xhr.onerror = (err) => {
        reject(err);
      };
      xhr.open('POST', 'http://gas-map.azurewebsites.net/smoking/detail?' +
                       'id=' + id);
      xhr.send();
    });
    return p;
  }

  update(id: Number, name: String, address: String, rating: Number, comment: String): Promise<any> {
    // http://gas-map.azurewebsites.net/smoking/detail
    var p = new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.onload = () => {
        resolve(JSON.parse(xhr.responseText));
      };
      xhr.onerror = (err) => {
        reject(err);
      };
      xhr.open('POST', 'http://gas-map.azurewebsites.net/smoking/update?' +
                       'id=' + id +
                       '&name=' + name +
                       '&address=' + address +
                       '&rating=' + rating +
                       '&comment=' + comment);
      xhr.send();
    });
    return p;
  }

  private floor(value, ratio) {
    return Math.floor(value + ratio) / ratio;
  }
}
