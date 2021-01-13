declare global {
  interface Window {
    webpackJsonp?: any[];
  }
}

export class PatchWebpackJsonp {
  preWebpackJsonp?: any[];

  currentWebpackJsonp?: any[];

  public activate(isInit: boolean) {
    this.preWebpackJsonp = window.webpackJsonp;
    if (isInit) {
      window.webpackJsonp = undefined;
    } else {
      window.webpackJsonp = this.currentWebpackJsonp;
    }
  }

  public deactivate() {
    this.currentWebpackJsonp = window.webpackJsonp;
    window.webpackJsonp = this.preWebpackJsonp;
  }
}
