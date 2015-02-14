
module Util {

export class Geolocation {
  static instance_: any = null;
  private geo: any = null;
  private watchId;

  constructor() {
    this.geo = navigator.geolocation;
  }

  static getInstance(): Geolocation {
    if (!this.instance_) {
      this.instance_ = new Geolocation();
    }
    return this.instance_;
  }

  getCurrentPosition(option: any): any {
    var p = new Promise((resolve, reject) => {
      this.geo.getCurrentPosition((position) => {
        resolve(position);
      }, (error) => {
        reject(position);
      }, option);
    });
    return p;
  }

  watchPosition(cb: Function, errorCb: Function, option: any) {
    this.watchId = this.geo.watchPosition(cb, errorCb, option);
  }

  clearWatch() {
    this.geo.clearWatch(this.watchId);
  }
}

}
