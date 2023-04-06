const path = require('path'),
    MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: './src/main/resources/web/include/index.js',
    mode: 'production',
    output: {
        filename: 'boa-xlr-reporting-plugin.js',
        path: path.resolve(__dirname, 'build/resources/main/web/include')
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [{
                    loader: 'babel-loader',
                    options: {presets: ['env', 'stage-0']}
                }],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            },
            {
                test: /\.html$/,
                use: 'raw-loader'
            }
        ],
    },
};