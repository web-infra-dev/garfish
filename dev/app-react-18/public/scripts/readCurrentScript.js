const currentScript = document.currentScript;
if (!currentScript.dataset.testName) {
  throw new Error('currentScript.dataset.testName is required')
}

