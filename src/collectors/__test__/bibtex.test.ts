import * as fs from "fs";
import * as path from "path";
import {bibtex2entries} from "../bibtex";

describe('bibtex collector', () => {
    test('parse bibtex file', () => {
        const bibtex = require('bibtex-parse-js');
        const content = fs.readFileSync(path.join(__dirname, 'test.bib'), {encoding: 'utf-8'});
        const r = bibtex.toJSON(content);
        console.log(r)
    });
})