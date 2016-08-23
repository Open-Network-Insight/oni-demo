var React = require('react');

var DateInput = require('../../js/components/DateInput.react');
var OniActions = require('../../js/actions/OniActions');
var OniConstants = require('../../js/constants/OniConstants');
var OniUtils = require('../../js/utils/OniUtils');
var StoryboardActions = require('../../js/actions/StoryboardActions');

React.render(
  (
    <form className="form-inline">
      <div className="form-group">
        <label htmlFor="dataDatePicker">Data Date:</label>
        <div className="input-group input-group-xs">
          <DateInput id="dataDatePicker" onChange={StoryboardActions.reloadComments} />
          <div className="input-group-addon">
            <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </form>
  ),
  document.getElementById('nav_form')
);

var PanelRow = require('../../js/components/PanelRow.react');
var Panel = require('../../js/components/Panel.react');

var ExecutiveThreatBriefingPanel = require('../../js/components/ExecutiveThreatBriefingPanel.react');
var IncidentProgressionPanel = require('./components/IncidentProgressionPanel.react');
var TimelinePanel = require('./components/TimelinePanel.react');

var CommentsStore = require('./stores/CommentsStore');

React.render(
  <div id="oni-content">
    <PanelRow maximized>
        <div className="oni-sidebar col-md-4">
            <PanelRow>
                <Panel className="col-md-12" title={OniConstants.COMMENTS_PANEL}>
                    <ExecutiveThreatBriefingPanel store={CommentsStore} />
                </Panel>
            </PanelRow>
            <PanelRow>
                <Panel className="col-md-12 sb_timeline" title={OniConstants.TIMELINE_PANEL}>
                    <TimelinePanel />
                </Panel>
            </PanelRow>
        </div>
        <Panel className="col-md-8" title={OniConstants.INCIDENT_PANEL} container>
            <IncidentProgressionPanel className="oni-incident-progression"/>
        </Panel>
    </PanelRow>
  </div>,
  document.getElementById('oni-content-wrapper')
);

// Set search criteria
var date;

date = OniUtils.getCurrentDate();

OniActions.setDate(date);

// Make inital load
StoryboardActions.reloadComments();
