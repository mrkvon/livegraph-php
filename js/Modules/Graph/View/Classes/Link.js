define(["./../GraphSettings","jquery"],function(GraphSettings,$){
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	function Template(domUnused,settings){
		var settings=settings||{};
		
		
		var defaultAttributes={line:{fill:'',stroke:''}};
		if(settings.color){
			defaultAttributes.line.stroke=settings.color;
		}
		
		var link=$(document.createElementNS(GraphSettings.xmlns.svg,"g"))
		.attr({class:GraphSettings.classes.link});
		
		var line=$(document.createElementNS(GraphSettings.xmlns.svg,"line")).appendTo(link)
		.attr({'marker-end':"url(#myMarker)"}).css(defaultAttributes.line);
		
//		 var centre=$(document.createElementNS(GraphSettings.xmlns.svg,"g")).appendTo(link)
//		 .append($(document.createElementNS(GraphSettings.xmlns.svg,"circle")).attr({r:6,fill:"blue"}));
//		 
//		 var menu=$(document.createElementNS(GraphSettings.xmlns.svg,"g")).appendTo(centre).attr({visibility:"hidden"});
//		 
//		 var deleteButton=$(document.createElementNS(GraphSettings.xmlns.svg,"circle"))
//		 .attr({r:5,fill:"red",cx:10,cy:0})
//		 .appendTo(menu);
		
		return {
			main:link,
			line:line,
			defaultAttributes:defaultAttributes
			 /*,
			centre:centre,
			menu:menu,
			deleteButton:deleteButton*/
		};
	}
	
	
	
	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	function Link(settings){
		settings=settings||{};
		this.dom=Template(null,settings);
		
		this.uuid='';
		
		//this is just to change color of link. (because of elements)
		//these two should contain pointers to Node objects of src and tg.
		this.src=undefined;
		this.tg=undefined;
		this.parent=undefined;
		
	}
	
	
	Link.prototype = {
		
		constructor: Link,
		//this function deals with connecting Link to DOM
		//this adding function does not work well, because it calls dom objects of graph. it should not. or should it?
		add:function(dataLink,graph){
			var update=false;
			//console.log(graph.links[dataLink.uuid]);
			if(graph.links[dataLink.uuid]){
				graph.links[dataLink.uuid].remove();
				update=true;
			}
			
			if(!graph.nodes[dataLink.src.uuid]){
				graph.addNode(dataLink.src);
			}
			
			if(!graph.nodes[dataLink.tg.uuid]){
				graph.addNode(dataLink.tg);
			}
			this.parent=graph;
			this.src=graph.nodes[dataLink.src.uuid];
			this.tg=graph.nodes[dataLink.tg.uuid];
			
			//add pointer to this link to src and tg Nodes.
			graph.nodes[dataLink.src.uuid].srclinks[dataLink.uuid]=this;
			graph.nodes[dataLink.tg.uuid].tglinks[dataLink.uuid]=this;
			
			this.dom.main.appendTo(graph.dom.svg.links);
			this.newPosition();
			
			graph.links[dataLink.uuid]=this;
			
			return this;
		},
		highlight:function(bOn,attr){
			var bOn=(bOn===false)?false:true;
			var attr=attr||{fill:'green',stroke:'green'};
			if(bOn){
				//console.log(this.dom.center);
				this.dom.line.css(attr);
			}
			else{
				this.dom.line.css(this.dom.defaultAttributes.line);
			}
		},
		//this function should recount Link position (and use current position of the src and tg nodes)
		newPosition:function(){
			
			//??????????to be less system wasteful:remove from DOM and when finished append back.

			var src=this.src; //src node
			var tg=this.tg; //tg node
			
			this.dom.line.attr({x1:src.coords.x,y1:src.coords.y,x2:tg.coords.x,y2:tg.coords.y});
//			 this.dom.centre.attr({transform:"translate("+(src.coords.x+tg.coords.x)/2.0+","+(src.coords.y+tg.coords.y)/2.0+")"})
			
			return this;
		},
		//this is a function for Link autodestruction
		remove:function(){
			if(this.src&&this.src.label&&this.src.label.links&&this.src.label.links[this.uuid]){
				//console.log('removing LabelLinkObject');
				this.src.label.links[this.uuid].remove();
			}
			
			//remove the object from DOM
			if(this.dom.main){
				this.dom.main.remove();
			}
			delete this.parent.links[this.uuid];
		},
		set:function(dataLink){//dataLink={src:{uuid:"",coords:{x:num,y:num}},tg:{uuid:"",coords:{}}}
			//this.dom.line.attr({x1:dataLink.src.coords.x,y1:dataLink.src.coords.y,x2:dataLink.tg.coords.x,y2:dataLink.tg.coords.y});
			this.uuid=dataLink.uuid;
			return this;
		}
		
	};
	
	
	return Link;
});