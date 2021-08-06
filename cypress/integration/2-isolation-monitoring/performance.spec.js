/// <reference types="cypress" />
import { findMultiAndMatch } from '../common';

describe('monitoring the isolation', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: '/garfish-app',
      },
    });
    cy.visit('http://localhost:2333/garfish-app/react');
    cy.intercept('POST', '/monitor_browser/collect/batch/', {}).as('post');
  });

  const MonitoringTitle = 'React sub App Monitoring';

  const resourceRequest = (msg) => {
    return {
      payload: {
        name: msg,
      },
    };
  };

  const resourcePatch = {
    ev_type: 'resource',
  };

  const resourceMessageMap = {
    mainJsResource: 'http://localhost:2333/monitoring/dynamicScript.js',
    mainAppFetchRequest: 'http://localhost:2333/fetch/mainApp',
    subAppJsResource: 'http://localhost:2444/monitoring/dynamicScript.js',
    subAppFetchRequest: 'http://localhost:2444/fetch/subApp',
  };

  it('subApp resource isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=click-dynamic-resource]').click();

      findMultiAndMatch(
        1,
        resourcePatch,
        resourceRequest(resourceMessageMap.subAppJsResource),
        {
          'payload.name': resourceMessageMap.subAppJsResource,
        },
      );
    });
  });

  it('mainApp resource isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=main-click-dynamic-resource]').click();

      findMultiAndMatch(
        0,
        resourcePatch,
        resourceRequest(resourceMessageMap.mainJsResource),
        {
          'payload.name': resourceMessageMap.mainJsResource,
        },
      );
    });
  });
});
