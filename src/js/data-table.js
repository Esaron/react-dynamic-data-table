/**
 *  Created by esaron on 5/21/16.
 *
 *  data-table.js
 ******************************************************************************************************************************
 *  PaginationControls: Non-stateful component to reflect the current table pagination info and provide
 *                          pagination controls.
 *
 *  props
 *      pageNumber:     The current page number. (Default: 1)
 *
 *      rowsPerPage:    The number of rows per page. (Default: 10)
 *
 *      totalPages:     The total number of pages. If undefined, jumping to the last page will be disabled.
 *
 *      onGoFirst:      A function to be performed when the "<<" button is clicked. (Default: No-op)
 *
 *      onGoLast:       A function to be performed when the ">>" button is clicked, if enabled. (Default: No-op)
 *
 *      onGoNext:       A function to be performed when the ">" button is clicked. (Default: No-op)
 *
 *      onGoPrevious:   A function to be performed when the "<" button is clicked. (Default: No-op)
 *
 *      onSubmit:       A function to be performed when the page input is submitted. (Default: No-op)
 *
 *      onRowsPerPageChange:
 *                      A function to be performed when the rowsPerPage dropdown changes. (Default: No-op)
 *
 ******************************************************************************************************************************
 *  DataTable:          Stateful table that is capable of displaying data and responding to user input to
 *                          dynamically update and submit data.
 *
 *  Internal Fields (Not for external manipulation)
 *      _data:              Used as a pre-mount data store.
 *
 *      _columns:           Used for tracking dynamically constructed Columns (column config with nested row data).
 *
 *      _state:             Used to cache state until the setState method, which is asynchronous, can be called
 *                              and expected to reliably propagate state.
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
 *      columnFormats:          (Required) An array of column format objects:
 *                              [
 *                                  {
 *                                      id: columnId,
 *                                      editable: columnDataIsEditable, (Default: false)
 *                                      filterable: canFilterOnColumn, (Default: false)
 *                                      sortable: canSortOnColumn, (Default: false)
 *                                      headerClass: cssClass,
 *                                      cellClass: cssClass,
 *                                      (any keys defined by <Column> from fixed-data-table)
 *                                      ...
 *                                  }
 *                              ]
 *
 *      initialRowsPerPage: The number of rows per page. (Default: 10)
 *
 *      initialPage:        The page to start on. Only used if !props.useScrolling. (Default: 1)
 *
 *      useScrolling:       If truthy, use scrolling instead of pagination.
 *
 *      rowsPerPageOptions: An array of options users can select for the number of rows on the page. (Default: [10, 25, 50])
 *
 *  state
 *      width:              Used for dynamic width based on total column width (Can be overriden by providing props.width).
 *
 *      height:             Used for dynamic height based on row height and number (Can be overridden by providing props.height).
 *
 *      data:               The data to display, formatted as an array of row objects:
 *                              [{
 *                                      columnId1: value (see fdt api for Cell types),
 *                                      columnId2: value,
 *                                      ...
 *                                  },
 *                                  ...
 *                              }]
 *
 *      rowsPerPage:        The number of rows per page.
 *                              TODO input to change dynamically
 *
 *      pageNumber:         The current page number. Only used if !props.useScrolling. (Default: 1)
 *                              TODO input to change dynamically
 *
 *      totalRecords:       The total number of records
 *
 *      totalPages:         The total number of pages
 *
 *      sortField:          If set, sort by this field.
 *                              TODO allow for an array for sorting on additional columns when fields match
 *
 *      sortDir:            'asc' or 'desc'. (Default 'asc')
 *                              TODO onClick handling for headers, class for sort icon
 *
 *      filters:            An object of columnId to objects containing current filter settings:
 *                              {
 *                                  columnId: {
 *                                      filter: filterValue,
 *                                      filterType: 'contains' or 'exact' (If undefined: 'contains')
 *                                  },
 *                                  ...
 *                              }
 *                              TODO
 */

const $ = require('jquery');
const React = require('react');
const PropTypes = React.PropTypes;
const {Table, Column, Cell} = require('fixed-data-table');
const Button = require('./button.js')

var PaginationControls = React.createClass({
    getInitialState: function() {
        return {
            options: this.getInitialOptions()
        }
    },

    getDefaultProps: function() {
        return {
            pageNumber: 1,
            rowsPerPage: 10,
            rowsPerPageOptions: [10, 25, 50],
            onGoFirst: function(){},
            onGoLast: function(){},
            onGoNext: function(){},
            onGoPrevious: function(){},
            onSubmit: function(pageNumber){},
            onRowsPerPageChange: function(rowsPerPage){}
        };
    },

    getInitialOptions: function() {
        var options = [];
        this.props.rowsPerPageOptions.forEach(function (rowsPerPage) {
            options.push(<option key={rowsPerPage} value={rowsPerPage}>{rowsPerPage}</option>);
        });
        return options;
    },

    render: function() {
        var t = this;
        return (
            <div className="paginationWrapper">
                <div className="rowsPerPage">
                    <select
                        value={this.props.rowsPerPage}
                        onChange={function(event) {
                            t.props.onRowsPerPageChange(Number(event.target.value));
                    }}>
                        {t.state.options}
                    </select>
                </div>
                <div className="pageControls">
                    <Button text="<<" onClick={function(event) {
                        t.props.onGoFirst();
                    }} />
                    <Button text="<" onClick={function(event) {
                        t.props.onGoPrevious(); 
                    }} />
                    <form
                        onSubmit={function(event) {
                            event.preventDefault();
                            this.props.onSubmit(t.state.pageNumber);
                        }}
                        style={{display: "inline-block", margin: 0}}
                    >
                        <input
                            type="text"
                            value={t.props.pageNumber}
                            onChange={function(event) {
                                var value = event.target.value;
                                this.setState({value: value});
                                t.setState({value: value});
                            }}
                            style={{width: "30px", textAlign: "center"}}
                        />
                    </form>
                    <span> / {!!t.props.totalPages ? t.props.totalPages : "?"}</span>
                    <Button text=">" onClick={function(event) {
                        t.props.onGoNext();
                    }} />
                    <Button text=">>" onClick={function(event) {
                        t.props.onGoLast();
                    }} />
                </div>
            </div>
        );
    }
});

var DataTable = React.createClass({
    _state: {},

    _data: [],

    _columns: [],

    getInitialState: function() {
        var totalRecords;
        var totalPages;
        if (this.props.initialData.length > 0) {
            totalRecords = this.props.initialData.length;
            totalPages = Math.ceil(totalRecords/this.props.initialRowsPerPage);
        }
        this._state = {
            data: this.props.initialData,
            rowsPerPage: this.props.initialRowsPerPage,
            totalRecords: totalRecords,
            totalPages: totalPages,
            pageNumber: this.props.initialPage,
            sortDir: 'asc',
            filters: {}
        };
        if (!!this.props.restUrl) {
            if (!!this.props.initialData) {
                // Log a warning. Initial data is ignored if we have a restUrl.
                console.error("Both restUrl and initialData have been provided to data-table. The value for " +
                    "initialData is being ignored.");
                this.props.initialData = [];
            }
        }
        return this._state;
    },

    getDefaultProps: function() {
        return {
            initialData: [],
            initialPage: 1,
            initialRowsPerPage: 10,
            rowsPerPageOptions: [10, 25, 50],
            serverSideOperations: false
        };
    },

    propTypes: {
        initialData: PropTypes.arrayOf(PropTypes.object),
        restUrl: PropTypes.string,
        columnFormats: PropTypes.arrayOf(PropTypes.object).isRequired,
        initialRowsPerPage: PropTypes.number,
        initialPage: PropTypes.number
    },

    getInitialDimensions: function() {
        return {
            width: this.props.width || 0,
            height: this.props.height || 0
        };
    },

    resetDimensions: function() {
        var dimensions = this.getInitialDimensions();
        this._state.width = dimensions.width;
        this._state.height = dimensions.height;
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
                }, {
                    name: "A",
                    title: Math.random(),
                    email: Math.random()
                }, {
                    name: "B",
                    title: Math.random(),
                    email: Math.random()
                }, {
                    name: "C",
                    title: Math.random(),
                    email: Math.random()
                }, {
                    name: "D",
                    title: Math.random(),
                    email: Math.random()
                }, {
                    name: "E",
                    title: Math.random(),
                    email: Math.random()
                }, {
                    name: "f",
                    title: Math.random(),
                    email: Math.random()
                }, {
                    name: "g",
                    title: Math.random(),
                    email: Math.random()
                }, {
                    name: "t",
                    title: Math.random(),
                    email: Math.random()
            }];
            t._state.totalRecords = 11;
            if (!t.props.useScrolling) {
                t._state.totalPages = Math.ceil(t._state.totalRecords/t._state.rowsPerPage);
            }
        }
        else {
            var params = {};
            if (t.props.serverSideOperations && !t.props.useScrolling) {
                params.pageNumber = t._state.pageNumber;
                params.rowsPerPage = t._state.rowsPerPage;
            }
            $.get(t.props.restUrl, params, function (data) {
                if (typeof data === "array") {
                    t._data = data;
                }
                else {
                    t._data = data.records;
                    t._state.totalRecords = data.totalRecords;
                    if (!t.props.useScrolling) {
                        t._state.totalPages = Math.ceil(t._state.totalRecords/t._state.rowsPerPage);
                    }
                }
            }).fail(function (err) {
                // TODO user feedback within table header/footer
                console.error("Failed to load data from '" + t.props.restUrl + "': " + err);
            });
        }
    },

    getPageData: function() {
        var data = this._data;
        var startIdx;
        var endIdx;
        // If we are paginating client-side, slice the data appropriately
        if (!this.props.serverSideOperations && !this.props.useScrolling) {
            startIdx = (this._state.pageNumber - 1) * this._state.rowsPerPage;
            endIdx = startIdx + this._state.rowsPerPage;
            data = this._data.slice(startIdx, endIdx);
        }
        return data;
    },

    goFirst: function() {
        if (this._state.pageNumber > 1) {
            this._state.pageNumber = 1;
            this.refresh();
        }
    },

    goLast: function() {
        this.goToPage(this._state.totalPages);
    },

    goNext: function() {
        this.goToPage(this._state.pageNumber + 1);
    },

    goPrevious: function() {
        if (this._state.pageNumber > 1) {
            this._state.pageNumber--;
            this.refresh();
        }
    },

    goToPage: function(pageNumber) {
        var previousPage;
        var previousData;
        if (pageNumber > 0 && (!this._state.totalPages ||
                (this._state.pageNumber < this._state.totalPages && pageNumber <= this._state.totalPages))) {
            previousPage = this._state.pageNumber;
            previousData = this._state.data;
            this._state.pageNumber = pageNumber;
            this.refresh();
            // If we've passed the record boundaries, jump back to the previous page
            if (this._state.data.length === 0) {
                this._state.pageNumber = previousPage;
                this._state.data = previousData;
                this.refresh(true);
            }
        }
    },

    updateRowsPerPage: function(rowsPerPage) {
        if (rowsPerPage !== this._state.rowsPerPage && rowsPerPage > 0 &&
                rowsPerPage <= this.props.rowsPerPageOptions[this.props.rowsPerPageOptions.length - 1]) {
            this._state.rowsPerPage = rowsPerPage;
            this.refresh();
        }
    },

    calculateHeight: function() {
        // The "+2" is for styling from fdt for scroll shadows
        var height = this.props.headerHeight + this.props.rowHeight * this.state.rowsPerPage + 2;
        if (!!this.props.footerHeight) {
            height += this.props.footerHeight;
        }
        return height
    },

    constructColumns: function() {
        var t = this;
        // TODO support custom fields in the description: sortable, filterable
        t._columns = [];
        var numFormats = t.props.columnFormats.length;
        var content;
        t.props.columnFormats.forEach(function(columnFormat, idx) {
            var columnId = columnFormat.id;
            if (!t.props.width) {
                t._state.width += columnFormat.width;
            }
            t._columns.push(
                <Column
                    key={columnId}
                    cell={function(cellData) {
                        content = t._state.data[cellData.rowIndex][columnId];
                        if (!!columnFormat.editable) {
                            content = <input
                                        type="text"
                                        id={columnId + cellData.rowIndex}
                                        value={content}
                                        onChange={function(event) {
                                            var value = event.target.value;
                                            this.setState({value: value});
                                            t._state.data[cellData.rowIndex][columnId] = value;
                                        }}
                            />;
                        }
                        return (
                            <Cell className={columnFormat.cellClass}>
                                {content}
                            </Cell>
                        );
                    }}
                    {...columnFormat} />
            );
        });
    },

    refresh: function(skipReload) {
        this.resetDimensions();
        if (!skipReload && !!this.props.restUrl) {
            this.loadData();
        }
        this._state.data = this.getPageData();
        this.constructColumns();
        this.setState(this._state);
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
        var t = this;
        var refreshButton;
        var pageNav;
        var dimensions = {};
        if (!!t.props.restUrl) {
            refreshButton = <Button text="Refresh" onClick={function(event) {
                t.refresh();
            }} />;
        }
        if (!t.props.useScrolling) {
            pageNav = <PaginationControls
                            pageNumber={t.state.pageNumber}
                            rowsPerPage={t.state.rowsPerPage}
                            rowsPerPageOptions={t.props.rowsPerPageOptions}
                            totalPages={t.state.totalPages}
                            onGoFirst={t.goFirst}
                            onGoLast={t.goLast}
                            onGoNext={t.goNext}
                            onGoPrevious={t.goPrevious}
                            onSubmit={t.goToPage}
                            onRowsPerPageChange={t.updateRowsPerPage}
            />;
        }
        if (!t.props.width) {
            dimensions.width = t.state.width;
        }
        if (!t.props.height) {
            dimensions.height = t.calculateHeight();
        }
        return (
            <div className={t.props.className} style={dimensions}>
                <Table rowsCount={t.state.data.length} {...dimensions} {...t.props}>
                    {t._columns}
                </Table>
                <div className="dataTableFooter">
                    {pageNav}
                    <div className="refreshWrapper">
                        {refreshButton}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = DataTable;
