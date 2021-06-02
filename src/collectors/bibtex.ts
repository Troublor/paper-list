import {LiteratureAuthor, LiteratureEntry} from "../types";
import {randomInt} from "crypto";

const bibtex = require('bibtex-parse-js');

export function bibtex2entries(bibtexString: string): LiteratureEntry[] {
    const bib = bibtex.toJSON(bibtexString);
    const result: LiteratureEntry[] = [];

    const normalize = (payload: string) : string=> {
        return payload.replace(/([{}])/gi, "")
    }

    for (const entry of bib) {
        if (entry.entryType === 'article') {
            const authors: LiteratureAuthor[] = !entry.entryTags['author'] ? [] :
                entry.entryTags['author'].split('and').map((n: string) => {
                    const secs = n.trim().split(', ');
                    return {
                        firstName: secs[1],
                        lastName: secs[0],
                    } as LiteratureAuthor
            });
            result.push({
                id: entry.citationKey as string ?? randomInt(100000).toString(),
                type: "Journal Article",
                title: entry.entryTags['title'] ? normalize(entry.entryTags['title']):  "No Title",
                authors,
                date: entry.entryTags['year'] ? new Date(entry.entryTags['year']) : null,
                venue: entry.entryTags['journal'] ?? null,
                venueShort: null,
                url: entry.entryTags['url'] ?? null,
                tags: [],
            } as LiteratureEntry)
        } else if (entry.entryType === 'inproceedings') {
            const authors: LiteratureAuthor[] = !entry.entryTags['author'] ? [] :
                entry.entryTags['author'].split('and').map((n: string) => {
                    const secs = n.trim().split(', ');
                    return {
                        firstName: secs[1],
                        lastName: secs[0],
                    } as LiteratureAuthor
                });
            result.push({
                id: entry.citationKey as string ?? randomInt(100000).toString(),
                type: "Conference Paper",
                title: entry.entryTags['title'] ? normalize(entry.entryTags['title']):  "No Title",
                authors,
                date: entry.entryTags['year'] ? new Date(entry.entryTags['year']) : null,
                venue: entry.entryTags['booktitle'] ? normalize(entry.entryTags['booktitle']) : null,
                venueShort: null,
                url: entry.entryTags['url'] ?? null,
                tags: [],
            } as LiteratureEntry)
        }
    }

    return result;
}
