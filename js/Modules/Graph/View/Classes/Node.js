define(['./../GraphSettings','./Label','jquery'],function (GraphSettings,Label,$) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	
	function Template(dom,r){
		var node=$(document.createElementNS(GraphSettings.xmlns.svg,"g")).attr({class:GraphSettings.classes.node}).appendTo(dom);
		
		var circle=$(document.createElementNS(GraphSettings.xmlns.svg,"circle")).attr({cx:0,cy:0,r:r}).appendTo(node);

		var toolsOnmouseover=$(document.createElementNS(GraphSettings.xmlns.svg,"g")).attr({class:'tools_hidden'}).prependTo(node);
		var toolsCircle=$(document.createElementNS(GraphSettings.xmlns.svg,"circle"))
		.attr({cx:0,cy:0,r:2*r,class:'tools_circle'}).appendTo(toolsOnmouseover);
		var addElementButton=$(document.createElementNS(GraphSettings.xmlns.svg,"circle"))
		.attr({cx:0,cy:-2*r,r:r/3.0*2,class:'add_element_button'}).appendTo(toolsOnmouseover);
		
		node.on('mouseover',function(){toolsOnmouseover.attr({class:'tools_visible'});});
		node.on('mouseout',function(){toolsOnmouseover.attr({class:'tools_hidden'});});
		
//		 var label=document.createElementNS(GraphSettings.xmlns.xhtml,'div');
		
		return {
			main:node,
			center:circle,
			tools:{addElementButton:addElementButton},
			defaultAttributes:{main:{},center:{fill:'',stroke:''}}//default attributes of dom elements
		};
	}
	
	/*NODE CLASS
	 * 
	 * TODO
	 * 
	 * ***properties
	 * parent: Graph object which contains this node
	 * graph: Graph object which contains this node
	 * 
	 * ***methods
	 * Node center() will put the node in center of the div
	 * 
	 * addElement() TODO add an element to a node.
	 * removeElement() TODO
	 * highlight(bool); to highlight or unhighlight node/link/hyperlink	TODO
	 * select(bool);
	 * 
	 */
	
	
	function Node(settings,data,parent,dom){//settings{r:10};
		this.parent=parent;
		this.master=parent.master;
		this.module=parent.module;
		
		settings=settings||{};
		settings.r=settings.r||10;
		
		this.dom=Template(dom,settings.r);
		this.graph=parent;
		
		this.label=undefined;
		this.parent=parent;
		this.srclinks={};
		this.tglinks={};
		this.coords={x:0,y:0};
		this.name=data.name;
		this.uuid=data.uuid;
		
		this.addListeners();
		this.newPosition(data.coords);
	}
	
	
	Node.prototype = {
		
		constructor: Node,
			//this function will remove Node and Label from view
		remove: function(){
			this.dom.main.remove();
			//remove from view
			if(this.label){
				this.label.remove();
			}
			//remove from graphData
			delete this.parent.nodes[this.uuid];
		},
		addLabel:function(dataNode){
			var dataNode=dataNode||{name:this.name,uuid:this.uuid};
			var label=new Label(this).name(dataNode);
			if(this.label){
				this.label.remove();
			}
			
			this.label=label;
			
			label.addTo(this);/*
			this.label.newPosition(this);*/
			//this.parent.dom.html.label.appendChild(label.main);
		},
		removeLabel:function(){
			if(this.label){
				this.label.remove();
			}
		},
		set:function(dataNode){
			//this.newPosition(dataNode.coords);
			this.uuid=dataNode.uuid;
			this.name=dataNode.name;
			
			return this;
		},
		addListeners:function(){
			var GraphController=this.module.controller;
			(function(This){
				
				This.dom.center.on('mousedown',function(e){
					GraphController.listen('mousedown_node',{uuid:This.uuid});
				});
				
				This.dom.center.on('mouseup',function(e){
					if(This.label){
						GraphController.listen('mouseup_node',{uuid:This.uuid,hide:This.label.isActive});
					}else{
						GraphController.listen('mouseup_node',{uuid:This.uuid,hide:null});
					}
				});
				
				/**highlighting label if mouse is over the node**/
				This.dom.center.on('mouseover',function(){
					if(This.label){
						This.label.highlight(true);
					}
				});
				
				This.dom.center.on('mouseout',function(){
					if(This.label){
						This.label.highlight(false);
					}
				});
				
				This.dom.tools.addElementButton.on('mouseup',function(e){
					GraphController.listen('mouseup_node_tools_addElementButton',{uuid:This.uuid});
				});
			})(this);
			return this;
		},
		newPosition:function(coords){
			this.dom.main.attr({'transform':'translate('+coords.x+','+coords.y+')'});
			
			this.coords.x=coords.x;
			this.coords.y=coords.y;
			if(this.label){
				this.label.newPosition(this);
			}
			//update position of all the connected links etc...
			for(var uuid in this.srclinks){
				this.srclinks[uuid].newPosition();
			}
			for(var uuid in this.tglinks){
				this.tglinks[uuid].newPosition();
			}
			return this;
		},
		center:function(){
			/**will move all the graph to centre around this node, return value: Node*/
			
			//we want node to appear in screen centre
			//new graph position should be (after changing all coordinates to svg coordinates)
			console.log(this);
			console.log(this.graph);
			var svgCoordsOfCenter=this.graph.getCenterSVG();
			
			var oldSvgCoordsOfNode=this.graph.graphToSvgCoords({x:this.coords.x,y:this.coords.y});
			//centering
			this.graph.newPosition({x:svgCoordsOfCenter.x-oldSvgCoordsOfNode.x, y:svgCoordsOfCenter.y-oldSvgCoordsOfNode.y});
			
			return this;
		},
		select:function(on){//on: select or unselect? default=true.
		/**this function will select or unselect the node from graph.selection
		 * and make all the other necessary actions to select node
		 **/
			var on=(on===false)?false:true;
			if(on){
				this.graph.selection.nodes[this.uuid]=this;
				this.highlight(true,{fill:'blue',stroke:'red'});
				this.graph.selection.master.addNode(this);
			}
			else{
				delete this.graph.selection.nodes[this.uuid];
				this.highlight(false);
			}
		},
		highlight:function(bOn,attr){
			var bOn=(bOn===false)?false:true;
			var attr=attr||{fill:'green',stroke:'green'};
			if(bOn){
				//console.log(this.dom.center);
				this.dom.center.css(attr);
				this.dom.highlightStack=this.dom.highlightStack||[];
				if(this.dom.lastHighlight){this.dom.highlightStack.push(this.dom.lastHighlight)}
				this.dom.lastHighlight=attr;
			}
			else{
				if(this.dom.highlightStack.length){
					this.dom.lastHighlight=this.dom.highlightStack.pop();
					
					this.dom.center.css(this.dom.lastHighlight);
				}
				else{
					this.dom.lastHighlight=null;
					this.dom.center.css(this.dom.defaultAttributes.center);
				};
			}
		}
	};
	
	
	return Node;
});