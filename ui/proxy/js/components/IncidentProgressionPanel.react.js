var $ = require('jquery');
var d3 = require('d3');
var d3Interpolate = require('d3-interpolate');
var React = require('react');

var ContentLoaderMixin = require('../../../js/components/ContentLoaderMixin.react');
var ChartMixin = require('../../../js/components/ChartMixin.react');
var IncidentProgressionStore = require('../stores/IncidentProgressionStore');

var TRANSITION_DURATION  = 3000;
// 8 Imaginary columns in total for chart
var COLS_TOTAL = 8;
var COLS_REQUESTS = 4.5;
var COLS_RFERERS = 1.5;
var COLS_EMPTY = 2;

var IncidentProgressionPanel = React.createClass({
    mixins: [ContentLoaderMixin, ChartMixin],
    componentDidMount: function () {
        IncidentProgressionStore.addChangeDataListener(this._onChange);
        window.addEventListener('resize', this._onWindowResize);
    },
    componentWillUnmount: function () {
        IncidentProgressionStore.removeChangeDataListener(this._onChange);
        window.removeEventListener('resize', this._onWindowResize);
    },
    _onWindowResize: function () {
        this.buildChart();
        this.draw();
    },
    initTree: function (width, height, invertedTree) {
        return {
            layout: d3.layout.tree().size([height-30, width-30]),
            diagonal: d3.svg.diagonal().projection(function(d) { return [d.y, invertedTree?-d.x:d.x]; })
        };
    },
    buildChart: function () {
        var width, height, joint,  element, svg, key;

        element = $(this.getDOMNode());

        width = element.width();
        height = element.height();

        this.svg = svg = d3.select(this.getDOMNode()).select('svg.canvas').attr('width', width).attr('height', height);

        this.reqCanvas = svg.select('g.requests');
        this.refCanvas = svg.select('g.refered');

        if (!this.reqCanvas.node()) {
            this.reqCanvas = svg.append('g').classed('requests', true);
        }

        if (!this.refCanvas.node()) {
            this.refCanvas = svg.append('g').classed('refered', true);
        }

        joint = (width/COLS_TOTAL) * (COLS_REQUESTS+COLS_EMPTY/2);
        this.reqCanvas.attr('transform', 'translate(' + joint + ', 15) scale(-1,1)');
        this.refCanvas.attr('transform', 'translate(' + joint + ', 15)');

        // TODO: Enable zoom behaviour
        //svg.call(d3.behavior.zoom().on("zoom", this.zoom));

        // Color scales

        this.colorScales = {};

        // TODO: Work on the color range http://bl.ocks.org/mbostock/11415064
        for (key in this.state.domains) {
            this.colorScales[key] = d3.scale.linear()
                                                    .domain([-1, this.state.domains[key].length])
                                                    // Rainbow
                                                    .range([d3.hsl(270, .75, .35), d3.hsl(70, 1.5, .8)])
                                                    .interpolate(d3Interpolate.interpolateCubehelix);
        }
    },
    draw: function () {
        var requestRoot, referedRoot, node, canvasWidth, width, height, nodes, links;

        node = $(this.getDOMNode());
        canvasWidth = node.width();
        height = node.height();

        // Build Refered root node
        referedRoot = d3.hierarchy({
            id: this.state.root.id,
            name: this.state.root.name,
            type: this.state.root.type,
            children: this.state.root.referer_for
        });

        // Init refered tree
        width = (canvasWidth/COLS_TOTAL) * COLS_RFERERS;
        this.referedTree = this.initTree(width, height);

        nodes = this.referedTree.layout.nodes(referedRoot);
        links = this.referedTree.layout.links(nodes);

        // Draw refered chart
        this.drawTree(this.refCanvas, this.referedTree, referedRoot, nodes, links, 0);

        // Build Requests root node
        requestRoot = d3.hierarchy({
            id: this.state.root.id,
            name: '',
            type: this.state.root.type,
            children: this.state.root.requests
        });

        // Init requests tree
        width = (canvasWidth/COLS_TOTAL) * COLS_REQUESTS;
        this.requestsTree = this.initTree(width, height);

        nodes = this.requestsTree.layout.nodes(requestRoot);
        links = this.requestsTree.layout.links(nodes).map(l => {
            if (l.source.depth==0) {
                l.source.x = referedRoot.x;
                l.source.y = referedRoot.y;
            }

            return l;
        });

        // Draw requests chart
        this.drawTree(this.reqCanvas, this.requestsTree, requestRoot, nodes, links, 1);
    },
    drawTree: function (canvas, tree, root, nodes, links, startDepth) {
        var nodes, links, defaultTransition, enterTransition, exitTransition, d3_node, d3_link;

        // Filter nodes and links based on startDepth
        nodes = nodes.filter(n => n.depth>=startDepth);

        defaultTransition = d3.transition('default').duration(TRANSITION_DURATION);
        enterTransition = d3.transition('enter').duration(TRANSITION_DURATION);
        exitTransition = d3.transition('exit').duration(TRANSITION_DURATION);

        // Draw links

        d3_link = {};
        d3_link.all = canvas.selectAll('.link').data(links, function (d) {
            return d.source.data.id + d.target.data.id;
        });

        d3_link.all.transition(defaultTransition)
            .attr('d', tree.diagonal);

        function endDiagonal (l) {
            var o = {
                x: l.source.x,
                y: l.source.y
            };

            return tree.diagonal({
                source: o,
                target: o
            });
        }

        // Add new links
        d3_link.enter = d3_link.all.enter().insert('path', '.node')
            .attr('id', d => d.source.data.id + d.target.data.id)
            .classed('link', true)
            .style('opacity', 0)
            .attr('d', endDiagonal);

        d3_link.enter.transition(enterTransition)
            .style('opacity', 1)
            .attr('d', tree.diagonal);

        // Delete old links

        d3_link.exit = d3_link.all.exit().transition(exitTransition);

        d3_link.exit
            .attr('d', endDiagonal)
            .style('opacity', 0)
            .remove();

        // Draw nodes

        d3_node = {};
        d3_node.all = canvas.selectAll('.node').data(nodes, function (d) {
            return d.data.id;
        });

        d3_node.all.transition(defaultTransition)
            .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')');

        // Add new nodes
        d3_node.enter = d3_node.all.enter().append('g')
                                            .attr('id', d => d.data.id)
                                            .attr('class', d => 'node ' + d.data.type)
                                            .attr('transform', d => {
                                                d = d.parent || d;
                                                return 'translate(' + d.y + ',' + d.x + ')'
                                            })
                                            .style('opacity', 0);

        function colorScale (n) {
            return this.colorScales[n.data.type](this.state.domains[n.data.type].indexOf(n.data.name));
        };

        d3_node.enter.append('circle')
                .classed('background', true)
                .attr('r', 0);

        d3_node.enter.append('circle')
                .attr('r', 0)
                .style('fill', colorScale.bind(this))
                .style('stroke', colorScale.bind(this))
                .on('mouseover', n => {
                    this.onMouseOverNode(canvas, n);
                })
                .on('mouseleave', n => {
                    this.onMouseLeaveNode(canvas)
                })
                .on('dblclick', n => {
                    d3.event.stopPropagation();

                    if (n.data.type=='fulluri') return;

                    if (n.data.children) {
                        n.data._children = n.data.children;
                        n.data.children = null;
                    } else if (n.data._children) {
                        n.data.children = n.data._children;
                        n.data._children = null;
                    }

                    this.drawTree(canvas, tree, root);
                });

        d3_node.enter.append('text')
                                .attr('transform', n => {
                                    return n.data.type=='refered' || n.data.type=='fulluri' ? '' : 'scale(-1,1)'
                                })
                                .attr('y', d => d.data.type=='referer' || d.data.type=='refered' ? 30 :-20)
                                .text(n => n.data.name);

        d3_node.enter.transition(enterTransition)
            .style('opacity', 1)
            .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')')
            .selectAll('circle')
                .attr('r', 10);

        // Remove old nodes
        d3_node.exit = d3_node.all.exit().transition(exitTransition);

        d3_node.exit
            .attr('transform', n => 'translate(' + n.parent.y + ',' + n.parent.x + ')')
            .style('opacity', 0)
            .remove();

        d3_node.exit.selectAll('circle')
            .attr('r', 0);
    },
    onMouseOverNode: function (canvas, node) {
        // Do nothing on root node
        if (node.data.type=='fulluri') return;

        this.svg.selectAll('.node').classed('blur', n => n.data.type!='fulluri');
        this.svg.selectAll('.link').classed('blur', true);

        function unblurNode(n) {
            var id, parentId;

            // Unblur node
            id = n.data.id;
            this.svg.select('#' + id + '.' + n.data.type).classed('active', true).classed('blur', false);

            if (!n.parent) return;

            // Unblur link to parent
            parentId = n.parent.data.id;
            this.svg.select('#' + parentId + id).classed('active', true).classed('blur', false);
        };

        node.descendants().forEach(unblurNode.bind(this));
        node.ancestors().forEach(unblurNode.bind(this));
    },
    onMouseLeaveNode: function (canvas) {
        this.svg.selectAll('.node,.link').classed('blur', false);
        this.svg.selectAll('.active').classed('active', false);
    },
    zoom() {
        this.reqCanvas.attr('transform', 'translate(' + d3.event.translate + ')scale(-' + d3.event.scale + ',' + d3.event.scale + ')');
        this.refCanvas.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    },
    _onChange: function () {
        var state, nodes;

        state = IncidentProgressionStore.getData();

        if (state.data) {
            state.root = {id: 'fulluri', name: 'Threat', type: 'fulluri', requests: []};

            state.domains = {
                fulluri: {},
                resconttype: {},
                reqmethod: {},
                clientip: {},
                referer: {}
            };
            state.domains.fulluri[state.data.fulluri] = true;

            nodes = {
                fulluri: {},
                resconttype: {},
                reqmethod: {},
                clientip: {},
                referer: {}
            };

            // Create fake root node
            nodes.fulluri['fulluri' + state.data.fulluri] = {children: state.root.requests};

            state.data.requests.forEach((request, idx) => {
                var parentKey;

                parentKey = 'fulluri' + state.data.fulluri;

                // Create nodes
                [
                    {field: 'resconttype', parentField: 'fulluri'},
                    {field: 'reqmethod', parentField: 'resconttype'},
                    {field: 'clientip', parentField: 'reqmethod'},
                    {field: 'referer', parentField: 'clientip'}
                ].forEach(levelData => {
                    var field, parentField, key;

                    field = levelData.field;
                    parentField = levelData.parentField;
                    key = parentKey + field + request[field];

                    if (field=='referer' && (!request.referer || request.referer=='-')) return;

                    if (key in nodes[field]) {
                        // Do nothing
                    }
                    else {
                        nodes[field][key] = {id: field + idx, name: request[field], type: field, children: []};

                        nodes[parentField][parentKey].children.push(nodes[field][key]);

                        state.domains[field][request[field]] = true;
                    }

                    parentKey = key;
                });
            });

            state.domains = {
                fulluri: Object.keys(state.domains.fulluri),
                resconttype: Object.keys(state.domains.resconttype),
                reqmethod: Object.keys(state.domains.reqmethod),
                clientip: Object.keys(state.domains.clientip),
                referer: Object.keys(state.domains.referer),
                refered: []
            };

            state.root.referer_for = state.data.referer_for
                                                        .filter(refered_uri => refered_uri && refered_uri!='-')
                                                        .map((refered_uri, idx) => {
                                                            state.domains.refered.push(refered_uri);

                                                            return {
                                                                id: 'refered' + idx, name: refered_uri, type: 'refered'
                                                            }
                                                        });
        }

        this.setState(state);
    }
});

module.exports = IncidentProgressionPanel;
