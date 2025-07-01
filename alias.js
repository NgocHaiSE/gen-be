const moduleAlias = require('module-alias');

moduleAlias.addAliases({
  '@data': __dirname + '/data/',
  '@src': __dirname + '/src/'
});

// moduleAlias.addAliases({
//   './data/': __dirname + 'data/',
//   './src/*': __dirname + '@/*'
// });
