/**
 * Created by esaron on 5/21/16.
 */

var React = require('react');

var Button = React.createClass({
    getInitialState: function() {
        return {};
    },

    render: function() {
        return (
            <button type="button" className={this.props.className} onClick={this.props.onClick}>
                {this.props.text}
            </button>
        );
    }
});

module.exports = Button;