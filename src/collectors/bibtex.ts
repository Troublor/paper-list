import {LiteratureEntry, LiteratureAuthor} from '../react-paper-list';
import {randomInt} from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const bibtex = require('bibtex-parse-js');

export function bibtex2entries(bibtexString: string): LiteratureEntry[] {
  const bib = bibtex.toJSON(bibtexString);
  const result: LiteratureEntry[] = [];

  const normalize = (payload: string) : string=> {
    return payload.replace(/([{}])/gi, '');
  };

  for (const entry of bib) {
    if (entry.entryType === 'article') {
      const authors: LiteratureAuthor[] = !entry.entryTags['author'] ? [] :
                entry.entryTags['author'].split('and').map((n: string) => {
                  const secs = n.trim().split(', ');
                  return {
                    firstName: secs[1],
                    lastName: secs[0],
                  } as LiteratureAuthor;
                });
      result.push({
        id: entry.citationKey as string ?? randomInt(100000).toString(),
        type: 'Journal Article',
        title: entry.entryTags['title'] ? normalize(entry.entryTags['title']): 'No Title',
        authors,
        date: entry.entryTags['year'] ? new Date(entry.entryTags['year']) : null,
        venue: entry.entryTags['journal'] ?? null,
        venueShort: null,
        tags: [],
        awards: [],

        projectUrl: null,
        slidesUrl: null,
        paperUrl: entry.entryTags['url'] ?? null,
        abstract: null,
        bibtex: null,
      } as LiteratureEntry);
    } else if (entry.entryType === 'inproceedings') {
      const authors: LiteratureAuthor[] = !entry.entryTags['author'] ? [] :
                entry.entryTags['author'].split('and').map((n: string) => {
                  const secs = n.trim().split(', ');
                  return {
                    firstName: secs[1],
                    lastName: secs[0],
                  } as LiteratureAuthor;
                });
      result.push({
        id: entry.citationKey as string ?? randomInt(100000).toString(),
        type: 'Conference Paper',
        title: entry.entryTags['title'] ? normalize(entry.entryTags['title']): 'No Title',
        authors,
        date: entry.entryTags['year'] ? new Date(entry.entryTags['year']) : null,
        venue: entry.entryTags['booktitle'] ? normalize(entry.entryTags['booktitle']) : null,
        venueShort: null,
        tags: [],
        awards: [],

        projectUrl: null,
        slidesUrl: null,
        paperUrl: entry.entryTags['url'] ?? null,
        abstract: null,
        bibtex: null,
      } as LiteratureEntry);
    }
  }

  return result;
}

function main() {
  const content = fs.readFileSync(process.argv[2], {encoding: 'utf-8'});
  const entries = bibtex2entries(content);
  fs.writeFileSync(path.join(__dirname, '..', '..', 'output.json'), JSON.stringify(entries, null, 2));
}

if (require.main === module) {
  main();
}
