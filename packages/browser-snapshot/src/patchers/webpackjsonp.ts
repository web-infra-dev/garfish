declare global {
  interface Window {
    webpackJsonp?: any[];
  }
}

export class PatchWebpackJsonp {
  preWebpackJsonp?: any[];

  currentWebpackJsonp?: any[];

  public activate() {
    this.preWebpackJsonp = window.webpackJsonp;
    window.webpackJsonp = this.currentWebpackJsonp;
  }

  public deactivate() {
    this.currentWebpackJsonp = window.webpackJsonp;
    window.webpackJsonp = this.preWebpackJsonp;
  }
}
