/// <reference types="cypress" />
import { matchAndMatch } from '../common';

const basename = '/garfish-app';

describe('monitoring the isolation', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
      },
    });
    cy.visit('http://localhost:2333');
    cy.on('uncaught:exception', () => {
      return false;
    });
    cy.intercept('POST', '/monitor_browser/collect/batch/', {}).as('post');
  });

  it('http isolation', () => {
    const MonitoringTitle = 'React sub App Monitoring';
    cy.window().then((win) => {
      win.Garfish.router.push({ path: '/react/monitoring' });
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=click-error]').click();
      matchAndMatch(
        1,
        {
          ev_type: 'js_error',
        },
        {
          payload: {
            error: {
              message: 'mainApp: normal error1',
            },
          },
        },
      );
    });
  });
});
