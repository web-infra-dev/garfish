import type {
  Literal,
  Property,
  Identifier,
  CallExpression,
  ObjectExpression,
  MemberExpression,
  AssignmentExpression,
  ArrowFunctionExpression,
  BlockStatement,
  ExpressionStatement,
  VariableDeclarator,
  VariableDeclaration,
  FunctionDeclaration,
} from 'estree';

export function identifier(name: string): Identifier {
  return { name, type: 'Identifier' };
}

export function literal(value: Literal['value']): Literal {
  return {
    value,
    type: 'Literal',
  } as any;
}

export function variableDeclarator(
  id: VariableDeclarator['id'],
  init: VariableDeclarator['init'],
): VariableDeclarator {
  return {
    id,
    init,
    type: 'VariableDeclarator',
  };
}

// kind: 'var' | 'let' | 'const'
export function variableDeclaration(
  kind: VariableDeclaration['kind'],
  declarations: VariableDeclaration['declarations'],
): VariableDeclaration {
  return {
    kind,
    declarations,
    type: 'VariableDeclaration',
  };
}

export function callExpression(
  callee: CallExpression['callee'],
  _arguments: CallExpression['arguments'],
  optional = false,
): CallExpression {
  return {
    callee,
    optional,
    arguments: _arguments,
    type: 'CallExpression',
  };
}

// kind: init | get | set
export function objectProperty(
  key: Property['key'],
  value: Property['value'],
  kind: Property['kind'] = 'init',
  method = false,
  computed = false,
  shorthand = false,
  decorators = null,
): Property {
  return {
    key,
    value,
    kind,
    method,
    computed,
    shorthand,
    decorators,
    type: 'Property',
  } as any;
}

export function arrowFunctionExpression(
  params: ArrowFunctionExpression['params'],
  body: ArrowFunctionExpression['body'],
  async = false,
  expression = false,
): ArrowFunctionExpression {
  return {
    params,
    body,
    async,
    expression,
    type: 'ArrowFunctionExpression',
  };
}

export function objectExpression(
  properties: ObjectExpression['properties'],
): ObjectExpression {
  return {
    properties,
    type: 'ObjectExpression',
  };
}

export function memberExpression(
  object: MemberExpression['object'],
  property: MemberExpression['property'],
  computed = false,
  optional = null,
): MemberExpression {
  return {
    object,
    property,
    computed,
    optional,
    type: 'MemberExpression',
  };
}

export function expressionStatement(
  expression: ExpressionStatement['expression'],
  directive: string,
): ExpressionStatement {
  const node: any = {
    expression,
    type: 'ExpressionStatement',
  };
  if (directive) node.directive = directive;
  return node;
}

export function blockStatement(body: BlockStatement['body']): BlockStatement {
  return {
    body,
    type: 'BlockStatement',
  };
}

export function functionDeclaration(
  id: FunctionDeclaration['id'],
  params: FunctionDeclaration['params'],
  body: FunctionDeclaration['body'],
  generator = false,
  async = false,
): FunctionDeclaration {
  return {
    id,
    params,
    body,
    async,
    generator,
    type: 'FunctionDeclaration',
  };
}

export function assignmentExpression(
  operator: AssignmentExpression['operator'],
  left: AssignmentExpression['left'],
  right: AssignmentExpression['right'],
): AssignmentExpression {
  return {
    operator,
    left,
    right,
    type: 'AssignmentExpression',
  };
}
