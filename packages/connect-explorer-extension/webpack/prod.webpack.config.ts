import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const DIST = path.resolve(__dirname, '../build');

const config: webpack.Configuration = {
    target: 'web',
    mode: 'production',
    entry: {
        popup: path.join(__dirname, '..', 'src', 'pages', 'popup', 'index.tsx'),
        connectManager: path.join(__dirname, '..', 'src', 'pages', 'connect-manager', 'index.tsx'),
        serviceWorker: path.join(__dirname, '..', 'src', 'background', 'serviceWorker.ts'),
    },
    output: {
        filename: '[name].bundle.js',
        path: DIST,
        publicPath: './',
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['@babel/preset-react', '@babel/preset-typescript'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            [
                                'babel-plugin-styled-components',
                                {
                                    displayName: true,
                                    preprocess: true,
                                },
                            ],
                        ],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: ['node_modules'],
        mainFields: ['browser', 'module', 'main'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            filename: 'popup.html',
            template: path.join(__dirname, '..', 'src', 'pages', 'popup', 'index.html'),
            inject: true,
            minify: false,
        }),
        new HtmlWebpackPlugin({
            chunks: ['connectManager'],
            filename: 'connect-manager.html',
            template: path.join(__dirname, '..', 'src', 'pages', 'connect-manager', 'index.html'),
            inject: true,
            minify: false,
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(__dirname, '..', 'src', 'manifest.json'),
                    to: `${DIST}/`,
                },
            ],
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(__dirname, '..', 'vendor'),
                    to: `${DIST}/vendor`,
                },
            ],
        }),
    ],
};

export default config;
