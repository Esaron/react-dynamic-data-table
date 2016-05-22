/**
 * Created by esaron on 5/21/16.
 */

var React = require('react');

var Button = React.createClass({
    getInitialState: function() {
        return {
            text: ''
        };
    },

    render: function() {
        return (
            <div class="button">
                {this.text}
            </div>
        );
    }
});

module.exports = Button;