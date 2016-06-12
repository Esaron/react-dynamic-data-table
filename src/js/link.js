/**
 * Created by esaron on 6/12/16.
 */

const React = require('react');
const PropTypes = React.PropTypes;

var Link = React.createClass({
    propTypes: {
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        showLabel: PropTypes.bool,
        href: PropTypes.string,
        className: PropTypes.string
    },

    getDefaultProps: function() {
        return {
            label: "",
            showLabel: true
        };
    },

    getInitialState: function() {
        var t = this;
        var onClick = t.props.onClick;
        if (!onClick) {
            onClick = function(e) {
                location.href=t.props.href;
            }
        }
        return {
            onClick: onClick
        };
    },

    render: function() {
        var label;
        if (this.props.showLabel) {
            label = <a className="linkLabel">{this.props.label}</a>;
        }
        return (
            <div onClick={this.state.onClick}>
                <div id={this.props.id} className={this.props.className}></div>
                {label}
            </div>
        );
    }
});

module.exports = Link;