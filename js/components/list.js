Vue.component('list', {
    props: [
        'keywords', //array
        'checked_paper_tags', //array
        'checked_year_tags', //array
        'checked_venue_tags', //array
        'entryList', // all entries
        'sortedby',
        'reverse',
    ],
    created: function () {
        this.loadList();
    },
    data: function () {
        return {
            visibleList: [],
        };
    },
    computed: {
        empty: function () {
            return this.visibleList.length === 0;
        },
        totalTags: function () {
            if (this.checked_paper_tags === undefined) {
                return [];
            }
            return this.checked_paper_tags;
        },
        kws: function () {
            if (this.keywords === undefined) {
                return [];
            }
            return this.keywords;
        }
    },
    methods: {
        calculateSimilarity: function (entry, kws) {
            let sim = 0;
            let items = entry.title.split(/\s+/).concat(entry.authors);
            // let items = entry.title.split(/\s+/).concat(entry.authors).concat(entry.year).concat([entry.venue]);
            let index = [];
            for (let j = 0; j < kws.length; j++) {
                index.push([]);
                for (let i = 0; i < items.length; i++) {
                    if (items[i].toLowerCase() === kws[j].toLowerCase()) {
                        index[j].push(i);
                    } else if (items[i].toLowerCase().indexOf(kws[j].toLowerCase()) >= 0) {
                        index[j].push(i + 0.5);
                    }
                }
            }
            let s;
            index[0].forEach(function (item) {
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
        },
        loadList: function () {
            let tmp = Array.from(this.entryList);
            let tmp2 = Array()
            if (this.checked_venue_tags.length > 0){
                tmp.forEach(function (item) {
                    if (this.checked_venue_tags.includes(item.venue)) {
                        tmp2.push(item);
                    }
                }, this);
                tmp = Array.from(tmp2)
                tmp2 = Array()
            }

            if (this.checked_year_tags.length > 0){
                tmp.forEach(function (item) {
                    if (this.checked_year_tags.includes(item.year)) {
                        tmp2.push(item);
                    }
                }, this);
                tmp = Array.from(tmp2)
                tmp2 = Array()
            }

            if (this.totalTags.length > 0) {
                this.visibleList = [];
                tmp.forEach(function (item) {
                    for (let i = 0; i < item.tags.length; i++) {
                        if (this.totalTags.includes(item.tags[i])) {
                            tmp2.push(item);
                            break;
                        }
                    }
                }, this);

                tmp = Array.from(tmp2)
                tmp2 = Array()
            }

            if (this.kws.length > 0) {
                for (let i = 0; i < tmp.length; i++) {
                    tmp[i].similarity = this.calculateSimilarity(tmp[i], this.kws);
                    if (tmp[i].similarity > 0) {
                        tmp2.push(tmp[i]);
                    }
                }
                tmp = Array.from(tmp2)
                tmp2 = Array()
            }

            this.visibleList = Array.from(tmp);


            let vue = this;
            let sortedBy = this.sortedby;
            this.visibleList.sort(((a, b) => {
                if (sortedBy === 'title') {
                    if (vue.reverse) {
                        return a.title > b.title ? -1 : 1;
                    } else {
                        return a.title < b.title ? -1 : 1;
                    }
                } else if (sortedBy === 'venue') {
                    if (vue.reverse) {
                        return a.venue > b.venue ? -1 : 1;
                    } else {
                        return a.venue < b.venue ? -1 : 1;
                    }
                } else if (sortedBy === 'author') {
                    if (vue.reverse) {
                        return a.authors.join(' ') > b.authors.join(' ') ? -1 : 1;
                    } else {
                        return a.authors.join(' ') < b.authors.join(' ') ? -1 : 1;
                    }
                } else if (sortedBy === 'year') {
                    // year is sort from latest to oldest by default
                    if (vue.reverse) {
                        return parseInt(a.year) < parseInt(b.year) ? -1 : 1;
                    } else {
                        return parseInt(a.year) > parseInt(b.year) ? -1 : 1;
                    }
                } else if (sortedBy === 'similarity') {
                    if (vue.reverse) {
                        return a.similarity < b.similarity ? -1 : 1;
                    } else {
                        return a.similarity > b.similarity ? -1 : 1;
                    }
                }
            }));
        },
        serializeTags: function (tags) {
            return tags.join("|");
        }
    },
    watch: {
        keywords: function (val) {
            // WHERE筛选条件变化事件
            this.loadList();
        },
        checked_paper_tags: function (val) {
            // ORDER BY条件变化事件
            this.loadList();
        },
        checked_venue_tags: function (val) {
            // ORDER BY条件变化事件
            this.loadList();
        },
        checked_year_tags: function (val) {
            // ORDER BY条件变化事件
            this.loadList();
        },
        entryList: function (val) {
            this.loadList();
        },
        sortedby: function (val) {
            this.loadList();
        },
        reverse: function (val) {
            this.loadList();
        }
    },
    template: `
    <div>
        <table class="table text-center">
            <tbody>
            <template v-if="!empty">
                <tr v-for="(entry, index) in visibleList">
                    <td>
                        <entry v-bind:keywords="kws" v-bind:title="entry.title" v-bind:link="entry.link" v-bind:authors="entry.authors.join(', ')" v-bind:venue="entry.venue" v-bind:year="entry.year" v-bind:serializedTags="serializeTags(entry.tags)"></entry>
                    </td>
                </tr>
            </template>
            <template v-else>
                <tr>
                    <td class="text-center">
                        Data not found
                    </td>
                </tr>
            </template>
            </tbody>
            
            
        </table>
    </div>
    `,
});
