/// <reference types="cypress" />
import { findMultiAndMatch } from '../common';

describe('monitoring the isolation', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: '/garfish-app',
      },
    });
    cy.visit('http://localhost:2333/garfish-app/react/monitoring');
    cy.intercept('POST', '/monitor_browser/collect/batch/', {}).as('post');
  });

  const MonitoringTitle = 'React sub App Monitoring';

  const httpRequest = (msg) => {
    return {
      payload: {
        request: {
          url: msg,
        },
      },
    };
  };

  const httpPatch = {
    ev_type: 'http',
  };
  const httpMessageMap = {
    mainAppXhrRequest: 'http://localhost:2333/mainApp',
    mainAppFetchRequest: 'http://localhost:2333/fetch/mainApp',
    subAppXhrRequest: 'http://localhost:2444/subApp',
    subAppFetchRequest: 'http://localhost:2444/fetch/subApp',
  };

  it('subApp xhr http request isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=click-fetch]').click();

      findMultiAndMatch(
        1,
        httpPatch,
        httpRequest(httpMessageMap.subAppXhrRequest),
        {
          'payload.request.url': httpMessageMap.subAppXhrRequest,
        },
      );
    });
  });

  it('subApp fetch http request isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=click-fetch]').click();

      findMultiAndMatch(
        1,
        httpPatch,
        httpRequest(httpMessageMap.subAppFetchRequest),
        {
          'payload.request.url': httpMessageMap.subAppFetchRequest,
        },
      );
    });
  });

  it('mainApp xhr http request isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=main-click-fetch]').click();

      findMultiAndMatch(
        0,
        httpPatch,
        httpRequest(httpMessageMap.mainAppXhrRequest),
        {
          'payload.request.url': httpMessageMap.mainAppXhrRequest,
        },
      );
    });
  });

  it('mainApp fetch http request isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);
      cy.get('[data-test=main-click-fetch]').click();

      findMultiAndMatch(
        0,
        httpPatch,
        httpRequest(httpMessageMap.mainAppFetchRequest),
        {
          'payload.request.url': httpMessageMap.mainAppFetchRequest,
        },
      );
    });
  });
});
