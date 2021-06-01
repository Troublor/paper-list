import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import {LiteratureEntry, LiteratureType} from "../types";

async function main(): Promise<void> {
    if (process.argv.length < 4) {
        // arguments: type (user or group), userOrGroupID, apiKey (optional)
        console.error('Arguments: type (user or group), userOrGroupID, apiKey (optional)');
        process.exit(1);
    }
    const t: 'user' | 'group' = process.argv[2] as 'user' | 'group';
    if (t !== 'user' && t !== 'group') {
        console.error('Type must be \'user\' or \'group\'');
        process.exit(1);
    }
    const id: string = process.argv[3];
    const literatures = await library2json(t, id);
    fs.writeFileSync(path.join(__dirname, '..', 'paper_list.js'), 'const paper_list =' + JSON.stringify(literatures, null, 2));
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

export async function library2json(t: 'user' | 'group', id: string, apiKey?: string): Promise<LiteratureEntry[]> {
    const literatures: LiteratureEntry[] = [];
    let data: ZoteroItem[] = [];
    const headers: Record<string, unknown> = {
        'Zotero-API-Version': 3,
    }
    if (apiKey) headers['Zotero-API-Key'] = apiKey;
    do {
        const resp = await axios.get(`https://api.zotero.org/${t}s/${id}/items`, {
            headers,
            params: {
                format: 'json',
                itemType: 'journalArticle || conferencePaper',
                start: literatures.length,
                limit: 100,
            }
        });
        data = resp.data;
        console.log(`Fetched ${data.length} items from Zotero`);
        literatures.push(...zoteroItem2Metadata(data));
    } while (data.length >= 100);
    return literatures;
}

function zoteroItem2Metadata(items: ZoteroItem[]): LiteratureEntry[] {
    const literatures: LiteratureEntry[] = [];
    for (const item of items) {
        if (item.data.conferenceName === '') item.data.conferenceName = undefined;
        if (item.data.proceedingsTitle === '') item.data.proceedingsTitle = undefined;
        if (item.data.publicationTitle === '') item.data.publicationTitle = undefined;
        const venue = item.data.conferenceName ?? item.data.proceedingsTitle ?? item.data.publicationTitle ?? '';

        const date = new Date(item.data.date);
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
            url: item.data.url,
            authors: item.data.creators,
            venue,
            venueShort: "",
            date,
            tags: item.data.tags.map(t => t.tag).filter(t=>t.toLowerCase() !== 'todo'),
        });
    }
    return literatures;
}

if (require.main === module) {
    main().catch(console.error);
}