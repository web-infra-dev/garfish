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

  const MonitoringTitle = 'Thank you for the react applications use garfish';

  const performanceRequest = (msg) => {
    return {
      payload: {
        name: msg,
      },
    };
  };

  const performancePatch = {
    ev_type: 'performance',
  };

  const performanceMessageMap = {
    resourceLoadTime: 'resourceLoadTime',
    blankScreenTime: 'resourceLoadTime',
    firstScreenTime: 'resourceLoadTime',
  };

  it('subApp resource isolation', () => {
    cy.window().then((win) => {
      cy.contains('[data-test=title]', MonitoringTitle);

      findMultiAndMatch(
        1,
        performancePatch,
        performanceRequest(performanceMessageMap.resourceLoadTime),
        {
          'payload.name': performanceMessageMap.resourceLoadTime,
        },
        4000,
      );
      findMultiAndMatch(
        1,
        performancePatch,
        performanceRequest(performanceMessageMap.blankScreenTime),
        {
          'payload.name': performanceMessageMap.blankScreenTime,
        },
        4000,
      );
      findMultiAndMatch(
        1,
        performancePatch,
        performanceRequest(performanceMessageMap.firstScreenTime),
        {
          'payload.name': performanceMessageMap.firstScreenTime,
        },
        4000,
      );
    });
  });
});
