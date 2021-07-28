/// <reference types="cypress" />

describe('browser-vm sandbox variable isolation', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/todo');
  });
});
