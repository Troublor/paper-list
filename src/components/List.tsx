import React from "react";
import {LiteratureEntry} from "../types";
import {Table} from "react-bootstrap";
import Item from "./Item";

interface ListProp {
    entryList: LiteratureEntry[] // the ordered list of literature entries to display
    highlights: string[];  // the list of strings which should be highlighted
}

export default class List extends React.Component<ListProp, any> {
    render() {
        const items = this.props.entryList
            .map(entry => <Item entry={entry} highlights={this.props.highlights} key={entry.id}/>);

        return (
            <Table className="text-center">
                <tbody>
                {
                    this.props.entryList.length > 0 ?
                        items :
                        <tr>
                            <td className="text-center">
                                Data not found
                            </td>
                        </tr>
                }
                </tbody>
            </Table>
        )
    }
}