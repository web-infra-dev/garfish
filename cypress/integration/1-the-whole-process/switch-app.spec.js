/// <reference types="cypress" />

const basename = '/garfish-app';

describe('browser-vm sandbox variable isolation', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        async beforeLoad(appInfo) {
          console.log('start load app', appInfo);
          return true;
        },
      },
    });
  });

  it('Switch to the Vue app', () => {
    cy.visit('http://localhost:2333');

    cy.window().then((win) => {
      const TodoListPage = () => {
        // todo list page
        win.history.pushState({}, 'vue', `${basename}/vue/todo`);
        cy.contains('[data-test=title]', 'Vue App todo list');
        cy.get('.todo-list li').contains('default todo');
        // add todo item
        const newItem = 'new item';
        cy.get('[data-test=new-todo]').type(`${newItem}`);
        cy.get('[data-test=add-btn]').click();
        cy.get('.todo-list li')
          .should('have.length', 2)
          .last()
          .should('have.text', newItem);

        cy.get('.todo-list li').last().find('button').click();
        cy.get('.todo-list li').last().find('button').click();
        cy.get('.todo-list li').should('have.length', 0);
      };

      const RemoteComponent = () => {
        // remote component
        win.history.pushState({}, 'vue', `${basename}/vue/remote-component`);
        cy.contains('Vue App remote component');
        cy.contains('old text---chen');
        cy.contains('old text---tao');
        cy.get('[data-test=change-data]').click();
        cy.contains('new text---chen');
        cy.contains('new text---tao');
      };

      win.history.pushState({}, 'vue', `${basename}/vue`);
      cy.contains(
        '[data-test=title]',
        'Thank you for using Garfish for Vue app',
      )
        .then(TodoListPage)
        .then(RemoteComponent);
    });
  });

  it('Switch to the React app use Garfish router ', () => {
    cy.window().then((win) => {
      const lazyComponent = () => {
        // lazy component
        win.Garfish.router.push({ path: '/react/lazy-component' });
        cy.contains('[data-test=title]', 'React sub App lazyComponent');
      };

      const RemoteComponent = () => {
        // remote component
        win.Garfish.router.push({ path: '/react/remote-component' });
        cy.contains('[data-test=title]', 'React sub App remote component');
      };

      win.Garfish.router.push({ path: '/react' });
      cy.contains(
        '[data-test=title]',
        'Thank you for using Garfish for React App',
      )
        .then(lazyComponent)
        .then(RemoteComponent);
    });
  });
});
