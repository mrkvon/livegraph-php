define(['jquery'],function($){
	
	function Template(htmlDom){
		console.log(htmlDom);
		var main=$(document.createElement('div'))
		.css({'pointer-events':'visible','background-color':'white',position:'absolute',width:'100%','max-height':'100%','overflow':'auto'})
		.appendTo(htmlDom);
		var nodes=$(document.createElement('ul')).attr({id:'selection-list-nodes'}).appendTo(main);
		var pathButton=$(document.createElement('button'))
		.css({display:'none'})
		.attr({type:'button',id:'selection-button-path'}).text('show shortest path').appendTo(main);
		
		console.log(main);
		console.log(nodes);
		
		return {
			main:main,
			nodes:nodes,
			buttons:{path:pathButton}
		};
	}
	
	/**
	 * docs
	 * 
	 ***** class Selection() ***********
	 * 
	 * class for handling multiple (selected) nodes
	 * 
	 *** properties
	 * dom
	 * graph
	 * 
	 *** methods
	 * 
	 * 
	 **/
	
	function Selection(htmlDom,master){
		this.dom=Template(htmlDom);
		this.master=master;
		this.nodes={};
		
		//plug into graph
		console.log(master.graph.view.graph);
		master.graph.view.graph.selection.master=this;
		
		
		(function(This){
			
			/**mouseup show shortest path button**/
			This.dom.buttons.path.on('mouseup',function(){
				var nodes=[];
				for(uuid in This.nodes){
					nodes.push(uuid);
				}
				This.master.graph.controller.listen({main:'selection',sub:'shortest-path'},{nodes:nodes});
			});
			
		})(this);
	}
	
	Selection.prototype={
		constructor:Selection,
		select:function(selectObjects){//selectObjects={nodes:{},links:{},...}
			this.clearSelection();
			for(var uuid in selectObjects.nodes){
				this.addNode(selectObjects.nodes[uuid])
			}
		},
		clearSelection:function(){
			for(uuid in this.nodes){
				delete this.nodes[uuid];
			}
			this.dom.nodes.empty();
			this.dom.buttons.path.css({display:'none'})
		},
		addNode:function(node){
			this.nodes[node.uuid]={name:node.name,uuid:node.uuid};
			$(document.createElement('li')).text(node.name).appendTo(this.dom.nodes);
			
			var count = 0;
			for (k in this.nodes) if (this.nodes.hasOwnProperty(k)) count++;
			
			if(count==2) this.dom.buttons.path.css({display:''}); else this.dom.buttons.path.css({display:'none'});
		}
	};
	
	
	
	
	
	
	
	
	return Selection;
});