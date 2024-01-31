const path = require('path');

module.exports = {
   entry: './modules/content.js',
   mode: 'production',
   optimization: {
      minimize: false
   },
   /* devtool: 'source-map', */ // or 'cheap-module-source-map', etc.
   output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'kick-chat-flusher.js'
   },
   devServer: {
      static: './dist/',
      hot: true,
      devMiddleware: {
         publicPath: '/dist/',
         writeToDisk: true,
      },
   },
   module: {
      rules: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
               loader: 'babel-loader'
            }
         }
      ]
   }
};
