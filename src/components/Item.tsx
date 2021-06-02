import React from "react";
import {LiteratureEntry} from "../types";

interface ItemProp {
    entry: LiteratureEntry // the literature entry
    highlights: string[], // the list of strings which should be highlighted
}

export default class Item extends React.Component<ItemProp, any> {

    get title() {
        return this.props.entry.title;
    }

    get authors() {
        return this.props.entry.authors
            .map(author => `${author.firstName} ${author.lastName}`)
            .join(', ');
    }

    get venue() {
        return this.props.entry.venue;
    }

    get year() {
        return this.props.entry.date ? this.props.entry.date.getFullYear() : "No Year";
    }

    get tags() {
        return this.props.entry.tags;
    }

    private highlight(payload: string): JSX.Element | null {
        if (this.props.highlights.length === 0) {
            return <span>{payload}</span>
        }
        let reg = new RegExp("^(.*?)(" + this.props.highlights.join("|") + ")(.*)$", "i");
        let matches = reg[Symbol.match](payload);
        if (!matches) {
            return <span>{payload}</span>;
        }
        return <span>
            {matches[1]}
            <span style={{backgroundColor: '#8ca0f754'}}>{matches[2]}</span>
            {this.highlight(matches[3])?.props.children}
        </span>
    }

    render() {
        let title;
        if (this.props.entry.url && this.props.entry.url.length > 0) {
            title = <a href={this.props.entry.url}>{this.highlight(this.title)}</a>;
        } else {
            title = this.highlight(this.title);
        }

        let tags = this.tags.map((tag) =>
            <span className="badge bg-primary me-1" key={`${this.props.entry.id}-tag-${tag}`}>{tag}</span>);

        return (
            <div className="text-start">
                {title}
                <ul>
                    <li>{this.highlight(this.authors)}</li>
                    <li><span>{this.venue}</span>; <span>{this.year}</span></li>
                    <p>{tags}</p>
                </ul>
            </div>
        );
    }
};

//<div class="text-left">
//     <div>
//         <a v-if="this.link.length > 0" v-bind:href="link" v-html="hTitle"></a>
//         <span v-else v-html="hTitle"></span>
//     </div>
//     <ul>
//         <li v-html="hAuthors"></li>
//         <li><span v-html="hVenue"></span>&nbsp;<span v-html="hYear"></span></li>
//         <p>
//             <span class="badge badge-primary" v-for="tag in tags">{{ tag }}</span>
//         </p>
//         <p></p>
//     </ul>
// </div>