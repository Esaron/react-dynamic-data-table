/**
 *  Created by esaron on 5/21/16.
 *
 *  dynamic-data-table.js
 ******************************************************************************************************************************
 *  PaginationControls: Stateful component to reflect the current table pagination info and provide
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
 *      errorMsg:       A customizable error message to be displayed when data can't be loaded.
 *
 ******************************************************************************************************************************
 *  DynamicDataTable:   Stateful table that is capable of displaying data and responding to user input to
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
 *      initialColumnFormats:
 *                          (Required) An array of column format objects:
 *                              [
 *                                  {
 *                                      id: columnId,
 *                                      editable: columnDataIsEditable, (Default: false)
 *                                      filterType: 'text', 'select', 'combobox', 'date', 'daterange',
 *                                      filterOptions: [{label: 'Option Label', value: 'optionValue'}, ...], (if 'select' is the filterType)
 *                                      filterRestUrl: urlForOptions, (if 'combobox' is the filterType)
 *                                      queryFcn: function(value), (function that produces query param objects or strings; if 'combobox' is the filterType)
 *                                      initialFilterValue: filterOnThis,
 *                                      sortable: canSortOnColumn, (Default: false)
 *                                      headerClass: cssClass,
 *                                      cellClass: cssClass,
 *                                      formatter: function(data, table) (Returns the cell content as text or React element)
 *                                          (Default: "return data[id];")
 *                                      sortField: The back-end field by which to sort, (Default: columnId)
 *                                      sortFcn: Optional sort function in the format of Array.sort with the addition of
 *                                          an argument for the sort direction 'asc' (default) or 'desc',
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
 *      rowsPerPageOptions: A sorted array of options users can select for the number of rows on the page. (Default: [10, 25, 50])
 *
 *      sortFcn:            A user function by which to sort data. (Default: case insensitive sort by sortField)
 *
 *      initialSortField:   The field on which to initially sort the data.
 *
 *      initialSortDir:     The initial sort direction.
 *
 *      submitUrl:          The URL to execute a PUT request against when submitting data.
 *
 *      formatSubmitData:   A function that takes table data as an argument and formats it
 *                              for submission to props.submitUrl.
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
 *      columnFormats:      The current column format objects.
 *
 *      rowsPerPage:        The number of rows per page.
 *
 *      pageNumber:         The current page number. Only used if !props.useScrolling. (Default: 1)
 *
 *      totalRecords:       The total number of records.
 *
 *      totalPages:         The total number of pages.
 *
 *      sortField:          If set, sort by this field.
 *                              TODO allow for an array for sorting on additional columns when fields match
 *
 *      sortDir:            undefined (unsorted), 'asc', or 'desc'. (Default undefined)
 *
 *      filters:            An object of columnId to current filter value:
 *                              {
 *                                  columnId: filterValue
 *                                  ...
 *                              }
 *                              TODO
 *
 *      onSubmit:           A function to be performed when data is submitted.
 *                              Formats data using props.formatSubmitData and sends it to props.submitUrl
 */

const $ = require('jquery');
const React = require('react');
const PropTypes = React.PropTypes;
const FDT = require('fixed-data-table');
const Table = FDT.Table;
const Column = FDT.Column;
const Cell = FDT.Cell;
const FormControl = require('react-bootstrap/lib/FormControl');
const DatePicker = require('react-datepicker');
const Link = require('esaron-react-link');
const RestCombobox = require('esaron-react-rest-combobox');

var PaginationControls = React.createClass({
    getInitialState: function() {
        return {
            pageNumber: this.props.initialPageNumber,
            rowsPerPage: this.props.initialRowsPerPage,
            blankDisplay: false,
            options: this.getInitialOptions()
        }
    },

    getDefaultProps: function() {
        return {
            initialPageNumber: 1,
            initialRowsPerPage: 10,
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
            <div>
                <div className="rowsPerPage">
                    <select
                        value={this.state.rowsPerPage}
                        onChange={function(event) {
                            var value = Number(event.target.value);
                            t.setState({rowsPerPage: value, pageNumber: 1});
                            t.props.onRowsPerPageChange(value);
                    }}>
                        {t.state.options}
                    </select>
                </div>
                <div className="pageControls">
                    <Link id={t.props.id + "-first-page"} className="firstPageIcon" onClick={function(event) {
                        t.setState({pageNumber: 1});
                        t.props.onGoFirst();
                    }} />
                    <Link id={t.props.id + "-previous-page"} className="previousPageIcon" onClick={function(event) {
                        if (t.state.pageNumber > 1) {
                            t.setState({pageNumber: t.state.pageNumber - 1});
                        }
                        t.props.onGoPrevious();
                    }} />
                    <form
                        onSubmit={function(event) {
                            t.props.onSubmit(t.state.pageNumber);
                            event.preventDefault();
                        }}
                        style={{display: "inline-block", margin: 0}}>
                        <input
                            type="text"
                            value={!t.state.blankDisplay ? t.state.pageNumber : ""}
                            onChange={function(event) {
                                var display = event.target.value;
                                var value = Number(display);
                                if (display === "") {
                                    t.setState({blankDisplay: true});
                                }
                                if (value > 0 && value <= t.props.totalPages) {
                                    t.setState({pageNumber: value, blankDisplay: false});
                                }
                            }}
                            style={{width: "30px", textAlign: "center"}}
                        />
                    </form>
                    <span> / {!!t.props.totalPages ? t.props.totalPages : "?"} </span>
                    <Link id={t.props.id + "-next-page"} className="nextPageIcon" onClick={function(event) {
                        if (t.state.pageNumber < t.props.totalPages) {
                            t.setState({pageNumber: t.state.pageNumber + 1});
                        }
                        t.props.onGoNext();
                    }} />
                    <Link id={t.props.id + "-last-page"} className="lastPageIcon" onClick={function(event) {
                        if (!!t.props.totalPages) {
                            t.setState({pageNumber: t.props.totalPages});
                        }
                        t.props.onGoLast();
                    }} />
                </div>
            </div>
        );
    }
});

var DynamicDataTable = React.createClass({
    _state: {},

    _data: [],

    _columns: [],

    _onColumnResizeEndCallback: function(newColumnWidth, columnKey) {
        var targetIdx = -1;
        $.each(this._state.columnFormats, function(idx, columnFormat) {
            if (columnFormat.id === columnKey) {
                targetIdx = idx;
                return;
            }
        });
        this._state.columnFormats[targetIdx].width = newColumnWidth;
        this.refresh(true);
    },

    _sort: function() {
        var t = this;
        var sortedData = t._data.slice();

        var targetIdx = -1;
        $.each(this._state.columnFormats, function(idx, columnFormat) {
            if (!columnFormat.sortField && columnFormat.id === t._state.sortField ||
                columnFormat.sortField === t._state.sortField) {
                targetIdx = idx;
                return;
            }
        });
        sortedData.sort(function(a, b) {
            var sortFieldA = a[t._state.sortField] || "";
            var sortFieldB = b[t._state.sortField] || "";
            var columnFormat = t._state.columnFormats[targetIdx];
            if (!!columnFormat.sortFcn) {
                return columnFormat.sortFcn(sortFieldA, sortFieldB, t._state.sortDir);
            }
            return t.props.sortFcn(sortFieldA, sortFieldB, t._state.sortDir);
        });
        return sortedData;
    },

    _setFilterValue: function(columnId, filterValue, idx) {
        if (!idx) {
            // We're just setting a single filter value
            this._state.filters[columnId] = filterValue;
        }
        else {
            // We're setting a value for a specific index (date ranges)
            if (!Array.isArray(this._state.filters[columnId])) {
                this._state.filters[columnId] = [];
            }
            this._state.filters[columnId][idx] = filterValue;
        }
        this.constructPage();
    },

    _cycleSortDir: function() {
        if (!this._state.sortDir) {
            this._state.sortDir = "asc";
        }
        else if (this._state.sortDir === "asc") {
            this._state.sortDir = "desc";
        }
        else if (this._state.sortDir === "desc") {
            this._state.sortDir = undefined;
        }
        else {
            console.error("Unrecognized sortDir '" + this._state.sortDir + "'. Resetting to unsorted.");
            this._state.sortDir = undefined;
        }
    },

    _onSortClick: function(e, sortField) {
        e.preventDefault();
        if (this._state.sortField !== sortField) {
            this._state.sortField = sortField;
            this._state.sortDir = "asc";
        }
        else {
            this._cycleSortDir();
        }
        this.refresh(!this._state.serverSideOperations);
    },

    getInitialState: function() {
        var t = this;
        var totalRecords;
        var totalPages;
        if (!t.restUrl && t.props.initialData.length > 0) {
            totalRecords = t.props.initialData.length;
            totalPages = t.calculateTotalPages(totalRecords, t.props.initialRowsPerPage);
            t._data = t.props.initialData;
        }
        var filters = {};
        $.each(t.props.initialColumnFormats, function(idx, columnFormat) {
            filters[columnFormat.id] = columnFormat.initialFilterValue;
        });
        this._state = {
            rowsPerPage: t.props.initialRowsPerPage,
            totalRecords: totalRecords,
            totalPages: totalPages,
            pageNumber: t.props.initialPage,
            sortField: t.props.initialSortField,
            filters: {},
            columnFormats: t.props.initialColumnFormats,
            sortDir: t.props.initialSortDir,
            headerHeight: t.props.headerHeight,
            filters: filters,
            loading: false,
            error: false,
            onSubmit: function() {
                var deferred = $.Deferred();
                var submitData = t._data;
                if (!!t.props.formatSubmitData) {
                    submitData = t.props.formatSubmitData(t._data);
                }
                if (!!t.currentRequest) {
                    t.currentRequest.abort();
                }
                t.currentRequest = $.ajax({
                    url: t.props.submitUrl,
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(submitData),
                    success: function(data) {
                        // TODO user feedback within table header/footer
                        console.log("Successfully submitted data to '" + t.props.submitUrl + "'");
                        deferred.resolve("Success");
                    },
                    error: function(err) {
                        // TODO user feedback within table header/footer
                        console.error("Data submission to '" + t.props.submitUrl + "' failed");
                        deferred.reject("Error: " + err);
                    },
                    complete: function() {
                        t.currentRequest = null;
                    }
                });
                return deferred.promise();
            }
        };
        if (!!t.props.restUrl && t.props.initialData.length > 0) {
            // Log a warning. Initial data is ignored if we have a restUrl.
            console.error("Both restUrl and initialData have been provided to dynamic-data-table. The value for " +
                "initialData is being ignored.");
            t.props.initialData = [];
        }
        t._state.data = t.getPageData(t._data);
        return t._state;
    },

    getDefaultProps: function() {
        return {
            initialData: [],
            initialPage: 1,
            initialRowsPerPage: 10,
            rowsPerPageOptions: [10, 25, 50],
            serverSideOperations: false,
            sortFcn: function(a, b, sortDir) {
                var comparison = a.toLowerCase().localeCompare(b.toLowerCase());
                if (comparison === 0) {
                    comparison = a.localeCompare(b);
                }
                if (sortDir === 'desc') {
                    comparison = -comparison;
                }
                return comparison;
            },
            isColumnResizing: false,
            sortable: true
        };
    },

    propTypes: {
        // initialData is expected to be an array, but jquery returns a psuedo-array, so we need to allow
        // for objects too
        initialData: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
        restUrl: PropTypes.string,
        restParams: PropTypes.object,
        initialColumnFormats: PropTypes.arrayOf(PropTypes.object).isRequired,
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
        var deferred = $.Deferred();
        var params = t.props.restParams;
        if (t.props.serverSideOperations && !t.props.useScrolling) {
            params.pageNumber = t._state.pageNumber;
            params.rowsPerPage = t._state.rowsPerPage;
        }
        if (!!t.currentRequest) {
            t.currentRequest.abort();
        }
        t.currentRequest = $.get(t.props.restUrl, params);
        t.currentRequest.done(function(response) {
            var data = JSON.parse(response);
            if (data instanceof Array) {
                t._data = data;
            }
            else {
                t._data = data.records;
                t._state.totalRecords = data.totalRecords;
                if (!t.props.useScrolling) {
                    t._state.totalPages = t.calculateTotalPages();
                }
            }
            if (!t._state.totalRecords && !t.props.serverSideOperations) {
                t._state.totalRecords = t._data.length;
                t._state.totalPages = t.calculateTotalPages();
            }
            deferred.resolve(response);
        });
        t.currentRequest.fail(function (err) {
            // TODO user feedback within table header/footer
            console.error("Failed to load data from '" + t.props.restUrl);
            deferred.reject(err);
        });
        t.currentRequest.always(function() {
            t.currentRequest = null;
        });
        return deferred.promise();
    },

    getPageData: function() {
        var t = this;
        var data = t._data;
        if (!!t._state.sortDir && !!t._state.sortField) {
            data = t._sort();
        }
        $.each(t._state.filters, function(columnId, filterValue) {
            if (!!filterValue) {
                let filterFcn;
                if (!!Array.isArray(filterValue)) {
                    // It's a date range. We assume the filter values are Moments
                    let from = filterValue[0].valueOf();
                    let to = filterValue[1].valueOf();
                    // We assume the row values are unix ms time numbers and do an from/to inclusive filter
                    filterFcn = function(row) {
                        let rowValue = row[columnId];
                        return rowValue >= from && rowValue <= to;
                    }
                }
                else {
                    // It's a single value
                    let filterValueType = typeof filterValue;
                    if (filterValueType !== 'number') {
                        // Mostly for Moments, but works for any non-number, non-generic-object
                        filterValue = filterValue.valueOf();
                        filterValueType = typeof filterValue;
                    }
                    filterFcn = function(row) {
                        let rowValueType = typeof row[columnId];
                        // Base case is just a string
                        if (rowValueType === 'string' && filterValueType === 'string') {
                            return row[columnId].toLowerCase().includes(filterValue.toLowerCase());
                        }
                        // We expect numbers for date values (unix ms time)
                        else if (rowValueType === 'number' && filterValueType === 'number') {
                            return row[columnId] === filterValue;
                        }
                    };
                }
                data = data.filter(filterFcn);
            }
        });
        var startIdx;
        var endIdx;
        // If we are paginating client-side, slice the data appropriately
        if (!t.props.serverSideOperations && !t.props.useScrolling) {
            startIdx = (t._state.pageNumber - 1) * t._state.rowsPerPage;
            endIdx = startIdx + t._state.rowsPerPage;
            data = data.slice(startIdx, endIdx);
        }
        return data;
    },

    goFirst: function() {
        if (this._state.pageNumber > 1) {
            this._state.pageNumber = 1;
            this.refresh(!this._state.serverSideOperations);
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
            this.refresh(!this._state.serverSideOperations);
        }
    },

    goToPage: function(pageNumber) {
        var t = this;
        var previousPage;
        var previousData;
        if (pageNumber > 0 && (!t._state.totalPages ||
                (pageNumber != t._state.pageNumber && pageNumber <= t._state.totalPages))) {
            previousPage = t._state.pageNumber;
            previousData = t._state.data;
            t._state.pageNumber = pageNumber;
            $.when(t.refresh(!this._state.serverSideOperations)).then(
                function(result) {
                    // If we've passed the record boundaries, jump back to the previous page
                    if (t._state.data.length === 0) {
                        t._state.pageNumber = previousPage;
                        t._state.data = previousData;
                        t.refresh(true);
                    }
            });
        }
    },

    updateRowsPerPage: function(rowsPerPage) {
        if (rowsPerPage !== this._state.rowsPerPage && rowsPerPage > 0 &&
                rowsPerPage <= this.props.rowsPerPageOptions[this.props.rowsPerPageOptions.length - 1]) {
            this._state.rowsPerPage = rowsPerPage;
            this._state.pageNumber = 1;
            this._state.totalPages = this.calculateTotalPages();
            this.refresh(!this._state.serverSideOperations);
        }
    },

    calculateTotalPages: function(totalRecords, rowsPerPage) {
        if (!totalRecords) {
            totalRecords = this._state.totalRecords;
        }
        if (!rowsPerPage) {
            rowsPerPage = this._state.rowsPerPage;
        }
        return Math.ceil(totalRecords/rowsPerPage);
    },

    calculateBodyHeight: function() {
        var rowCount = this.state.rowsPerPage;
        if (this.state.data.length < this.state.rowsPerPage) {
            rowCount = this.state.data.length || 1;
        }
        return this.props.rowHeight * rowCount;
    },

    calculateHeight: function() {
        // The "+2" is 2px for styling from fdt for scroll shadows
        var height = this.state.headerHeight + this.calculateBodyHeight() + 2;
        if (!!this.props.footerHeight) {
            height += this.props.footerHeight;
        }
        return height;
    },

    constructColumns: function() {
        var t = this;
        t._columns = [];
        $.each(t._state.columnFormats, function(columnIndex, columnFormat) {
            // Cache the original header in the columnFormat for later usage
            if (!columnFormat.origHeader) {
                columnFormat.origHeader = columnFormat.header;
            }
            var columnId = columnFormat.id;
            var columnFormatter = columnFormat.formatter;
            var sortIcon = "";
            if (!t.props.width) {
                t._state.width += columnFormat.width;
            }
            var columnSortField = columnFormat.sortField || columnFormat.id;
            var header = columnFormat.origHeader;
            if (columnFormat.sortable) {
                if (t._state.sortField === columnSortField) {
                    if (t._state.sortDir === "asc") {
                        sortIcon = " ↓";
                    }
                    else if (t._state.sortDir === "desc") {
                        sortIcon = " ↑";
                    }
                }
                header = (
                    <a className="block link" onClick={function(e) { t._onSortClick(e, columnSortField); }}>
                        {columnFormat.origHeader}{sortIcon}
                    </a>
                );
            }
            if (!!columnFormat.filterType) {
                if (t._state.headerHeight === t.props.headerHeight) {
                    // We have at least one filter, but the header height hasn't been updated to fit the inputs
                    t._state.headerHeight = t._state.headerHeight + 34;
                }
                var filter;
                var handleChange = function(e) {
                    t._setFilterValue(columnFormat.id, e.target.value);
                };
                if (columnFormat.filterType === 'text') {
                    filter = <FormControl
                        id={t.props.id + '-' + columnFormat.id + '-text'}
                        key={t.props.id + '-' + columnFormat.id + '-text'}
                        type="text"
                        value={t._state.filters[columnFormat.id]}
                        placeholder="Enter Text"
                        onChange={handleChange}
                    />;
                }
                else if (columnFormat.filterType === 'select') {
                    filter = <FormControl
                        id={t.props.id + '-' + columnFormat.id + '-select'}
                        key={t.props.id + '-' + columnFormat.id + '-select'}
                        componentClass="select"
                        onChange={handleChange}
                    >
                        <option value=""></option>
                        {columnFormat.filterOptions.map(function(option) {
                            return <option key={option.value} value={option.value}>{option.label}</option>;
                        })}
                    </FormControl>;
                }
                else if (columnFormat.filterType === 'combobox') {
                    filter = <RestCombobox
                        id={t.props.id + '-' + columnFormat.id + '-combobox'}
                        key={t.props.id + '-' + columnFormat.id + '-combobox'}
                        className="form-control"
                        placeholder='Enter Text'
                        showYearDropdown
                        onSelect={function(value) {
                            t._setFilterValue(columnFormat.id, value);
                        }}
                        initialValue={t._state.filters[columnFormat.id]}
                        restUrl={columnFormat.filterRestUrl}
                        queryFcn={columnFormat.queryFcn}
                        formatFcn={function(value) {
                            let data = {};
                            data[columnFormat.id] = value;
                            return columnFormat.formatter(data, t);
                        }}
                    />;
                }
                else if (columnFormat.filterType === 'date') {
                    filter = <DatePicker
                        id={t.props.id + '-' + columnFormat.id + '-date'}
                        key={t.props.id + '-' + columnFormat.id + '-date'}
                        className="form-control"
                        placeholderText='Select Date'
                        showYearDropdown
                        onChange={function(e) {
                            t._setFilterValue(columnFormat.id, e);
                        }}
                        selected={t._state.filters[columnFormat.id]}
                    />;
                }
                else if (columnFormat.filterType === 'daterange') {
                    filter = (
                        <div className='daterange-filter'>
                            <DatePicker
                                id={t.props.id + '-' + columnFormat.id + '-daterange-from'}
                                key={t.props.id + '-' + columnFormat.id + '-daterange-from'}
                                className="form-control"
                                placeholderText='From Date'
                                showYearDropdown
                                onChange={function(e) {
                                    t._setFilterValue(columnFormat.id, e, 0);
                                }}
                                selected={t._state.filters[columnFormat.id][0]}
                            />
                            <DatePicker
                                id={t.props.id + '-' + columnFormat.id + '-daterange-to'}
                                key={t.props.id + '-' + columnFormat.id + '-daterange-to'}
                                className="form-control"
                                placeholderText='To Date'
                                showYearDropdown
                                onChange={function(e) {
                                    t._setFilterValue(columnFormat.id, e, 1);
                                }}
                                selected={t._state.filters[columnFormat.id][1]}
                            />
                        </div>
                    );
                }
                else {
                    console.error("Unknown filter type.");
                }
                header = (
                    <div className="fullBlock">
                        {header}
                        {filter}
                    </div>
                );
            }
            columnFormat.header = <Cell>{header}</Cell>;
            let content;
            let className;
            let width = 0;
            t._columns.push(
                <Column
                    key={columnId}
                    columnKey={columnId}
                    cell={function(cellData) {
                        if (t._state.loading || t._state.error) {
                            if (columnIndex === 0) {
                                className = 'preLoadCell';
                                width = t._state.width;
                                if (t._state.error) {
                                    if (!!t.props.errorMsg) {
                                        content = t.props.errorMsg
                                    }
                                    else {
                                        content = 'Unable to load data. If this keeps happening, there may be an issue with the server, and you should contact your support representative.';
                                    }
                                }
                                else {
                                    content = <Link id={t.props.id + "-loading-icon"} className="loading" />;
                                }
                            }
                            else {
                                return null;
                            }
                        }
                        else {
                            className = "dataCell";
                            if (!!columnFormat.cellClass) {
                                className = className + " " + columnFormat.cellClass;
                            }
                            if (!!columnFormatter) {
                                content = columnFormatter(t._state.data[cellData.rowIndex], t);
                            }
                            else {
                                content = t._state.data[cellData.rowIndex][columnId];
                            }
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
                        }
                        return (
                            <Cell key={columnId + cellData.rowIndex} className={className} width={width}>
                                {content}
                            </Cell>
                        );
                    }}
                    {...columnFormat} />
            );
        });
    },

    constructPage: function() {
        this.resetDimensions();
        this._state.data = this.getPageData();
        this.constructColumns();
        this.setState(this._state);
    },

    refresh: function(skipReload) {
        var t = this;
        var deferred = $.Deferred();
        if (!skipReload && !!t.props.restUrl) {
            t._state.loading = true;
            t._state.error = false;
            $.when(t.loadData()).then(
                function(result) {
                    t._state.loading = false;
                    t.constructPage();
                    deferred.resolve(result);
                }, function(err) {
                    var aborted = err.statusText === 'abort';
                    // We don't count this as an error if we're aborting the request
                    t._state.loading = aborted;
                    t._state.error = !aborted;
                    t.constructPage();
                    deferred.reject(err);
            });
        }
        else {
            deferred.resolve("Using local data.");
        }
        t.constructPage();
        return deferred.promise();
    },

    componentDidMount: function() {
        this.refresh();
    },

    componentWillUnmount: function() {
        if (!!this.currentRequest) {
            this.currentRequest.abort();
        }
    },

    render: function() {
        var t = this;
        var refreshButton;
        var submitButton;
        var pageNav;
        var dimensions = {};
        if (!!t.props.restUrl) {
            refreshButton =
                <Link id={t.props.id + "-refresh"} className="reloadIcon" tooltip="Refresh table" onClick={function(event) {
                    t.refresh();
                }} />;
        }
        if (!!t.props.submitUrl) {
            submitButton = <Link id={t.props.id + "-submit"} showLabel={true} label="Submit" onClick={function(event) {
                t.state.onSubmit(event);
                event.preventDefault();
            }} />;
        }
        if (!t.props.useScrolling) {
            pageNav = <PaginationControls
                            initialPageNumber={t.state.pageNumber}
                            initialRowsPerPage={t.state.rowsPerPage}
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
            dimensions.width = t.state.width || 0;
        }
        if (!t.props.height) {
            dimensions.height = t.calculateHeight() || 0;
        }
        var {headerHeight, rowHeight, ...childProps} = t.props;
        var rowsCount = t.state.data.length;
        var className = "dataTable " + t.props.className;
        if (t.state.loading || t.state.error) {
            rowHeight = t.calculateBodyHeight();
            rowsCount = 1;
            className += " dataTablePreload";
        }
        return (
            <div id={t.props.id} className={className} style={{'width': dimensions.width, 'height': dimensions.height + 20}}>
                <Table rowsCount={rowsCount}
                       onColumnResizeEndCallback={t._onColumnResizeEndCallback}
                       headerHeight={t.state.headerHeight}
                       rowHeight={rowHeight}
                       {...dimensions}
                       {...childProps}>
                    {t._columns}
                </Table>
                <div className="dataTableFooter">
                    <div className="paginationWrapper">
                        {pageNav}
                    </div>
                    <div className="operationsWrapper">
                        {submitButton}
                        {refreshButton}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = DynamicDataTable;
