/// <reference types="cypress" />
import { findMultiAndMatch } from '../common';

describe('monitoring the isolation', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: '/garfish-app',
      },
    });
    cy.on('uncaught:exception', () => {
      return false;
    });
    cy.visit('http://localhost:2333/garfish-app/react/monitoring');
    cy.intercept('POST', '/monitor_browser/collect/batch/', {}).as('post');
  });

  const MonitoringTitle = 'React sub App Monitoring';

  const resourceRequest = (msg) => {
    return {
      payload: {
        url: msg,
      },
    };
  };

  const resourcePatch = {
    ev_type: 'resource_error',
  };

  const resourceMessageMap = {
    mainJsResource: 'http://localhost:1111/monitoring/xxxxx.js',
    subAppJsResource: 'http://localhost:0000/monitoring/xxxxx.js',
  };

  it('subApp resource error isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=click-resource-error]').click();

      findMultiAndMatch(
        1,
        resourcePatch,
        resourceRequest(resourceMessageMap.subAppJsResource),
        {
          'payload.url': resourceMessageMap.subAppJsResource,
        },
      );
    });
  });

  it('mainApp resource error  isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=main-click-resource-error]').click();

      findMultiAndMatch(
        1,
        resourcePatch,
        resourceRequest(resourceMessageMap.mainJsResource),
        {
          'payload.url': resourceMessageMap.mainJsResource,
        },
      );
    });
  });
});
