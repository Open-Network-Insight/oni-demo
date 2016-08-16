var React = require('react');

var DetailsGridMixin = require('../../../js/components/DetailsGridMixin.react');
var GridPanelMixin = require('../../../js/components/GridPanelMixin.react');
var DetailsStore = require('../stores/DetailsStore');

var DetailsPanel = React.createClass({
    mixins: [GridPanelMixin, DetailsGridMixin],
    store: DetailsStore,
    // Custom cells
    _render_p_date_cell: function (date, item) {
        return date + ' ' + item.p_time;
    },
    // Hidden cells
    _render_p_time_cell: false,
    _render_duration_cell: false,
    _render_username_cell: false,
    _render_authgroup_cell: false,
    _render_exceptionid_cell: false,
    _render_filterresult_cell: false,
    _render_respcode_cell: false,
    _render_action_cell: false,
    _render_urischeme_cell: false,
    _render_uripath_cell: false,
    _render_uriquery_cell: false,
    _render_uriextension_cell: false,
    _render_virusid_cell: false,
    _render_bcappname_cell: false,
    _render_bcappoper_cell: false,
    _render_sev_cell: false,
    _render_uri_rep_cell: false,
    _render_hash_cell: false
});

module.exports = DetailsPanel;
