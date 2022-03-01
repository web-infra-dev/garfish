function readPackage(pkg, context) {
  // vue-template-compiler use vue as devDependency and use file protocol
  if (pkg.name === 'vue-template-compiler' && pkg.version.startsWith('2.')) {
    pkg.devDependencies = {
      ...pkg.devDependencies,
      vue: '^2.0.0',
    }
    pkg.peerDependencies = {
      vue: '^2.0.0',
    };
    context.log('vue => vue@2 in dependencies of vue-template-compiler');
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
}
