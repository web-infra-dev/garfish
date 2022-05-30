function readPackage(pkg, context) {
  // console.log('----pkg.name', pkg);
  // vue-template-compiler use vue as devDependency and use file protocol
  if (pkg.name === 'vue-template-compiler' && pkg.version.startsWith('2.')) {
    pkg.devDependencies = {
      ...pkg.devDependencies,
      vue: '^2.0.0',
    }
    pkg.peerDependencies = {
      vue: '^2.0.0',
    }
    context.log('vue => vue@2 in dependencies of vue-template-compiler');
  }

  if (pkg.name === 'swiper') {
    pkg.dependencies = {
      ...pkg.dependencies,
      react: '^17',
      'react-dom': '^17',
    }
    context.log('swiper => swiper in dependencies of react^17');
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
}
