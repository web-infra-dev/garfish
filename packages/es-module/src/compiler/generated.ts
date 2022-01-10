export function identifier(name) {
  return { name, type: 'Identifier' };
}

export function literal(value) {
  return {
    value,
    type: 'Literal',
  };
}

export function variableDeclarator(id, init) {
  return {
    id,
    init,
    type: 'VariableDeclarator',
  };
}

// kind: 'var' | 'let' | 'const'
export function variableDeclaration(kind, declarations) {
  return {
    kind,
    declarations,
    type: 'VariableDeclaration',
  };
}

export function callExpression(callee, _arguments) {
  return {
    callee,
    arguments: _arguments,
    type: 'CallExpression',
  };
}

// kind: init | get | set
export function objectProperty(
  key,
  value,
  method,
  kind = 'init',
  computed = false,
  shorthand = false,
  decorators = null,
) {
  return {
    key,
    value,
    kind,
    method,
    computed,
    shorthand,
    decorators,
    type: 'Property',
  };
}

export function arrowFunctionExpression(params, body, async = false) {
  return {
    params,
    body,
    async,
    type: 'ArrowFunctionExpression',
  };
}

export function objectExpression(properties) {
  return {
    properties,
    type: 'ObjectExpression',
  };
}

export function memberExpression(
  object,
  property,
  computed = false,
  optional = null,
) {
  return {
    object,
    property,
    computed,
    optional,
    type: 'MemberExpression',
  };
}

export function expressionStatement(expression, directive) {
  const node = {
    expression,
    type: 'ExpressionStatement',
  };
  if (directive) node.directive = directive;
  return node;
}

export function blockStatement(body) {
  return {
    body,
    type: 'BlockStatement',
  };
}

export function functionDeclaration(
  id,
  params,
  body,
  generator = false,
  async = false,
) {
  return {
    id,
    params,
    body,
    async,
    generator,
    type: 'FunctionDeclaration',
  };
}

export function assignmentExpression(operator, left, right) {
  return {
    operator,
    left,
    right,
    type: 'AssignmentExpression',
  };
}
