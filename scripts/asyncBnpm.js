const axios = require('axios');

axios
  .get('https://cloudapi.bytedance.net/faas/services/ttkjwo/invoke/async-bnpm')
  .then((res) => {
    console.info('async bnpm package success', res.data);
  })
  .catch((err) => {
    console.error('async bnpm package failure', err);
  });
