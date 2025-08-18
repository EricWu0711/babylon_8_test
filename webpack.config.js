const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/app.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
            fs: false,
            'path': false, // ammo.js seems to also use path
        },
        alias: {
            '@res': path.resolve(__dirname, 'res')
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|glb|gltf)$/i,
                loader: 'file-loader',
                options: {
                    publicPath: './',
                    name: '[name].[ext]'
                },
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
            { from: 'res', to: 'res' },
            ],
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 3000,
        open: true,
    },
};
