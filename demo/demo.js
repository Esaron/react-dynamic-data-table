'use strict';

// Styling
require('../dist/css/react-dynamic-data-table.css');

const DynamicDataTable = require('../dist/js/react-dynamic-data-table.js'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    id = "table-demo";

ReactDOM.render(React.createElement(DynamicDataTable, {
    className: "hoverHighlight",
    headerHeight: 40,
    id: id,
    initialColumnFormats: [{
        header: "Column 1",
        id: "col1",
        isResizable: true,
        formatter: function formatter(data) {
            return "Data: " + data["col1"];
        },
        sortable: true,
        width: 200
    }, {
        header: "Column 2",
        id: "col2",
        isResizable: true,
        sortable: true,
        width: 250
    }],
    initialData: [{
        col1: "row1/col1",
        col2: "row1/col2"
    }, {
        col1: "row2/col1",
        col2: "row2/col2"
    }, {
        col1: "row3/col1",
        col2: "row3/col2"
    }, {
        col1: "row4/col1",
        col2: "row4/col2"
    }, {
        col1: "row5/col1",
        col2: "row5/col2"
    }, {
        col1: "row6/col1",
        col2: "row6/col2"
    }, {
        col1: "row7/col1",
        col2: "row7/col2"
    }, {
        col1: "row8/col1",
        col2: "row8/col2"
    }, {
        col1: "row9/col1",
        col2: "row9/col2"
    }, {
        col1: "row10/col1",
        col2: "row10/col2"
    }, {
        col1: "row11/col1",
        col2: "row11/col2"
    }],
    key: id,
    rowHeight: 30
}), document.getElementById("root"));