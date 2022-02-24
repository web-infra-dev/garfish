function readPackage(pkg, context) {
  // Override the manifest of foo@1.x after downloading it from the registry
  if (pkg.name === 'vue-template-compiler' && pkg.version.startsWith('2.')) {
    // Replace bar@x.x.x with bar@2.0.0
    pkg.devDependencies = {
      ...pkg.devDependencies,
      vue: '^2.0.0'
    }
    pkg.peerDependencies = {
      vue: '^2.0.0'
    };

    context.log('vue => vue@2 in dependencies of vue-template-compiler')
  }

  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
