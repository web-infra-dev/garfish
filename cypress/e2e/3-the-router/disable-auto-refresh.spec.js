/// <reference types="cypress" />

const basename = '/examples';
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;

describe('whole process popstate event', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        disablePreloadApp: false,
        autoRefreshApp: false, // Don't trigger popstate
      },
    });
    Cypress.on('uncaught:exception', (err) => {
      /* returning false here prevents Cypress from failing the test */
      if (resizeObserverLoopErrRe.test(err.message)) {
        return false;
      }
    });
  });

  let popstateTriggerTime = 0;
  const popstateCallback = () => (popstateTriggerTime += 1);

  it('Switch to the Vue app', () => {
    const VueHomeTitle = 'Thank you for the vue2 applications use garfish';
    const ReactHomeTitle = 'Thank you for the react applications use garfish';
    const TodoTitle = 'Vue App todo list';
    const LazyTitle = 'React sub App lazyComponent';

    cy.visit('http://localhost:8090/');

    cy.window().then((win) => {
      // Monitoring popstate call time
      win.addEventListener('popstate', popstateCallback);

      const TodoListPage = () => {
        // autoRefreshApp is false can't refreshApp
        win.history.pushState({}, 'vue', `${basename}/vue2/todoList`);
        cy.contains('[data-test=title]', TodoTitle).should('not.exist');
      };

      const ReactHomePage = () => {
        // autoRefreshApp is false can't refreshApp
        win.history.pushState({}, 'react', `${basename}/react17/home`);
        cy.contains('[data-test=title]', ReactHomeTitle).should('not.exist');
      };

      const ReactLazyComponent = () => {
        // lazy component autoRefreshApp is false can't refreshApp
        win.history.pushState(
          {},
          'react',
          `${basename}/react17/lazy-component`,
        );
        cy.contains('[data-test=title]', LazyTitle).should('not.exist');
      };

      cy.contains('[data-test=title]', VueHomeTitle)
        .should('not.exist')
        .then(() => expect(win.Garfish.options.autoRefreshApp).to.equal(false))
        .then(TodoListPage)
        .then(() => expect(popstateTriggerTime).to.equal(0))
        .then(ReactHomePage)
        .then(() => expect(popstateTriggerTime).to.equal(0))
        .then(ReactLazyComponent)
        .then(() => expect(popstateTriggerTime).to.equal(0));
    });
  });
});
