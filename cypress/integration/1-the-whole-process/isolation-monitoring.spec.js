/// <reference types="cypress" />
import { findMultiAndMatch } from '../common';

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
      // cy.get('[data-test=main-click-error]').click();
      cy.get('[data-test=click-unhandledrejection-error]').click();
      // cy.get('[data-test=main-click-unhandledrejection-error]').click();

      const errorPatch = {
        ev_type: 'js_error',
      };

      const errorMessageMap = {
        mainAppError: 'mainApp: normal error',
        mainUnhandledrejectionError: 'mainApp: unhandledrejection error',
        subAppError: 'subApp: normal error',
        subUnhandledrejectionError: 'subApp: unhandledrejection error',
      };

      const errMsg = (msg) => {
        return {
          payload: {
            error: {
              message: msg,
            },
          },
        };
      };

      // matchAndMatch(0, errorPatch, errMsg(errorMessageMap.mainAppError));
      // matchAndMatch(0, errorPatch, errMsg(errorMessageMap.mainUnhandledrejectionError));
      // // react-error-overlay Make the same error trigger twice
      // matchAndMatch(2, errorPatch, errMsg(errorMessageMap.subAppError));
      findMultiAndMatch(2, errorPatch, errMsg(errorMessageMap.subAppError), {
        'payload.error.message': errorMessageMap.subAppError,
      });
      findMultiAndMatch(
        1,
        errorPatch,
        errMsg(errorMessageMap.subUnhandledrejectionError),
        { 'payload.error.message': errorMessageMap.subUnhandledrejectionError },
      );
    });
  });
});
