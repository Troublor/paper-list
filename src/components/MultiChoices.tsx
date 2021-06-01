import React, {ChangeEvent} from "react";
import Accordion from "react-bootstrap/Accordion";
import _ from "lodash";

interface MultiChoicesProp {
    name: string,
    choices: string[],
    onChoicesChanged: (selected: string[]) => void,
}

interface MultiChoicesState {
    selected: string[],
}

export default class MultiChoices extends React.Component<MultiChoicesProp, MultiChoicesState> {
    constructor(prop: MultiChoicesProp) {
        super(prop);
        this.state = {
            selected: prop.choices,
        }

        this.onChange = this.onChange.bind(this);
        this.onClearAllClicked = this.onClearAllClicked.bind(this);
        this.onSelectAllClicked = this.onSelectAllClicked.bind(this);
    }

    get choices() {
        return _.uniq(this.props.choices);
    }

    private onClearAllClicked() {
        this.setState({selected: []}, () => this.props.onChoicesChanged(this.state.selected));
    }

    private onSelectAllClicked() {
        this.setState({selected: this.choices}, () => this.props.onChoicesChanged(this.state.selected));
    }

    private onChange(event: ChangeEvent<HTMLInputElement>) {
        const choice = event.target.name;
        if (!this.choices.includes(choice)) {
            return;
        }
        if (event.target.checked) {
            this.setState({
                selected: [...this.state.selected, choice],
            }, () => this.props.onChoicesChanged(this.state.selected));
        } else {
            this.setState({
                selected: this.state.selected.filter(c => c !== choice),
            }, () => this.props.onChoicesChanged(this.state.selected));
        }
    }

    render() {
        const choices = this.choices.map((choice) => <label className="form-check-label">
            <input type="checkbox" className="form-check-input me-1" name={choice} onChange={this.onChange}
                   checked={this.state.selected.includes(choice)}/>
            <span className="me-3">{choice}</span>
        </label>);

        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    {this.props.name}
                </Accordion.Header>
                <Accordion.Body>
                    {choices}
                    <hr/>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={this.onSelectAllClicked}>Select
                        All
                    </button>
                    <button className="btn btn-sm btn-outline-primary" onClick={this.onClearAllClicked}>Clear All
                    </button>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
};