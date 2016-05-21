var React = require('react');
var ReactDOM = require('react-dom');
var {Table, Column, Cell} = require('fixed-data-table');

// Table data as a list of array.
const rows = [
  ['a1', 'b1', 'c1'],
  ['a2', 'b2', 'c2'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3'],
  ['a3', 'b3', 'c3']
  // .... and more
];

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
ReactDOM.render(
  <Table
    rowHeight={rowHeight}
    rowsCount={rows.length}
    width={tableWidth}
    height={tableHeight}
    headerHeight={headerHeight}>
    <Column
      header={<Cell>Col 1</Cell>}
      cell={props => (
        <Cell {...props}>
          {rows[props.rowIndex][0]}
        </Cell>
      )}
      width={rowWidth}
    />
    <Column
      header={<Cell>Col 2</Cell>}
      cell={props => (
        <Cell {...props}>
           {rows[props.rowIndex][1]}
        </Cell>
      )}
      width={rowWidth}
    />
    <Column
      header={<Cell>Col 3</Cell>}
      cell={props => (
        <Cell {...props}>
          {rows[props.rowIndex][2]}
        </Cell>
      )}
      width={rowWidth}
    />
  </Table>,
  document.getElementById('content')
);
