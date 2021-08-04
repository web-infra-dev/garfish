/// <reference types="cypress" />

const basename = '/garfish_master';

describe('whole process app render', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        autoRefreshApp: true, // Trigger popstate event
        async beforeLoad(appInfo) {
          console.log('start load app', appInfo);
          return true;
        },
      },
    });
  });

  let popstateTriggerTime = 0;
  let popstateCallback = () => (popstateTriggerTime += 1);

  it('Switch to the Vue app', () => {
    cy.visit('http://localhost:2333');

    cy.window().then((win) => {
      const HomeTitle = 'Thank you for the vue applications use garfish';
      const TodoTitle = 'Vue App todo list';
      const RemoteComponentTitle = 'Vue App remote component';
      // Monitoring popstate call time
      win.addEventListener('popstate', popstateCallback);

      const TodoListPage = () => {
        // todo list page
        win.history.pushState({}, 'vue', `${basename}/vue/todo`);
        cy.contains('[data-test=title]', TodoTitle);
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

      const backToHome = () => {
        // back to Home
        win.history.back();
        cy.contains('[data-test=title]', HomeTitle);
      };

      const RemoteComponent = () => {
        // remote component
        win.history.pushState({}, 'vue', `${basename}/vue/remote-component`);
        cy.contains(RemoteComponentTitle);
        cy.contains('old text---chen');
        cy.contains('old text---tao');
        cy.get('[data-test=change-data]').click();
        cy.contains('new text---chen');
        cy.contains('new text---tao');
      };

      win.history.pushState({}, 'vue', `${basename}/vue`);
      cy.contains('[data-test=title]', HomeTitle)
        .then(TodoListPage)
        .then(backToHome)
        .then(RemoteComponent)
        .then(() => expect(popstateTriggerTime).to.equal(3));
    });
  });

  it('Switch to the React app use Garfish router ', () => {
    const HomeTitle = 'Thank you for the react applications use garfish';
    const LazyTitle = 'React sub App lazyComponent';
    const RemoteComponentTitle = 'React sub App remote component';

    cy.window().then((win) => {
      const lazyComponent = () => {
        // lazy component
        win.Garfish.router.push({ path: '/react/lazy-component' });
        cy.contains('[data-test=title]', LazyTitle);
      };

      // const RemoteComponent = () => {
      //   // remote component
      //   win.Garfish.router.push({ path: '/react/remote-component' });
      //   cy.contains('[data-test=title]', RemoteComponentTitle);
      // };

      win.Garfish.router.push({ path: '/react' });
      cy.contains('[data-test=title]', HomeTitle)
        .then(lazyComponent)
        // .then(RemoteComponent)
        .then(() => expect(popstateTriggerTime).to.equal(4));
    });
  });

  it('Switch to the Vue2 app use js entry', () => {
    cy.window().then((win) => {
      const HomeTitle = 'Thank you for the vue2 applications use garfish';
      const AboutTitle = 'Vue2 App about page';

      const AboutPage = () => {
        win.history.pushState({}, 'vue', `${basename}/vue2/about`);
        cy.contains('[data-test=title]', AboutTitle);
      };

      win.history.pushState({}, 'vue2', `${basename}/vue2`);
      cy.contains('[data-test=title]', HomeTitle)
        .then(AboutPage)
        .then(() => expect(popstateTriggerTime).to.equal(5));
    });
  });
});
