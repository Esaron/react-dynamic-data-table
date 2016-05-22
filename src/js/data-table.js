/**
 *  Created by esaron on 5/21/16.
 *
 *  Internal Fields (Not for external manipulation)
 *      _columns:           Used for tracking dynamically constructed Columns (column config with nested row data).
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

const React = require('react');
const PropTypes = React.PropTypes;
const {Table, Column, Cell} = require('fixed-data-table');
const Button = require('./button.js')

var DataTable = React.createClass({
    _columns: [],

    getInitialState: function() {
        var state = {
            data: this.props.initialData,
            rowsPerPage: this.props.initialRowsPerPage,
            pageNumber: 1,
            sortDir: 'asc',
            filters: {}
        };
        if (!!this.props.restUrl) {
            this.refreshButton = <Button text={'Refresh'} onClick={this.refresh()} />;
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
        // TODO
        // data = ajax call to retrieve data from this.restUrl
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
                            content = <input type="text" id={columnId + cellData.rowIndex} defaultValue={content} />;
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
        this.constructColumns();
    },

    componentWillMount: function() {
        this.constructColumns();
    },

    componentDidMount: function() {

    },

    componentWillReceiveProps: function(nextProps) {

    },

    shouldComponentUpdate: function() {

    },

    componentWillUpdate: function() {

    },

    componentDidUpdate: function() {

    },

    componentWillUnmount: function() {

    },

    render: function() {
        return (
            <div className="dataTable">
                <Table {...this.props}>
                    {this._columns}
                </Table>
                {this.refreshButton}
            </div>
        );
    }
});

module.exports = DataTable;