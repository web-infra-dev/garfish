import { GarfishInstance } from './instance';

interface AppInfo {
  name: string;
  entry: string;
  basename: string;
}

interface CustomOptions {
  loading: (loadingParams: {
    isLoading: boolean,
    error: Error
  }) => Element;
}

function generateCustomerElement (htmlTag: string, options: CustomOptions) {
  class MicroApp extends HTMLElement {
    appInfo = {
      name: '',
      entry: '',
      basename: '',
    }
    options = {
      loading: null,
    }
    placeholder: Element;
    state = this._observerAppState({
      isLoading: false,
      error: null,
      promise: null,
      loaded: null,
    })

    constructor() {
      super();
      this.appInfo = {
        name: this.getAttribute('app-name'),
        entry: this.getAttribute('entry'),
        basename: this.getAttribute('basename') || '/',
      };
      this.options = options;

      this._loadApp();
    }

    _observerAppState (state) {
      return new Proxy(state, {
        set: (target: any, p: string | symbol, value: any, receiver: any) => {
          // Loading status content display in the loading process
          // Error display error
          const getPlaceHolderAndAppend = ()=> {
            // Remove the existing placeholder content
            if (this.placeholder) {
              this.removeChild(this.placeholder);
            }
            const placeholder = this.options.loading({
              isLoading: this.state.isLoading,
              error: this.state.error,
            });
            placeholder && this.appendChild(placeholder);
            return placeholder;
          }

          const res = Reflect.set(target,p,value,receiver);
          // Loading began to open the loading placeholder
          // Loading end closed loading placeholder
          // Loading end placeholder closed if there is no mistake
          if (p === 'error' && value) {
            this.placeholder = getPlaceHolderAndAppend();
          } else if(p === 'isLoading' && value === true) {
            this.placeholder = getPlaceHolderAndAppend();
          } else if (p === 'isLoading' && value === false) {
            if (!this.state.error && this.contains(this.placeholder)) {
              this.removeChild(this.placeholder);
            }
          }
          return res;
        },
      })
    }

    _loadApp () {
      // If you are loading stop continue to load
      if (this.state.isLoading) return;
      this.state.isLoading = true;
      this.state.promise = GarfishInstance.loadApp(this.appInfo.name, {
        entry: this.appInfo.entry,
        domGetter: () => this,
        basename: this.appInfo.basename,
        sandbox: {
          snapshot: false,
          strictIsolation: true,
        },
      })
    }

    async connectedCallback() {
      try {
        this.state.loaded = await this.state.promise;
        if (this.state.loaded.mounted) {
          this.state.loaded.show();
        } else {
          await this.state.loaded.mount();
        }
      } catch(error) {
        this.state.error = error;
      } finally {
        this.state.isLoading = false;
      }
      console.log('Custom square element added to page.');
    }

    disconnectedCallback() {
      if (this.state.loaded) {
        this.state.loaded.hide();
      }
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
  customElements.define(htmlTag, MicroApp);
}


function createLoadableWebComponent(htmlTag: string, options: CustomOptions) {
  if (typeof htmlTag !== 'string') {
    throw new Error('garfish requires a `htmlTag` name');
  }

  if (!options.loading) {
    throw new Error('garfish requires a `loading` component');
  }

  const opts = Object.assign(
    {
      loading: false,
      delay: 200,
      timeout: null,
    },
    options
  );
  return generateCustomerElement(htmlTag,opts);
}


function LoadableWebComponent (htmlTag: string, options: CustomOptions) {
  return createLoadableWebComponent(htmlTag,options);
}

export function defineCustomElements (htmlTag: string, options: CustomOptions) {
  return createLoadableWebComponent(htmlTag,options);
}
