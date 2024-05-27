const path = require('path');

module.exports = {
    // Other configuration options...

    resolve: {
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "buffer": require.resolve("buffer/")
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            }
        ]
    },
    plugins: [
        // Other plugins...
    ]
};
