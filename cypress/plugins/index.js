/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (
      browser.name === 'chrome' ||
      browser.name === 'chromium' ||
      browser.name === 'canary'
    ) {
      launchOptions.args.push('--auto-open-devtools-for-tabs');

      return launchOptions;
    }
    return launchOptions;
  });
};
