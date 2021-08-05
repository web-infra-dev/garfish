import matches from 'lodash/matches';

export function findMultiAndMatch(count, findFn, matchFn) {
  let data = [];
  function assert(body) {
    data = data.concat(body?.list?.filter(findFn).filter(matchFn) || []);
    expect(data.length).to.be.equal(count);
  }
  cy.wait('@post').its('request.body').then(assert);
}

export const matchAndMatch = matchMultiAndMatch.bind(null, 1);

export function matchMultiAndMatch(count, findObj, matchObj) {
  findMultiAndMatch(count, matches(findObj), matches(matchObj));
}
