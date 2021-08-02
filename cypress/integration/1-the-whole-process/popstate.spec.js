/// <reference types="cypress" />

const basename = '/garfish-app';

describe('browser-vm sandbox variable isolation', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        autoRefreshApp: false, // Don't trigger popstate
      },
    });
  });

  let popstateTriggerTime = 0;
  let popstateCallback = () => (popstateTriggerTime += 1);

  it('Switch to the Vue app', () => {
    const HomeTitle = 'Thank you for the vue applications use garfish';
    const ReactHomeTitle = 'Thank you for the react applications use garfish';

    cy.visit('http://localhost:2333');

    cy.window().then((win) => {
      // Monitoring popstate call time
      win.addEventListener('popstate', popstateCallback);

      const TodoListPage = () => {
        // autoRefreshApp is false can't refreshApp
        win.history.pushState({}, 'vue', `${basename}/vue/todo`);
        cy.contains('[data-test=title]', HomeTitle);
      };

      const ReactHomePage = () => {
        win.Garfish.router.push({ path: '/react' });
        cy.contains('[data-test=title]', ReactHomeTitle);
      };

      const ReactLazyComponent = () => {
        // lazy component
        win.Garfish.router.push({ path: '/react/lazy-component' });
        cy.contains('[data-test=title]', 'React sub App lazyComponent');
      };

      win.history.pushState({}, 'vue', `${basename}/vue`);
      cy.contains('[data-test=title]', HomeTitle)
        .then(TodoListPage)
        .then(() => expect(popstateTriggerTime).to.equal(0))
        .then(ReactHomePage)
        .then(ReactLazyComponent)
        .then(() => expect(popstateTriggerTime).to.equal(1));
    });
  });
});
