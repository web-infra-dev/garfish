/// <reference types="cypress" />

const basename = '/garfish_master';

describe('whole process app render', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        disablePreloadApp: true,
        sandbox: {
          snapshot: false,
        },
      },
    });
  });

  it('set global history variable', () => {
    cy.visit(`http://localhost:2333${basename}/react/set-proxy-variable`);

    const ProxyVariableTitle = 'set proxy variable';

    cy.window().then((win) => {
      cy.contains('[data-test=title]', ProxyVariableTitle)
        .then(() => {
          expect(win.history.scrollRestoration).to.equal('auto');
        })
        .then(() => {
          return cy.get('[data-test=click-set-history-proxy-variable]').click();
        })
        .then(() => {
          expect(win.history.scrollRestoration).to.equal('manual');
        });
    });
  });
});
