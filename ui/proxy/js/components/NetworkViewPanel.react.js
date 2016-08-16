var $ = require('jquery');
var assign = require('object-assign');
var d3 = require('d3');
var React = require('react');

var EdInActions = require('../../../js/actions/EdInActions');
var OniConstants = require('../../../js/constants/OniConstants');
var OniUtils = require('../../../js/utils/OniUtils');
var SuspiciousStore = require('../stores/SuspiciousStore');

var NetworkViewPanel = React.createClass({
    getInitialState: function ()
    {
        return {loading: true, data: []};
    },
    render:function()
    {
        var content;

        if (this.state.error)
        {
            content = (
                <span className="text-center text-danger">
              {this.state.error}
            </span>
            );
        }
        else if (this.state.loading)
        {
            content = (
                <div className="oni_loader">
                    Loading <span className="spinner"></span>
                </div>
            );
        }
        else
        {
            content = '';
        }

        return (
            <div className="proxy-force">{content}</div>
        )
    },
    componentDidMount: function()
    {
        SuspiciousStore.addChangeDataListener(this._onChange);
        SuspiciousStore.addThreatHighlightListener(this._onHighlight);
        SuspiciousStore.addThreatUnhighlightListener(this._onUnhighlight);
        SuspiciousStore.addThreatSelectListener(this._onSelect);
        window.addEventListener('resize', this.buildGraph);
    },
    componentWillUnmount: function ()
    {
        SuspiciousStore.removeChangeDataListener(this._onChange);
        SuspiciousStore.removeThreatHighlightListener(this._onHighlight);
        SuspiciousStore.removeThreatUnhighlightListener(this._onUnhighlight);
        SuspiciousStore.removeThreatSelectListener(this._onSelect);
        window.removeEventListener('resize', this.buildGraph);
    },
    componentDidUpdate: function ()
    {
        if (!this.state.loading && !this.state.error)
        {
            this.buildGraph();
        }
    },
    buildGraph: function () {
        var node, width, height, zoom, svg;

        node = this.getDOMNode();

        width = $(node).width();
        height = $(node).height();

        this.state.root.fixed = true;
        this.state.root.px = width / 2;
        this.state.root.py = height / 2;

        this.force = d3.layout.force()
            .charge(function (d) { return d._children ? -d.size/100 : -30; })
            .linkDistance(function (d) { return d.target._children ? 80 : 30; })
            .size([width-100, height-100])
            .on('tick', this.tick);

        svg = d3.select(node).select('svg');
        if (svg.node()) {
            this.canvas = svg.select('g');
        }
        else {
            zoom = d3.behavior.zoom().on("zoom", this.onZoom);

            svg = d3.select(node).append('svg');

            svg.call(zoom);

            this.canvas = svg.append('g');

            this.tip = d3.tip().attr('class', 'd3-tip').html(d => {
                                        var html;

                                        html = '<span class="d3-tip-label"><strong>' + d.type + ':</strong> ' + d.name + '</span>';
                                        if (d.tooltip) html = html + '<br /><br /><p class="d3-tip-message">' + d.tooltip + '</p>';

                                        return html;
                                    });

            this.canvas.call(this.tip);
        }

        // Tooltip margins
        this.tip.box = [height*.4, width*.8, height*.8, width*.4];

        svg.attr('width', width).attr('height', height);

        this.sizeScale = d3.scale.linear().domain([0, OniConstants.MAX_SUSPICIOUS_ROWS]).range([4.5, width/10]);

        this.draw();
    },
    draw: function () {
        var nodes = this.flatten(this.state.root),
            links = d3.layout.tree().links(nodes),
            selectedThreat, ids;

        selectedThreat = SuspiciousStore.getSelectedThreat();

        ids = selectedThreat ? this._getThreatIdChain(selectedThreat) : [];

        // Restart the force layout
        this.force
            .nodes(nodes)
            .links(links)
            .start();

        // Update links
        this.link = this.canvas.selectAll('.edge')
            .data(links.filter((link) => link.target.visible), function(d) { return d.source.id + '-' + d.target.id; });

        // Insert new links
        this.link.enter().insert("line", ".node")
                                                .classed('edge', true)
                                                .classed('blink_me', d => ids.indexOf(d.target.id)>-1);

        // Delete old links
        this.link.exit().remove();

        // Update nodes
        this.node = this.canvas.selectAll('.node')
            .data(nodes.filter((node) => node.visible), function(d) { return d.id; });

        this.node.transition()
            .attr("r", function(d) {
                return this.sizeScale( d.root || d.expanded ? 0 : d.size );
            }.bind(this));

        this.node.enter().append("circle")
            .attr("class", d => {
                return 'node ' + (ids.indexOf(d.id)>-1 ? 'blink_me ':'') + OniUtils.CSS_RISK_CLASSES[d.rep] + (!d.children ? ' leaf' : '');
            })
            .attr("r", function(d) {
                return this.sizeScale( d.root || d.expanded ? 0 : d.size );
            }.bind(this))
            .on("dblclick", this.onNodeDblClick)
            .on("contextmenu", (d, i) => {
                d3.event.preventDefault();

                if (!d.isDataFilter) return;

                this.tip.hide();

                EdInActions.setFilter(d.filter || d.name);
                EdInActions.reloadSuspicious();
            })
            .on("mouseover", d => {
                var direction = '';

                // Where should the tooltip be displayed?

                // Vertically
                if (d3.event.layerY<this.tip.box[0]) {
                    direction = 's';
                }
                else if (d3.event.layerY>this.tip.box[2]) {
                    direction = 'n';
                }

                // Horizontally
                if (d3.event.layerX>this.tip.box[1]) {
                    direction += 'w';
                }
                else if (d3.event.layerX<this.tip.box[3]) {
                    direction += 'e'
                }

                direction = direction || 'n';

                this.tip.direction(direction);
                this.tip.show.call(this, d);
            })
            .on("mouseout", () => {
                this.tip.hide();
            })
            .call(this.force.drag);

        // Delete old nodes
        this.node.exit().remove();
    },
    tick: function () {
        this.link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        this.node
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    },
    onZoom: function () {
        var translate, scale;

        translate = d3.event.translate;
        scale = d3.event.scale;

        this.canvas.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    },
    onNodeDblClick: function (node) {
        if (d3.event.defaultPrevented) return; // ignore drag

        if (!node.children) return;

        d3.event.preventDefault();
        d3.event.stopPropagation();

        node.expanded = !node.expanded;

        return node.root ? this.onRootDblClick(node) : this.onChildNodeDblClick(node);
    },
    // Root node click handler
    onRootDblClick: function (root)
    {
        function recurse(n) {
            if (!n.children) return;

            n.children.forEach(child => {
                // Direct children must remain visible
                child.visible = root==n || root.expanded;
                // Every child must remain collapsed
                child.expanded = root.expanded;

                recurse(child);
            });
        }

        recurse(root);

        this.draw();
    },
    // Root descendant click handler
    onChildNodeDblClick: function (node) {
        function recurse(n) {
            if (!n.children) return;

            n.children.forEach(child => {
                // Only direct children might be visible
                child.visible = node==n && node.expanded;
                // Collapse every node under root
                child.expanded = false;

                recurse(child);
            });
        }

        recurse(node);

        this.draw();
    },
    _onChange: function () {
        // Flatern data. In Store?
        var state, data, refs;

        state = assign({}, {data: {}}, SuspiciousStore.getData());

        if (!state.loading)
        {
            data = {
                id: 'oni_proxy',
                name: 'Proxy',
                type: 'Root',
                tooltip: 'Double click to toggle child nodes',
                rep: -1,
                visible: true,
                expanded: true,
                root: true
            };

            refs = {};

            state.data.forEach(function (item) {
                var rep, methodKey, hostKey, uriKey, clientKey, path, obj;

                if (item.host=='-') {
                    console.log('Skipping invalid URL: ' + item.fulluri);
                    return;
                }

                rep = OniUtils.getHighestReputation(item.uri_rep);
                data.rep = Math.max(data.rep, rep);
                methodKey = item.reqmethod;
                path = ['children'];
                if (refs[methodKey]===undefined) {
                    obj = {id: methodKey, name: item.reqmethod, type: 'Method', rep: rep, visible: true};

                    refs[methodKey] = obj;

                    data.children ? data.children.push(obj) : data.children = [obj];
                }
                else {
                    refs[methodKey].rep = Math.max(refs[methodKey].rep, rep);
                }

                hostKey = methodKey + item.host;
                if (refs[hostKey]===undefined) {
                    obj = {id: hostKey, name: item.host, type: 'Host', rep: rep, visible: false};

                    refs[hostKey] = obj;

                    refs[methodKey].children ? refs[methodKey].children.push(obj) : refs[methodKey].children = [obj];
                }
                else {
                    refs[hostKey].rep = Math.max(refs[hostKey].rep, rep);
                }

                uriKey = hostKey + item.uripath;
                if (refs[uriKey]===undefined) {
                    obj = {
                        id: uriKey,
                        name:  item.uripath,
                        type: 'Path',
                        rep: rep,
                        visible: false,
                        isDataFilter: true,
                        filter: item.fulluri,
                        tooltip: 'Secondary click to use URI as filter'
                    };

                    refs[uriKey] = obj;

                    refs[hostKey].children ? refs[hostKey].children.push(obj) : refs[hostKey].children = [obj];
                }
                else {
                    refs[uriKey].rep = Math.max(refs[uriKey].rep, rep);
                }

                clientKey = uriKey + item.clientip;
                if (refs[clientKey]===undefined) {
                    obj = {
                        id: clientKey,
                        name:  item.clientip,
                        type: 'Ip',
                        rep: rep,
                        visible: false,
                        isDataFilter: true,
                        tooltip: 'Secondary click to use IP as filter'
                    };

                    refs[clientKey] = obj;

                    obj.tooltip = '<strong>URI:</strong> ' + item.fulluri + '<br />';
                    item.useragent && item.useragent!='-' && ('<strong>User Agent: </strong>' + item.useragent + '<br />');
                    item.resconttype && item.resconttype!='-' && (obj.tooltip+= '<strong>MIME type: </strong>' + item.resconttype + '<br />');
                    item.username && item.username!='-' && (obj.tooltip+= '<strong>Username: </strong>' + item.username + '<br />');
                    item.referer && item.referer!='-' && (obj.tooltip+= '<strong>Referer: </strong>' + item.referer + '<br />');
                    item.respcode && item.respcode!='-' && (obj.tooltip+= '<strong>Response code: </strong>' + item.respcode + '<br />');
                    obj.tooltip+= '<strong>SC bytes: </strong>' + item.scbytes + '<br />';
                    obj.tooltip+= '<strong>CS bytes: </strong>' + item.csbytes;

                    refs[uriKey].children ? refs[uriKey].children.push(obj) : refs[uriKey].children = [obj];
                }
                else {
                    refs[clientKey].rep = Math.max(refs[clientKey].rep, rep);
                }

                refs[clientKey].hits ? refs[clientKey].hits.push(item) : refs[clientKey].hits = [obj];
            });

            state.root = data;
        }

        this.setState(state);
    },
    flatten: function (root) {
        var nodes = [];

        function recurse(node) {
            if (node.children) {
                node.size = node.children.reduce(
                    function (p, n) {
                        n.parent = node;
                        return p + recurse(n);
                    },
                    0
                );
            } else {
                node.size = node.hits.length;
            }

            nodes.push(node);

            return node.size || 1;
        }

        root.size = recurse(root);

        return nodes;
    },
    _getThreatIdChain: function (threat) {
        var id;

        return [
            this.state.root.id,
            id=threat.reqmethod,
            id+=threat.host,
            id+=threat.uripath,
            id+=threat.clientip
        ];
    },
    _onHighlight: function () {
        var threat, ids;

        threat = SuspiciousStore.getHighlightedThreat();

        ids = this._getThreatIdChain(threat);

        d3.selectAll('.edge').filter(n => {
            return ids.indexOf(n.target.id)<0;
        }).classed('faded', true);

        d3.selectAll('.node').filter(n => ids.indexOf(n.id)<0).classed('faded', true);

    },
    _onUnhighlight: function () {
        d3.selectAll('.edge, .node').classed('faded', false);
    },
    _onSelect: function () {
        var threat, ids;

        threat = SuspiciousStore.getSelectedThreat();

        ids = this._getThreatIdChain(threat);

        d3.selectAll('.blink_me').classed('blink_me', false);
        d3.selectAll('.edge').filter(n => {
            return ids.indexOf(n.target.id)>-1;
        }).classed('blink_me', true);

        d3.selectAll('.node').filter(n => ids.indexOf(n.id)>-1).classed('blink_me', true);
    }
});

module.exports = NetworkViewPanel;
