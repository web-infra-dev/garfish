// https://github.com/developit/unfetch/blob/master/src/index.mjs
export function browserFetch(url: string, options: RequestInit) {
  return new Promise((resolve, reject) => {
    const all = [];
    const keys = [];
    const headers = {};
    const request = new XMLHttpRequest();
    const response = () => ({
      status: request.status,
      url: request.responseURL,
      statusText: request.statusText,
      ok: ((request.status / 100) | 0) === 2, // 200-299
      clone: response,
      text: () => Promise.resolve(request.responseText),
      blob: () => Promise.resolve(new Blob([request.response])),
      json: () => Promise.resolve(request.responseText).then(JSON.parse),
      headers: {
        keys: () => keys,
        entries: () => all,
        get: (n) => headers[n.toLowerCase()],
        has: (n) => n.toLowerCase() in headers,
      },
    });

    request.open(options.method || 'get', url, true);
    request.withCredentials = options.credentials === 'include';
    request.onerror = reject;
    request.onload = () => {
      request
        .getAllResponseHeaders()
        // 删除空格换行
        .replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, (m, key, value) => {
          keys.push((key = key.toLowerCase()));
          all.push([key, value]);
          headers[key] = headers[key] ? `${headers[key]},${value}` : value;
          return '';
        });
      resolve(response());
    };
    for (const i in options.headers) {
      request.setRequestHeader(i, options.headers[i]);
    }
    request.send(options.body || null);
  });
}
