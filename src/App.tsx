import React from 'react';
import './App.css';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import {LiteratureAuthor, Literatures} from 'react-paper-list';
import {LiteratureEntry} from 'react-paper-list';

interface AppState {
  paperList: LiteratureEntry[]
  loading: boolean
  title: string
  description: string
}

// eslint-disable-next-line require-jsdoc
export default class App extends React.Component<unknown, AppState> {
  // eslint-disable-next-line require-jsdoc
  constructor(prop: unknown) {
    super(prop);

    this.state = {
      // @ts-ignore
      paperList: this.normalizeData(DATA as unknown as LiteratureEntry[]),
      loading: false,
      // @ts-ignore
      title: TITLE as string,
      // @ts-ignore
      description: DESCRIPTION as string,
    };
  }

  // eslint-disable-next-line require-jsdoc
  private normalizeData(data: Record<string, unknown>[]): LiteratureEntry[] {
    return data.map((d, index) => {
      d['id'] = index.toString();
      d['date'] = d['date'] ? new Date(d['date'] as string) : null;
      d['authors'] = (d['authors'] as (string | LiteratureAuthor)[])
          .map((a) => {
            if (typeof a === 'string') {
              return {
                firstName: '',
                lastName: a,
              } as LiteratureAuthor;
            } else {
              return a;
            }
          });
      return d;
    }) as unknown[] as LiteratureEntry[];
  }

  // eslint-disable-next-line require-jsdoc
  componentDidMount() {
    document.title = this.state.title;
  }

  // eslint-disable-next-line require-jsdoc
  render() {
    if (this.state.loading) {
      return <div>Loading data...</div>;
    } else {
      return <Container>
        <Literatures title={this.state.title}
          description={this.state.description}
          entries={this.state.paperList}
          enableFilter enableSearch enableSort enableScrollTopButton
        />
      </Container>;
    }
  }
};
