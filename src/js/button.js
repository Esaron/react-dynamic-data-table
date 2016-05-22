/**
 * Created by esaron on 5/21/16.
 */

var React = require('react');

var Button = React.createClass({
    render: function() {
        return (
            <div className={this.state.className}>
                {this.state.text}
            </div>
        );
    }
});

module.exports = Button;