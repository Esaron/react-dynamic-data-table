const React = require('react');
const ReactDOM = require('react-dom');
const Link = require('./link.js');

var link = (
    <Link
        id="demoLink"
        label="Link"
        showLabel={true}
        className="linkImage"
        href="https://www.google.com"
    />
);

ReactDOM.render(
    link,
    document.getElementById('content')
);
