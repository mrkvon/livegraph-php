/*
 * GraphModel class
 * 
 */

define([],function () {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	function Link(data,graph){
// 		console.log(data);
		this.uuid=data.uuid;
		
		this.srcUuid=data.src.uuid;
		this.tgUuid=data.tg.uuid;
		
		this.parent=graph;
		this.parent.links[this.uuid]=this;
		
		if(!this.parent.nodes[data.src.uuid]){
			this.parent.addNode(data.src);
		}
		
		this.src=this.parent.nodes[data.src.uuid];
		this.parent.nodes[data.src.uuid].src[this.uuid]=this;

		if(!this.parent.nodes[data.tg.uuid]){
			this.parent.addNode(data.tg);
		}
		
		this.tg=this.parent.nodes[data.tg.uuid];
		this.parent.nodes[data.tg.uuid].tg[this.uuid]=this;
	}
	
	
	Link.prototype = {
		/*
		 * TODO
		 */
		constructor: Link,
		addTo:function(graph){
			
		},
		remove:function(){
			delete this.src.src[this.uuid];
			delete this.tg.tg[this.uuid];
			delete this.parent.links[this.uuid];
			//this=undefined;
		}
	};
	return Link;
});

	
	
	