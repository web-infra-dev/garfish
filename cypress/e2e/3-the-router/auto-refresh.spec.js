/// <reference types="cypress" />

const basename = '/examples';
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;

describe('whole process popstate event', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        disablePreloadApp: true,
        autoRefreshApp: true, // trigger popstate
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
    const VueTodoTitle = 'Vue App todo list';
    const ReactHomeTitle = 'Thank you for the React applications use garfish.';

    cy.visit('http://localhost:8090');

    cy.window().then((win) => {
      // Monitoring popstate call time
      win.addEventListener('popstate', popstateCallback);

      const TodoListPage = () => {
        win.history.pushState({}, 'vue', `${basename}/vue2/todoList`);
        cy.wait(2000);
        cy.contains('[data-test=title]', VueTodoTitle);
      };

      const ReactHomePage = () => {
        win.history.pushState({}, 'react', `${basename}/react17/home`);
        cy.wait(2000);
        cy.contains('[data-test=title]', ReactHomeTitle);
      };

      const ReactLazyComponent = () => {
        // lazy component
        win.Garfish.router.push({ path: '/react17/lazy-component' });
        cy.wait(2000);
        cy.contains('[data-test=title]', 'React sub App lazyComponent');
      };

      win.history.pushState({}, 'vue', `${basename}/vue2/home`);
      cy.wait(2000);
      cy.contains('[data-test=title]', VueHomeTitle)
        .then(() => expect(win.Garfish.options.autoRefreshApp).to.equal(true))
        .then(() => expect(popstateTriggerTime).to.equal(1))
        .then(TodoListPage)
        .then(() => expect(popstateTriggerTime).to.equal(2))
        .then(ReactHomePage)
        .then(() => expect(popstateTriggerTime).to.equal(4))
        .then(ReactLazyComponent)
        .then(() => expect(popstateTriggerTime).to.equal(5));
    });
  });
});
