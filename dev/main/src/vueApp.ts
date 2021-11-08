import Garfish from 'garfish';

Garfish.router.beforeEach((to, from, next) => {
  console.log(to, from);
  next();
});

class VuApp extends HTMLElement {
  appPromise = null;
  appInstance = null;

  constructor() {
    // Always call super first in constructor
    super();
  }

  async connectedCallback() {
    Garfish.loadApp(this.getAttribute('app-name'), {
      entry: this.getAttribute('entry'),
      domGetter: () => this,
      basename: '/',
      sandbox: {
        snapshot: false,
        strictIsolation: true,
      },
    }).then((appInstance) => {
      this.appInstance = appInstance;
      if (this.appInstance.mounted) {
        this.appInstance.show();
      } else {
        this.appInstance.mount();
      }
    });
    console.log('Custom square element added to page.');
  }

  disconnectedCallback() {
    this.appInstance.unmout();
    console.log('Custom square element removed from page.');
  }

  async adoptedCallback() {
    // this.appInstance = await this.appPromise;
    // this.appInstance.mount();
    console.log('Custom square element moved to new page.');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('Custom square element attributes changed.');
  }
  static get observedAttributes() {
    return ['w', 'l'];
  }
}

// Define the new element
customElements.define('vue-app', VuApp);
