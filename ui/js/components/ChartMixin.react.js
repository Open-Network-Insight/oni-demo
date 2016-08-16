var React = require('react');

var ChartMixin = {
    propTypes: {
        className: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {
            className: 'oni-chart'
        };
    },
    componentDidUpdate: function (prevProps, prevState)
    {
        var state;

        prevState = prevState || {};
        state = this.state || {};

        if (state.error) return;

        if (!state.loading) {
            if (prevState.loading) {
                this.buildChart();
            }

            state.data && this.draw();
        }
    },
    renderContent: function () {
        return (
            <div className={this.props.className}>
                <svg className="canvas"></svg>
            </div>
        );
    },
};

module.exports = ChartMixin;
