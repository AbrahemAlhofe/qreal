const uglify = require('rollup-plugin-uglify-es');

module.exports = {
  input : 'src/index.js',
  output : {
    file : 'qreal.js',
    format : 'umd'
  },
  plugins : [ uglify() ]
}
