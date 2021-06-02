/* config-overrides.js */
const path = require('path');
const webpack = require('webpack')
const fs = require("fs");
const yaml = require('js-yaml');

const args = process.argv.slice(2);

const settings = yaml.load(fs.readFileSync(args[0], {encoding: 'utf-8'}));

module.exports = {
    webpack: function override(config) {
        let env = {
            DATA_SOURCE: JSON.stringify(settings.data.source),
            VENUE_MAPPING: settings.venueMapping && fs.readFileSync(settings.venueMapping, {encoding: 'utf-8'}),
            TITLE: JSON.stringify(settings.title) ?? "Paper List",
            DESCRIPTION: settings.description ? JSON.stringify(settings.description) : undefined,
        };
        console.log(JSON.stringify(settings, null, 2), env);
        switch (settings.data.source.toLowerCase()) {
            case 'zotero':
                env = {
                    ...env,
                    ZOTERO_TYPE: JSON.stringify(settings.data.type),
                    ZOTERO_ID: JSON.stringify(settings.data.id),
                    ZOTERO_APIKEY: JSON.stringify(settings.data.apiKey),
                }
                break;
            case 'json':
                env = {
                    ...env,
                    JSON_PATH: JSON.stringify(settings.data.path),
                    JSON_DATA: settings.data.path && fs.readFileSync(settings.data.path, {encoding: 'utf-8'}),
                }
                break;
            case 'bibtex':
                env = {
                    ...env,
                    BIBTEX_PATH: JSON.stringify(settings.data.path),
                    BIBTEX_DATA: settings.data.path && JSON.stringify(fs.readFileSync(settings.data.path, {encoding: 'utf-8'})),
                }
                break;
            default:
                throw new Error("invalid settings");
        }

        //do stuff with the webpack config...
        config.plugins.unshift(new webpack.DefinePlugin(env));

        return config;
    },
    paths: function (paths, env) {
        paths.appBuild = settings.outDir ?? paths.appBuild;
        return paths;
    },
}