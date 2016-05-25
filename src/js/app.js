const React = require('react');
const ReactDOM = require('react-dom');
const {Table, Column, Cell} = require('fixed-data-table');
const DataTable = require('./data-table.js');

// Column config as an object of column ids to column format objects
const columns = [{
        id: "name",
        width: 300,
        header: "Name"
    }, {
        id: "title",
        width: 300,
        header: "Title"
    }, {
        id: "email",
        width: 300,
        header: "Email",
        editable: true
}];

// Table data as an array of row objects
const rows = [{
    name: "John Doe",
    title: "CEO",
    email: "jdoe@foo.com"
}, {
    name: "Dean Winchester",
    title: "Hunter",
    email: "daddyissues@bar.com"
}, {
    name: "Buffy Summers",
    title: "Slayer",
    email: "vampiressuck@baz.com"
}];

// Render your table
var headerHeight = footerHeight = 40;
var rowHeight = 38;
// -16 for page margins because reasons
var tableWidth = window.innerWidth - 16;
var rowWidth = tableWidth/rows[0].length;
// +2 px for fdt margin also because reasons
var tableHeight = rows.length * rowHeight + headerHeight + footerHeight + 2;
var maxHeight = window.innerHeight - 16;
if (tableHeight > maxHeight) {
    tableHeight = maxHeight;
}

var table = (
    <DataTable
        className="dataTable"
        rowHeight={rowHeight}
        headerHeight={headerHeight}
        columnFormats={columns}
        restUrl="debug"
    />
);

ReactDOM.render(
    table,
    document.getElementById('content')
);
