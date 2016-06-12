const React = require('react');
const ReactDOM = require('react-dom');
const {Table, Column, Cell} = require('fixed-data-table');
const DataTable = require('./data-table.js');

// Column config as an object of column ids to column format objects
const columns = {
    name: {
        label: "Name"
    },
    title: {
        label: "Title"
    },
    email: {
        label: "Email",
        editable: true
    }
};

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
var headerHeight = 40;
var rowHeight = 30;
// -16 for page margins because reasons
var tableWidth = window.innerWidth - 16;
var rowWidth = tableWidth/rows[0].length;
// +2 px for fdt margin also because reasons
var tableHeight = rows.length * rowHeight + headerHeight + 2;
var maxHeight = window.innerHeight - 16;
if (tableHeight > maxHeight) {
    tableHeight = maxHeight;
}

var table = (
    <DataTable
        rowHeight={rowHeight}
        rowsCount={rows.length}
        width={tableWidth}
        height={tableHeight}
        headerHeight={headerHeight}
        columnFormats={columns}
        initialData={rows}
        restUrl="debug"
    />
);

ReactDOM.render(
    table,
    document.getElementById('content')
);
