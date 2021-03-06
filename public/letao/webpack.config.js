const path = require("path");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
var htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // 新增
module.exports={
    entry:path.join(__dirname,"./src/js/main.js"),
    output:{
        path:path.join(__dirname,"./dist"),
        filename:"bundle.js"
    },
    resolve:{
        extensions: ['.js', '.vue', '.json','.ttf'],
    },
    plugins:[
        new VueLoaderPlugin(),
        new htmlWebpackPlugin({
            template: path.join(__dirname, './src/index.html'), // 指定模板文件路径
            filename: 'index.html' // 设置生成的内存页面的名称
        }),
        new webpack.NamedModulesPlugin(), // 新增
        new webpack.HotModuleReplacementPlugin() //新增
    ],
    module:{
        rules:[
            {test:/\.css$/,use:["style-loader","css-loader"]},
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
            {test:/\.vue$/,use:"vue-loader"},
            { test: /\.(jpg|png|gif|bmp|jpeg|ttf|otf|eot|svg|woff|woff2)$/, use: 'url-loader?limit=7631&name=[hash:8]-[name].[ext]'}
        ]
    }
};