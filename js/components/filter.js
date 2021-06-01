Vue.component('filter-component', {
    props: [
        "paper_tags",
        "venue_tags",
        "year_tags"
    ],
    data: function () {
        return {
            "sortedBy": "title",
            "checked_paper_tags": [],
            "searchPayload": "",
            "reverse": false,
        }
    },
    computed: {
        "hasKws": function () {
            return this.searchPayload.length !== 0
        }
    },
    methods: {
        changeSortedBy: function (column) {
            this.$emit("sortedby", column);
            this.sortedBy = column;
            // console.log(column);
        },
        changeVenueTags: function (tagIndex) {
            this.checked_venue_tags = [];
            this.venue_tags.forEach(function (tag, index) {
                if ($("#venue_tag" + index).prop("checked")) {
                    if (this.checked_venue_tags.indexOf(tag) < 0) {
                        this.checked_venue_tags.push(tag);
                    }
                }
            }, this);
            // if (this.checked_venue_tags.length === 0) {
            //     alert("All Tags are removed: showing everything.")
            // }
            this.$emit("venue_tags", this.checked_venue_tags);
            // console.log(this.checkedTags)
        },
        changeYearTags: function (tagIndex) {
            this.checked_year_tags = [];
            this.year_tags.forEach(function (tag, index) {
                if ($("#year_tag" + index).prop("checked")) {
                    if (this.checked_year_tags.indexOf(tag) < 0) {
                        this.checked_year_tags.push(tag);
                    }
                }
            }, this);
            // if (this.checked_year_tags.length === 0) {
            //     alert("All Tags are removed: showing everything.")
            // }
            this.$emit("year_tags", this.checked_year_tags);
            // console.log(this.checkedTags)
        },
        changePaperTags: function (tagIndex) {
            this.checked_paper_tags = [];
            this.paper_tags.forEach(function (tag, index) {
                if ($("#paper_tag" + index).prop("checked")) {
                    if (this.checked_paper_tags.indexOf(tag) < 0) {
                        this.checked_paper_tags.push(tag);
                    }
                }
            }, this);
            // if (this.checked_paper_tags.length === 0) {
            //     alert("All Tags are removed: showing everything.")
            // }
            this.$emit("paper_tags", this.checked_paper_tags);
            // console.log(this.checkedTags)
        },
        escapeRegExp: function (string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        },
    },
    watch: {
        searchPayload: function (val) {
            if (val.length >= 0) {
                let tmp = val.trim().split(' ');
                let kws = [];
                for (let i = 0; i < tmp.length; i++) {
                    if (tmp[i].length > 0) {
                        kws.push(this.escapeRegExp(tmp[i].trim()));
                    }
                }
                this.$emit("keywords", kws);
                // console.log(kws)
            }
        },
        reverse: function (val) {
            this.$emit("reverse", val);
        },
        hasKws: function (val) {
            if (val === false) {
                this.sortedBy = "title";
            }
        }
    },
    template: `
<form class="mt-3" onsubmit="return false">
    <div class="form-group">
        <label for="searchTextBox" class="font-weight-bold">Keywords:</label>
        <input type="text" class="form-control" id="searchTextBox" aria-describedby="searchHelp"
               placeholder="Search Paper by Keyword in Title and Author" v-model="searchPayload">
        <small id="searchHelp" class="form-text text-muted">Search papers by keywords. Keywords should be
            separated by blank space.</small>
    </div>
    <template v-if="venue_tags.length > 0">
        <label class="font-weight-bold">Venue:</label>
        <br/>
        <div class="form-group form-check-inline" v-for="(tag, index) in venue_tags">
            <input type="checkbox" class="form-check-input" v-bind:id="'venue_tag' + index" v-on:click="changeVenueTags(index)">
            <label class="form-check-label" v-bind:for="'venue_tag' + index">{{ tag }}</label>
        </div>
        <br/>
    </template>
    <template v-if="year_tags.length > 0">
        <label class="font-weight-bold">Year:</label>
        <br/>
        <div class="form-group form-check-inline" v-for="(tag, index) in year_tags">
            <input type="checkbox" class="form-check-input" v-bind:id="'year_tag' + index" v-on:click="changeYearTags(index)">
            <label class="form-check-label" v-bind:for="'year_tag' + index">{{ tag }}</label>
        </div>
        <br/>
    </template>
    <template v-if="paper_tags.length > 0">
        <label class="font-weight-bold">Tags:</label>
        <br/>
        <div class="form-group form-check-inline" v-for="(tag, index) in paper_tags">
            <input type="checkbox" class="form-check-input" v-bind:id="'paper_tag' + index" v-on:click="changePaperTags(index)">
            <label class="form-check-label" v-bind:for="'paper_tag' + index">{{ tag }}</label>
        </div>
    </template>
    
    <br/>
    <label class="font-weight-bold">Sort:</label>
    <br/>
    <div class="d-inline mr-3">Sorted by: </div>
    <div class="btn-group" role="group" aria-label="sortBy">
        <button type="button" v-bind:class="['btn', 'btn-sm', sortedBy === 'title'? 'btn-primary' : 'btn-outline-primary']" v-on:click="changeSortedBy('title')">Title</button>
        <button type="button" v-bind:class="['btn', 'btn-sm', sortedBy === 'venue'? 'btn-primary' : 'btn-outline-primary']" v-on:click="changeSortedBy('venue')">Venue</button>
        <button type="button" v-bind:class="['btn', 'btn-sm', sortedBy === 'author'? 'btn-primary' : 'btn-outline-primary']" v-on:click="changeSortedBy('author')">Author</button>
        <button type="button" v-bind:class="['btn', 'btn-sm', sortedBy === 'year'? 'btn-primary' : 'btn-outline-primary']" v-on:click="changeSortedBy('year')">Year</button>
        <button type="button" v-bind:class="['btn', 'btn-sm', sortedBy === 'similarity'? 'btn-primary' : 'btn-outline-primary']" v-on:click="changeSortedBy('similarity')" v-if="hasKws">Similarity</button>
    </div>
    <div class="ml-3 form-check-inline align-middle">
        <input type="checkbox" class="form-check-input" v-model="reverse" id="reverse">
        <label class="form-check-label" for="reverse">reverse order</label>
    </div>
</form>
    `
});