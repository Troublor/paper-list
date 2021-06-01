/* config-overrides.js */
const path = require('path');
const webpack = require('webpack')
const fs = require("fs");
const yaml = require('js-yaml');

const args = process.argv.slice(2);

const settings = yaml.load(fs.readFileSync(args[0], {encoding: 'utf-8'}));

module.exports = {
    webpack: function override(config) {
        const env = {
            DATA_SOURCE: JSON.stringify(settings.data.source),
            ZOTERO_TYPE: JSON.stringify(settings.data.type),
            ZOTERO_ID: JSON.stringify(settings.data.id),
            ZOTERO_APIKEY: JSON.stringify(settings.data.apiKey),
            JSON_PATH: JSON.stringify(settings.data.path),
            JSON_DATA: settings.data.path && fs.readFileSync(settings.data.path, {encoding: 'utf-8'}),
        };
        //do stuff with the webpack config...
        config.plugins.unshift(new webpack.DefinePlugin(env))

        return config;
    },
    paths: function (paths, env) {
        paths.appBuild = settings.outDir ?? paths.appBuild;
        return paths;
    },
}