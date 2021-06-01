export type LiteratureType = 'Conference Paper' | 'Journal Article';

export interface LiteratureAuthor {
    firstName: string,
    lastName: string,
}

export interface LiteratureEntry {
    id: string;
    type: LiteratureType | null;
    title: string;
    authors: LiteratureAuthor[];
    date: Date;
    venue: string;
    venueShort: string;
    tags: string[];
    url: string;
}

export type SortCriteria = 'title' | 'venue' | 'year' | 'author' | 'similarity';