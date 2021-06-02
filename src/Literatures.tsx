import React, {ChangeEvent} from "react";
import {LiteratureEntry, SortCriteria} from "./types";
import List from "./components/List";
import MultiChoices from "./components/MultiChoices";
import Nbsp from "./components/Nbsp";
import _ from "lodash";
import {findBestMatch} from "string-similarity";

interface LiteraturesProp {
    entries: LiteratureEntry[];
}

interface LiteraturesState {
    // filtering
    searchPayload: string
    sortCriterion: SortCriteria;
    reverse: boolean;
    venues: string[];
    years: string[];
    tags: string[];

    // status quo
    allVenues: string[];
    allTags: string[];
    allYears: string[];
}

export default class Literatures extends React.Component<LiteraturesProp, LiteraturesState> {
    constructor(prop: LiteraturesProp) {
        super(prop);

        this.autoFillVenueShort();

        const allVenues = _.uniq(this.props.entries.filter(e => e.venueShort).map(e => e.venueShort as string));
        allVenues.push("No Venue");
        const allYears = _.uniq(this.props.entries.filter(e => e.date).map(e => (e.date as Date).getFullYear().toString()));
        allYears.push("No Year");
        const allTags = _.uniq(this.props.entries.reduce((previousValue, currentValue) => {
            previousValue.push(...currentValue.tags);
            return previousValue;
        }, [] as string[]));
        allTags.push("No Tag");

        this.state = {
            searchPayload: "",
            sortCriterion: 'title',
            reverse: false,
            venues: allVenues,
            years: allYears,
            tags: allTags,

            allTags,
            allYears,
            allVenues,
        }

        this.onSearchBoxChange = this.onSearchBoxChange.bind(this);
        this.onSortCriterionChange = this.onSortCriterionChange.bind(this);
        this.onReverseChange = this.onReverseChange.bind(this);
        this.onFilterChoicesChange = this.onFilterChoicesChange.bind(this);
    }

    private autoFillVenueShort() {
        // @ts-ignore
        const mapping = VENUE_MAPPING;
        if (!mapping) return;
        this.props.entries.forEach(en=>{
            if (en.venue && en.venue.length > 0 && !en.venueShort) {
                const matches = findBestMatch(en.venue, Object.keys(mapping));
                if (matches.bestMatch.rating < 0.5) {
                    en.venueShort = en.venue;
                } else {
                    en.venueShort = mapping[matches.bestMatch.target];
                }
            }
        })
    }

    get searchKeywords() {
        if (this.state.searchPayload.length === 0) return [];

        return this.state.searchPayload.trim()
            .split(' ')
            .filter(s => s.length > 0)
            .map(k => k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));// $& means the whole matched string
    }

    get visibleEntries(): LiteratureEntry[] {
        const result: LiteratureEntry[] = [];

        for (const entry of this.props.entries) {
            if ((this.state.years.includes("No Year") && !entry.date || entry.date && this.state.years.includes(entry.date.getFullYear().toString())) && // year match
                (this.state.tags.includes("No Tag") && entry.tags.length <= 0 || entry.tags.length > 0 && entry.tags.some(v => this.state.tags.includes(v))) && // tag match
                (this.state.venues.includes("No Venue") && !entry.venueShort || entry.venueShort && this.state.venues.includes(entry.venueShort)) && // venue match
                (this.searchKeywords.length === 0 || this.calSimilarity(entry) > 0) // if there is search keywords, similarity > 0
            ) {
                result.push(entry);
            }
        }

        return result.sort((a, b) => {
            let flag: number;
            switch (this.state.sortCriterion) {
                case "venue":
                    if (!a.venueShort) flag = -1;
                    else if (!b.venueShort) flag = 1;
                    else flag = a.venueShort < b.venueShort ? -1 : 1;
                    break;
                case "author":
                    flag = a.authors.map(au => `${au.firstName} ${au.lastName}`).join(',') < b.authors.map(au => `${au.firstName} ${au.lastName}`).join(',') ? -1 : 1;
                    break;
                case "title":
                    flag = a.title < b.title ? -1 : 1;
                    break;
                case "year":
                    if (!a.date) flag = -1;
                    else if (!b.date) flag = 1;
                    else flag = a.date < b.date ? -1 : 1;
                    break;
                case "similarity":
                    flag = this.calSimilarity(a) < this.calSimilarity(b) ? -1 : 1;
                    break;
                default:
                    flag = 0;
            }
            return this.state.reverse ? -flag : flag;
        });
    }

    /**
     * Calculate the similarity between this.searchKeywords and the given entry.
     *
     * @param entry
     * @private
     * @return the similarity [0,100]: the higher the more similar
     */
    private calSimilarity(entry: LiteratureEntry) {
        if (this.searchKeywords.length === 0) {
            return 100;
        }

        let sim = 0;
        let items = entry.title.split(/\s+/).concat(entry.authors.map(a => `${a.firstName} ${a.lastName}`).join(','));
        // let items = entry.title.split(/\s+/).concat(entry.authors).concat(entry.year).concat([entry.venue]);
        let index: number[][] = [];
        for (let j = 0; j < this.searchKeywords.length; j++) {
            index.push([]);
            for (let i = 0; i < items.length; i++) {
                if (items[i].toLowerCase() === this.searchKeywords[j].toLowerCase()) {
                    index[j].push(i);
                } else if (items[i].toLowerCase().indexOf(this.searchKeywords[j].toLowerCase()) >= 0) {
                    index[j].push(i + 0.5);
                }
            }
        }
        let s;
        index[0].forEach((item) => {
            s = 100;
            let sub = 0;
            for (let i = 1; i < index.length; i++) {
                if (index[i].length === 0) {
                    sub += 1;
                }
                if (index[i].indexOf(item + i) < 0) {
                    // title not consecutive
                    s = 80;
                }
            }
            if (sub > 0) {
                s = 60;
            }
            s = s - sub;
            if (s > sim) {
                sim = s;
            }
        });
        return sim;
    }

    onSearchBoxChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.id === "searchTextBox") {
            this.setState({searchPayload: event.target.value});
        }
    }

    onSortCriterionChange(criterion: SortCriteria) {
        this.setState({sortCriterion: criterion});
    }

    onReverseChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({reverse: event.target.checked});
    }

    onFilterChoicesChange(name: 'tag' | 'year' | 'venue', selected: string[]) {
        switch (name) {
            case "tag":
                this.setState({tags: selected});
                break;
            case "year":
                this.setState({years: selected});
                break;
            case "venue":
                this.setState({venues: selected});
                break;
        }
    }

    render() {
        return (
            <div>
                <h2>Search:</h2>
                <div className="form-group">
                    <label htmlFor="searchTextBox" className="font-weight-bold">Keywords:</label>
                    <input type="text" className="form-control" id="searchTextBox" aria-describedby="searchHelp"
                           placeholder="Search Paper by Keyword in Title and Author" value={this.state.searchPayload}
                           onChange={this.onSearchBoxChange}/>
                    <small id="searchHelp" className="form-text text-muted">
                        Search papers by keywords. Keywords should be separated by blank space.
                    </small>
                </div>
                <hr/>

                <h2>Filter:</h2>
                {
                    this.state.allVenues.length > 0 ?
                        <MultiChoices name="Venue" choices={this.state.allVenues}
                                      onChoicesChanged={(selected => this.onFilterChoicesChange('venue', selected))}/> :
                        null
                }
                {
                    this.state.allYears.length > 0 ?
                        <MultiChoices name="Year" choices={this.state.allYears}
                                      onChoicesChanged={(selected => this.onFilterChoicesChange('year', selected))}/> :
                        null
                }
                {
                    this.state.allTags.length > 0 ?
                        <MultiChoices name="Tags" choices={this.state.allTags}
                                      onChoicesChanged={(selected => this.onFilterChoicesChange('tag', selected))}/> :
                        null
                }
                <hr/>

                <h2>Sort:</h2>
                <span>Sorted By: </span>
                <div className="btn-group" role="group" aria-label="sortBy">
                    <button type="button"
                            className={`btn btn-sm ${this.state.sortCriterion === 'title' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.onSortCriterionChange('title')}>Title
                    </button>
                    <button type="button"
                            className={`btn btn-sm ${this.state.sortCriterion === 'venue' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.onSortCriterionChange('venue')}>Venue
                    </button>
                    <button type="button"
                            className={`btn btn-sm ${this.state.sortCriterion === 'author' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.onSortCriterionChange('author')}>Author
                    </button>
                    <button type="button"
                            className={`btn btn-sm ${this.state.sortCriterion === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.onSortCriterionChange('year')}>Year
                    </button>
                    <button type="button"
                            className={`btn btn-sm ${this.state.sortCriterion === 'similarity' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.onSortCriterionChange('similarity')}>Similarity
                    </button>
                </div>
                <Nbsp/>
                <div className="ml-3 form-check-inline align-middle">
                    <label className="form-check-label">
                        <input type="checkbox" className="form-check-input" checked={this.state.reverse}
                               onChange={this.onReverseChange}/>
                        <Nbsp/>
                        reverse order
                    </label>
                </div>
                <hr/>

                <h2>Literatures:</h2>
                <List entryList={this.visibleEntries} highlights={this.searchKeywords}/>
            </div>

        );
    }
};