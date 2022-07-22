import matches from 'lodash/matches';

export function findMultiAndMatch(count, findObj, matchObj, equalObj, timeout) {
  let data = [];
  function assert(body) {
    data = data.concat(
      body?.list?.filter(matches(findObj)).filter(matches(matchObj)) || [],
    );
    if (data.length < count) {
      cy.wait('@post', { timeout }).its('request.body').then(assert);
    } else {
      data[0] && expect(data[0]).to.nested.include(equalObj);
      expect(data.length).to.be.equal(count);
    }
  }
  cy.wait('@post').its('request.body').then(assert);
}

export function matchMultiAndMatch(
  count,
  findObj,
  matchObj,
  equalObj,
  timeout = 3000,
) {
  // findMultiAndMatch(count, matches(findObj), matches(matchObj));
  findMultiAndMatch(count, findObj, matchObj, equalObj, timeout);
}
