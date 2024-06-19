/// <reference types="cypress" />

const basename = '/examples';
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;

describe('whole process app render', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        disablePreloadApp: true,
        autoRefreshApp: true, // Trigger popstate event
        async beforeLoad(appInfo) {
          console.log('start load app', appInfo);
          return true;
        },
        sandbox: {
          snapshot: false,
        },
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
  const VueHomeTitle = 'Thank you for the vue2 applications use garfish';

  it('Switch to the Vue app', () => {
    cy.visit('http://localhost:8090');

    cy.window().then((win) => {
      const HomeTitle = 'Thank you for the vue2 applications use garfish';
      const TodoTitle = 'Vue App todo list';
      const RemoteComponentTitle = 'Vue App remote component';
      // Monitoring popstate call time
      win.addEventListener('popstate', popstateCallback);

      const TodoListPage = () => {
        // todo list page
        win.history.pushState({}, 'vue2', `${basename}/vue2/toDoList`);
        cy.contains('[data-test=title]', TodoTitle);
        cy.get('.todo-list li').contains('default todo');
        // add todo item
        const newItem = 'new item';
        cy.get('[data-test=new-todo]').type(`${newItem}`);
        cy.get('[data-test=add-btn]').click();
        cy.get('.todo-list li')
          .should('have.length', 2)
          .last()
          .should(($div) => {
            const n = $div.text().trim();
            expect(n).to.equal(newItem);
          });

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
        win.history.pushState({}, 'vue', `${basename}/vue2/remote-component`);
        cy.contains(RemoteComponentTitle);
        cy.contains('old text---chen');
        cy.contains('old text---tao');
        cy.get('[data-test=change-data]').click();
        cy.contains('new text---chen');
        cy.contains('new text---tao');
      };

      win.history.pushState({}, 'vue2', `${basename}/vue2/home`);
      cy.contains('[data-test=title]', HomeTitle)
        .then(() => expect(popstateTriggerTime).to.equal(1))
        .then(TodoListPage)
        .then(backToHome)
        .then(RemoteComponent)
        .then(() => expect(popstateTriggerTime).to.equal(4));
    });
  });

  it('Switch to the React app use Garfish router ', () => {
    const HomeTitle = 'Thank you for the React applications use garfish.';
    const LazyTitle = 'React sub App lazyComponent';
    const RemoteComponentTitle = 'React sub App remote component';

    cy.window().then((win) => {
      expect(popstateTriggerTime).to.equal(4);

      const lazyComponent = () => {
        expect(popstateTriggerTime).to.equal(6);
        // lazy component
        win.Garfish.router.push({ path: '/react17/lazy-component' });
        cy.wait(4000);
        cy.contains('[data-test=title]', LazyTitle);
        expect(popstateTriggerTime).to.equal(6);
      };

      // const RemoteComponent = () => {
      //   // remote component
      //   win.Garfish.router.push({ path: '/react/remote-component' });
      //   cy.contains('[data-test=title]', RemoteComponentTitle);
      // };

      win.Garfish.router.push({ path: '/react17/home' });
      cy.wait(4000);
      cy.contains('[data-test=title]', HomeTitle)
        .then(lazyComponent)
        .then(() => expect(popstateTriggerTime).to.equal(7));
    });
  });

  // TODO: exmaple 中还未增加 js 入口案例
  // it('Switch to the Vue2 app use js entry', () => {
  //   cy.window().then((win) => {
  //     const AboutTitle = 'Vue2 App about page';

  //     const AboutPage = () => {
  //       win.history.pushState({}, 'vue', `${basename}/vue2/about`);
  //       cy.contains('[data-test=title]', AboutTitle);
  //     };

  //     win.history.pushState({}, 'vue2', `${basename}/vue2`);
  //     cy.contains('[data-test=title]', VueHomeTitle)
  //       .then(() => expect(popstateTriggerTime).to.equal(7))
  //       .then(AboutPage)
  //       .then(() => expect(popstateTriggerTime).to.equal(8));
  //   });
  // });

  it('Switch to the Vite app', () => {
    const HomeTitle = 'Hello Vue 3 + Vite';

    cy.window().then((win) => {
      win.Garfish.router.push({ path: '/vite' });
      cy.wait(4000);
      cy.contains('[data-test=title]', HomeTitle)
        .then(() => {
          cy.get('[data-test=vite-count-btn]').click({ force: true });
          cy.contains('button', 'count is: 1');
        })
        .then(() => {
          win.Garfish.router.push({ path: '/vue2/home' });
          cy.contains('[data-test=title]', VueHomeTitle);
        })
        .then(() => {
          win.Garfish.router.push({ path: '/vite' });
          cy.contains('[data-test=title]', HomeTitle);
        });
    });
  });
});
