module.exports = {
    productionSourceMap: false,
    devServer: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        }
    },
    configureWebpack: {
        externals: {
            'mathjs': 'math',
            'vuetify': 'Vuetify',
            'vue': "Vue",
        },
    },
    transpileDependencies: [
        'vuetify'
    ]
}