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
    cy.visit('http://localhost:2333/garfish-app/react/monitoring');
    cy.on('uncaught:exception', () => {
      return false;
    });
    cy.intercept('POST', '/monitor_browser/collect/batch/', {}).as('post');
  });

  const MonitoringTitle = 'React sub App Monitoring';

  const errMsg = (msg) => {
    return {
      payload: {
        error: {
          message: msg,
        },
      },
    };
  };

  const errorPatch = {
    ev_type: 'js_error',
  };
  const errorMessageMap = {
    subAppError: 'subApp: normal error',
    subUnhandledrejectionError: 'subApp: unhandledrejection error',
    mainAppError: 'mainApp: normal error',
    mainUnhandledrejectionError: 'mainApp: unhandledrejection error',
  };

  it('subApp error isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=click-normal-error]').click();

      findMultiAndMatch(2, errorPatch, errMsg(errorMessageMap.subAppError), {
        'payload.error.message': errorMessageMap.subAppError,
      });
    });
  });

  it('subApp unhandledrejection isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=click-unhandledrejection-error]').click();

      findMultiAndMatch(
        1,
        errorPatch,
        errMsg(errorMessageMap.subUnhandledrejectionError),
        { 'payload.error.message': errorMessageMap.subUnhandledrejectionError },
      );
    });
  });

  it('mainApp unhandledrejection isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=main-click-unhandledrejection-error]').click();

      findMultiAndMatch(
        0,
        errorPatch,
        errMsg(errorMessageMap.mainUnhandledrejectionError),
        {
          'payload.error.message': errorMessageMap.mainUnhandledrejectionError,
        },
      );
    });
  });

  it('mainApp normal error isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=main-click-normal-error]').click();

      findMultiAndMatch(0, errorPatch, errMsg(errorMessageMap.mainAppError), {
        'payload.error.message': errorMessageMap.mainAppError,
      });
    });
  });
});
