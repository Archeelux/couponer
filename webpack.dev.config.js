const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
    entry: {
        main: ["webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true", "./src/index.js"]
    },
    output: {
        path: path.join(__dirname, "/dist"),
        publicPath: "/",
        filename: "[name].js"
    },
    mode: "development",
    target: "web",
    devtool: "#source-map",
    module: {
        rules: [
            {
                // Loads the javacript into html template provided.
                // Entry point is set below in HtmlWebPackPlugin in Plugins
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                        //options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ["file-loader"]
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html",
            excludeChunks: ["server"]
        }),
        new webpack.NoEmitOnErrorsPlugin()
    ]
};
