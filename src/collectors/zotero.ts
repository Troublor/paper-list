import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import {LiteratureEntry, LiteratureType} from 'react-paper-list';
import * as process from 'process';

async function main(): Promise<void> {
    if (process.argv.length < 6) {
        // arguments: type (user or group), userOrGroupID, collectionKeys, apiKey (optional)
        console.error('Arguments: type (user or group), userOrGroupID, apiKey (optional)');
        process.exit(1);
    }
    const t: 'user' | 'group' = process.argv[2] as 'user' | 'group';
    if (t !== 'user' && t !== 'group') {
        console.error('Type must be \'user\' or \'group\'');
        process.exit(1);
    }
    const id: string = process.argv[3];
    const collectionKeys = process.argv[4].split(',').map(s => s.trim());
    const apiKey = process.argv[5];
    const literatures = await library2json(t, id, collectionKeys, apiKey);
    fs.writeFileSync(path.join(__dirname, '..', 'paper_list.json'), JSON.stringify(literatures.map(l => {
        // @ts-ignore
        l.authors = l.authors.map(a => `${a.firstName} ${a.lastName}`);
        return l;
    }), null, 2));
}

interface ZoteroItem {
    key: string,
    data: {
        key: string,
        version: string,
        itemType: string,
        title: string,
        creators: {
            creatorType: string,
            firstName: string,
            lastName: string,
        }[]
        date: string,
        proceedingsTitle?: string,
        conferenceName?: string,
        publicationTitle?: string,
        url: string,
        doi: string,
        tags: {
            tag: string,
            type: number,
        }[],
    }
}

export async function library2json(t: 'user' | 'group', id: string, collectionKeys: string[] = [], apiKey?: string): Promise<LiteratureEntry[]> {
    const literatures: LiteratureEntry[] = [];
    let data: ZoteroItem[] = [];
    const headers: Record<string, unknown> = {
        'Zotero-API-Version': 3,
    };
    if (apiKey) headers['Zotero-API-Key'] = apiKey;
    if (collectionKeys.length === 0) {
        do {
            const resp = await axios.get(`https://api.zotero.org/${t}s/${id}/items`, {
                headers,
                params: {
                    format: 'json',
                    itemType: 'journalArticle || conferencePaper',
                    start: literatures.length,
                    limit: 100,
                },
            });
            data = resp.data;
            console.log(`Fetched ${data.length} items from Zotero`);
            literatures.push(...zoteroItem2Metadata(data));
        } while (data.length >= 100);
    } else {
        // collect all sub collections
        const candidates = [...collectionKeys];
        while (candidates.length > 0) {
            const candidate = candidates.shift();
            const resp = await axios.get(`https://api.zotero.org/${t}s/${id}/collections/${candidate}/collections`, {
                headers,
            });
            console.log(`Found ${resp.data.length} collections`);
            for (const c of resp.data as { key: string }[]) {
                if (!collectionKeys.includes(c.key)) collectionKeys.push(c.key);
                candidates.push(c.key);
            }
        }

        console.log(`All collections:`, collectionKeys);

        for (const collectionKey of collectionKeys) {
            const temp: LiteratureEntry[] = [];
            do {
                const resp = await axios.get(`https://api.zotero.org/${t}s/${id}/collections/${collectionKey}/items`, {
                    headers,
                    params: {
                        format: 'json',
                        itemType: 'journalArticle || conferencePaper',
                        start: temp.length,
                        limit: 100,
                    },
                });
                data = resp.data;
                console.log(`Fetched ${data.length} items from collection ${collectionKey}`);
                temp.push(...zoteroItem2Metadata(data));
            } while (data.length >= 100);
            literatures.push(...temp);
        }

        console.log(`All items:`, literatures);
    }

    return literatures;
}

function zoteroItem2Metadata(items: ZoteroItem[]): LiteratureEntry[] {
    const literatures: LiteratureEntry[] = [];
    for (const item of items) {
        if (item.data.conferenceName === '') item.data.conferenceName = undefined;
        if (item.data.proceedingsTitle === '') item.data.proceedingsTitle = undefined;
        if (item.data.publicationTitle === '') item.data.publicationTitle = undefined;
        const venue = item.data.conferenceName ?? item.data.proceedingsTitle ?? item.data.publicationTitle ?? null;

        const date = item.data.date ? new Date(item.data.date) : null;
        let type: LiteratureType | null;
        switch (item.data.itemType) {
            case 'journalArticle':
                type = 'Journal Article';
                break;
            case 'conferencePaper':
                type = 'Conference Paper';
                break;
            default:
                type = null;
        }
        literatures.push({
            id: item.data.key,
            type,
            title: item.data.title,
            authors: item.data.creators,
            venue,
            venueShort: null,
            date,
            tags: item.data.tags.map(t => t.tag).filter(t => t.toLowerCase() !== 'todo'),
            awards: [],

            projectUrl: null,
            paperUrl: item.data.url ?? null,
            slidesUrl: null,
            abstract: null,
            bibtex: null,
        });
    }
    return literatures;
}

if (require.main === module) {
    main().catch(console.error);
}
