import GarfishPluginForSlardar from './components/garfishPlugin';

export default function initSlardar() {
  window.Slardar('init', {
    bid: 'garfish_test',
    plugins: {
      resource: {
        ignoreTypes: ['xmlhttprequest', 'beacon'],
      },
      performance: {
        fp: false,
        fcp: false,
        fid: false,
        mpfid: false,
        lcp: false,
        cls: false,
      },
    },
  });
  GarfishPluginForSlardar(() => window.Slardar, 'react');

  window.Slardar('on', 'send', (ev) => console.log(ev.ev_type, ev));
  window.Slardar('start');
}
