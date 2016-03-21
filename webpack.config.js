var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    context: __dirname + "",
    entry: {
        client: "./src/web/app.jsx"
    },
    output: {
        filename: 'index_bundle.js',
        path: "dist",
        //publicPath: '/', //set this to override relative paths
        //hash:true // ??
    },
    plugins: [new HtmlWebpackPlugin({
        title:'Pixel Eater',
        //template: 'src/web/index.html', //set this to use a template html file
    })],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015', 'react']
                }
            },

            {   test: /\.css$/, loader: "style!css" },

            {   test: /\.ttf$/,   loader: "file?name=[name].[ext]"  },
            {   test: /\.woff$/,  loader: "file?name=[name].[ext]"  },
            {   test: /\.woff2$/, loader: "file?name=[name].[ext]"  },
            {   test: /\.eot$/,   loader: "file?name=[name].[ext]"  },
            {   test: /\.svg$/,   loader: "file?name=[name].[ext]"  },

        ]
    }
};

