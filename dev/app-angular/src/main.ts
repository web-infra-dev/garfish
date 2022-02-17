import { enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

let app: void | NgModuleRef<AppModule>;

async function render() {
  await platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
}

if (!(window as any).__GARFISH__) {
  render();
}

export const provider = () => {
  return {
    render,
    destroy({ dom }) {
      const root = dom
        ? dom.querySelector('#root')
        : document.querySelector('#root');
    },
  };
};
