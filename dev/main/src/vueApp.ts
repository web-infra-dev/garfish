import Garfish from 'garfish';

Garfish.router.beforeEach((to, from, next) => {
  next();
});

class MicroApp extends HTMLElement {
  appPromise = null;
  appInstance = null;
  loading: Element;

  constructor() {
    // Always call super first in constructor
    super();
    let appName = this.getAttribute('app-name');
    let entry = this.getAttribute('entry');
    let basename = this.getAttribute('basename') || '/';

    this.loading = document.createElement('div');
    this.loading.innerHTML = 'loading';
    this.appendChild(this.loading);

    this.appPromise = Garfish.loadApp(appName, {
      entry: entry,
      domGetter: () => this,
      basename: basename,
      sandbox: {
        snapshot: false,
        strictIsolation: true,
      },
    });
  }

  async connectedCallback() {
    this.appInstance = await this.appPromise;
    this.removeChild(this.loading);
    if (this.appInstance.mounted) {
      this.appInstance.show();
    } else {
      this.appInstance.mount();
    }
    console.log('Custom square element added to page.');
  }

  disconnectedCallback() {
    this.appInstance.hide();
    console.log('Custom square element removed from page.');
  }

  async adoptedCallback() {
    console.log('Custom square element moved to new page.');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(
      'Custom square element attributes changed.',
      name,
      oldValue,
      newValue,
    );
  }
}

// Define the new element
customElements.define('micro-portal', MicroApp);
