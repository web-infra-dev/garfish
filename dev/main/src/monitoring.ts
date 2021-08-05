import ConfigCommon from '../../config.json';

export function fetchM() {
  const xhr = new XMLHttpRequest();
  xhr.open('get', `http://localhost:${ConfigCommon.mainPort}/mainApp`, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) {
      return;
    }
    if (xhr.status >= 200 && xhr.status < 300) {
      // console.log('mainApp xhr');
    }
  };
  xhr.send(null);

  fetch(
    `http://localhost:${ConfigCommon.mainPort}/fetch/mainApp`,
  ).then((res) => {});
}

export function unhandledrejectionError() {
  setTimeout(() => {
    throw Error('mainApp: unhandledrejection error');
  }, 2000);
}

export function normalError() {
  throw Error('mainApp: normal error');
}

export function DynamicResource() {
  const sc = document.createElement('script');
  sc.src = `http://localhost:${ConfigCommon.mainPort}/monitoring/dynamicScript.js`;
  document.body.appendChild(sc);

  const link = document.createElement('link');
  link.href = `http://localhost:${ConfigCommon.mainPort}/monitoring/dynamicLink.css`;
  document.body.appendChild(link);
}
