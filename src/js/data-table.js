/**
 *  Created by esaron on 5/21/16.
 *
 *  data-table.js - This is a stateful table that is capable of displaying data and responding to user input to
 *                  dynamically update and submit data.
 *
 *  Internal Fields (Not for external manipulation)
 *      _data:              Used as a pre-mount data store.
 *      _columns:           Used for tracking dynamically constructed Columns (column config with nested row data).
 *      _showRefreshButton: True if loading data from props.restUrl. Signals that a button is to be rendered to allow
 *                              the user to manually trigger a refresh.
 *
 *  props
 *      Props will be passed to wrapped instance of fixed-data-table
 *      See https://facebook.github.io/fixed-data-table/api-table.html for details on supported fdt props
 *
 *      initialData:        If set, the table will be loaded with the provided data. See state.data for format.
 *
 *      restUrl:            If set, data is retrieved by making a GET request to the provided url. Note that this will
 *                              overwrite any data provided via props.initialData.
 *
 *      columnFormats:          (Required) An object of column ids to column format objects:
 *                              {
 *                                  columnId: {
 *                                      label: columnLabel, (Required)
 *                                      editable: columnDataIsEditable, (Default: false)
 *                                      filterable: canFilterOnColumn, (Default: false)
 *                                      sortable: canSortOnColumn, (Default: false)
 *                                      headerClass: cssClass,
 *                                      cellClass: cssClass
 *                                  },
 *                                  ...
 *                              }
 *
 *      initialRowsPerPage: The number of rows to display per page if using pagination (Default: -1)
 *
 *  state
 *      data:               The data to display, formatted as an array of row objects:
 *                              [{
 *                                      columnId1: value (see fdt api for Cell types),
 *                                      columnId2: value,
 *                                      ...
 *                                  },
 *                                  ...
 *                              }]
 *
 *      rowsPerPage:        The number of rows per page. If set to -1, infinite scrolling is used instead of pagination.
 *                              (Default -1)
 *
 *      pageNumber:
 *
 *      sortField:          If set, sort by this field.
 *
 *      sortDir:            'asc' or 'desc'. (Default 'asc')
 *
 *      filters:            An object of columnId to objects containing current filter settings:
 *                              {
 *                                  columnId: {
 *                                      filter: filterValue,
 *                                      filterType: 'contains' or 'exact' (If undefined: 'contains')
 *                                  },
 *                                  ...
 *                              }
 */

const $ = require('jquery');
const React = require('react');
const PropTypes = React.PropTypes;
const {Table, Column, Cell} = require('fixed-data-table');
const Button = require('./button.js')

var DataTable = React.createClass({
    _columns: [],

    _showRefreshButton: false,

    getInitialState: function() {
        var state = {
            data: this.props.initialData,
            rowsPerPage: this.props.initialRowsPerPage,
            pageNumber: 1,
            sortDir: 'asc',
            filters: {}
        };
        if (!!this.props.restUrl) {
            if (!!this.props.initialData) {
                // Log a warning. Initial data is ignored if we have a restUrl.
                console.error("Both restUrl and initialData have been provided to data-table. The value for initialData" +
                    " is being ignored.");
                this.props.initialData = [];
            }
            this._showRefreshButton = true;
            state.data = this.loadData();
        }
        return state;
    },

    getDefaultProps: function() {
        return {
            initialData: [],
            restUrl: null,
            initialRowsPerPage: -1
        };
    },

    propTypes: {
        initialData: PropTypes.arrayOf(PropTypes.object),
        restUrl: PropTypes.string,
        columnFormats: PropTypes.objectOf(PropTypes.object).isRequired,
        initialRowsPerPage: PropTypes.number
    },

    loadData: function() {
        var t = this;
        if (t.props.restUrl === "debug") {
            t._data = [{
                    name: "John Doe",
                    title: "CEO",
                    email: Math.random()
                }, {
                    name: "Dean Winchester",
                    title: "Hunter",
                    email: Math.random()
                }, {
                    name: "Buffy Summers",
                    title: "Slayer",
                    email: Math.random()
            }];
        }
        else {
            $.get(t.props.restUrl, function (data) {
                t._data = data;
            }).fail(function (err) {
                // TODO
                // user feedback within table header/footer
                console.error("Failed to load data from '" + t.props.restUrl + "': " + err);
            });
        }
    },

    constructColumns: function() {
        var t = this;
        // TODO
        // support custom fields in the description
        t._columns = [];
        var content;
        Object.keys(t.props.columnFormats).forEach(function(columnId) {
            t._columns.push(
                <Column
                    key={columnId}
                    header={<Cell>{t.props.columnFormats[columnId].label}</Cell>}
                    cell={function(cellData) {
                        content = t.state.data[cellData.rowIndex][columnId];
                        if (!!t.props.columnFormats[columnId].editable) {
                            content = <input
                                        type="text"
                                        id={columnId + cellData.rowIndex}
                                        value={content}
                                        onChange={function(event) {
                                            this.setState({value: event.target.value});
                                        }
                            } />;
                        }
                        return (
                            <Cell className={t.props.columnFormats[columnId].cellClass}>
                                {content}
                            </Cell>
                        );
                    }}
                    // TODO
                    // Dynamic width
                    width={300} />
            );
        });
    },

    refresh: function() {
        this.loadData();
        this.setState({
            data: this._data
        });
        this.constructColumns();
    },

    componentWillMount: function() {
        this.refresh();
    },

    componentDidMount: function() {

    },

    componentWillReceiveProps: function(nextProps) {

    },

    shouldComponentUpdate: function() {
        return true;
    },

    componentWillUpdate: function() {

    },

    componentDidUpdate: function() {

    },

    componentWillUnmount: function() {

    },

    render: function() {
        var refreshButton;
        if (this._showRefreshButton) {
            refreshButton = <Button text={'Refresh'} onClick={this.refresh} />;
        }
        return (
            <div className="dataTable">
                <Table {...this.props}>
                    {this._columns}
                </Table>
                {refreshButton}
            </div>
        );
    }
});

module.exports = DataTable;