var React = require('react');

var ContentLoaderMixin = {
    renderError: function () {
        return (
            <div className="oni-content-loader">
                <span className="text-danger">{this.state.error}</span>
            </div>
        );
    },
    renderContentLoader: function () {
        return (
            <div className="oni-content-loader">
                <div className="oni_loader">
                    Loading <span className="spinner"></span>
                </div>
            </div>
        );
    },
    render: function () {
        var state, content;

        state = this.state || {};

        if (state.error) {
            content = this.renderError();
        }
        else if (state.loading) {
            content = this.renderContentLoader();
        }
        else {
            content = this.renderContent();
        }

        return content;
    }
};

module.exports = ContentLoaderMixin;
