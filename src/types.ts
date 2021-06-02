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
    date: Date | null;
    venue: string | null;
    venueShort: string | null;
    tags: string[];
    url: string | null;
}

export type SortCriteria = 'title' | 'venue' | 'year' | 'author' | 'similarity';