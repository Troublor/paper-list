import React from 'react';
import './App.css';
import Literatures from "./Literatures";
import Container from "react-bootstrap/Container";
import 'bootstrap/dist/css/bootstrap.min.css';
import {LiteratureEntry} from "./types";
import {library2json} from "./collectors/zotero";
import {bibtex2entries} from "./collectors/bibtex";

interface AppState {
    paperList: LiteratureEntry[]
    loading: boolean
    title: string
    description: string
}

export default class App extends React.Component<unknown, AppState> {
    private fetchPromise: Promise<LiteratureEntry[]>;

    constructor(prop: unknown) {
        super(prop);

        // @ts-ignore
        this.state = {paperList: [], loading: true, title: TITLE, description: DESCRIPTION}

        // load paper list based on settings.yml
        // @ts-ignore
        switch (DATA_SOURCE.toLowerCase()) {
            case "zotero":
                // @ts-ignore
                const zType: "user" | "group" = ZOTERO_TYPE.toLowerCase();
                // @ts-ignore
                const zId: string = ZOTERO_ID;
                // @ts-ignore
                const zApiKey: string = ZOTERO_APIKEY;
                this.fetchPromise = library2json(zType, zId, zApiKey);
                break;
            case "json":
                // @ts-ignore
                const json: Record<string, unknown>[] = JSON_DATA;
                this.fetchPromise = Promise.resolve(json.map((entry, index) => {
                    return {
                        id: entry.id ?? index.toString(),
                        title: entry.title,
                        type: entry.type ?? null,
                        authors: (entry.authors as string[]).map(au => {
                            return {
                                firstName: "",
                                lastName: au
                            }
                        }),
                        venue: entry.venue,
                        venueShort: entry.venueShort ?? entry.venue,
                        date: new Date((entry.date ?? entry.year ?? Date.now()) as string | number),
                        tags: entry.tags,
                        url: entry.url ?? entry.link ?? ""
                    } as LiteratureEntry
                }));
                break;
            case "bibtex":
                //@ts-ignore
                const bibtex: string = BIBTEX_DATA;
                this.fetchPromise = Promise.resolve(bibtex2entries(bibtex));
                break;
            default:
                this.fetchPromise = Promise.resolve([]);
        }
    }

    componentDidMount() {
        this.fetchPromise.then(r => this.setState({paperList: r, loading: false}));
        document.title = this.state.title;
    }

    render() {
        if (this.state.loading) {
            return <div>Loading data...</div>;
        } else {
            return <Container>
                <h1 className="mt-5">{this.state.title}</h1>
                { this.state.description && <p>{this.state.description}</p>}
                <hr/>
                <Literatures entries={this.state.paperList}/>
            </Container>
        }
    }
};
