/// <reference types="cypress" />

const basename = '/garfish-app';

describe('whole process popstate event', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        disablePreloadApp: true,
        autoRefreshApp: true, // trigger popstate
      },
    });
  });

  let popstateTriggerTime = 0;
  const popstateCallback = () => (popstateTriggerTime += 1);

  it('Switch to the Vue app', () => {
    const VueHomeTitle = 'Thank you for the vue applications use garfish';
    const VueTodoTitle = 'Vue App todo list';
    const ReactHomeTitle = 'Thank you for the react applications use garfish';

    cy.visit('http://localhost:2333');

    cy.window().then((win) => {
      // Monitoring popstate call time
      win.addEventListener('popstate', popstateCallback);

      const TodoListPage = () => {
        win.history.pushState({}, 'vue', `${basename}/vue/todo`);
        cy.contains('[data-test=title]', VueTodoTitle);
      };

      const ReactHomePage = () => {
        win.history.pushState({}, 'react', `${basename}/react`);
        cy.contains('[data-test=title]', ReactHomeTitle);
      };

      const ReactLazyComponent = () => {
        // lazy component
        win.Garfish.router.push({ path: '/react/lazy-component' });
        cy.contains('[data-test=title]', 'React sub App lazyComponent');
      };

      win.history.pushState({}, 'vue', `${basename}/vue`);
      cy.contains('[data-test=title]', VueHomeTitle)
        .then(() => expect(win.Garfish.options.autoRefreshApp).to.equal(true))
        .then(() => expect(popstateTriggerTime).to.equal(1))
        .then(TodoListPage)
        .then(() => expect(popstateTriggerTime).to.equal(2))
        .then(ReactHomePage)
        .then(() => expect(popstateTriggerTime).to.equal(3))
        .then(ReactLazyComponent)
        .then(() => expect(popstateTriggerTime).to.equal(4));
    });
  });
});
