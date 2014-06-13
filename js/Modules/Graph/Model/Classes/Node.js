//GraphModel Class

define(['jquery'],function (jquery) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	function Node(data,parent){
		this.parent=parent;
		this.master=parent.master;
		this.module=parent.module;
		
		this.uuid=data.uuid;
		this.name=data.name;
		this.coords=data.coords?{x:data.coords.x,y:data.coords.y}:((data.x&&data.y)?{x:data.x,y:data.y}:undefined);
		this.src={};
		this.tg={};
		this.content=data.content;
		this.parent=undefined;
		
		this.elements={};//these two are made for set paradigm.
		this.elementOf={};
	};
	
	/*
	 * function to find some coordinates for the node
	 */
	
	
	Node.prototype = {
		/*
		 * TODO
		 */
		constructor: Node,
		addTo:function(graph){
			this.parent=graph;
			this.parent.nodes[this.uuid]=this;
			return this;
		},
		read:function(){
			return {
				uuid:this.uuid,
				name:this.name,
				coords:(this.coords.x!==undefined&&this.coords.y!==undefined)?this.coords:undefined
			};
		},
		//this function gets from database links outgoing from this node.
		getLinks:function(){
			var data='data='+encodeURIComponent(JSON.stringify({uuid:this.uuid}));
			var ret=null;
			(function(This){
				jquery.ajax(This.master.database+'db_get_links_of_node.php',{data:data,type:'POST',async:true,success:function(backpack){
					console.log(backpack);
					var showGraph={nodes:[],links:[]};
					for(var uuid in backpack.links){
						showGraph.links.push({uuid:backpack.links[uuid].uuid,
																	src:{uuid:backpack.links[uuid].src.uuid,name:backpack.links[uuid].src.name},
																	tg:{uuid:backpack.links[uuid].tg.uuid,name:backpack.links[uuid].tg.name}});
						This.parent.addLink(backpack.links[uuid]);
					}
					This.module.view.listen("show",showGraph);
				}});
			})(this);
		},
		//this function will get from database links ending in this node.
		getLinked:function(){
			var data='data='+encodeURIComponent(JSON.stringify({uuid:this.uuid}));
			var ret=null;
			(function(This){
				jquery.ajax(This.master.database+'db_get_linked_of_node.php',{data:data,type:'POST',async:true,success:function(backpack){
					console.log(backpack);
					var showGraph={nodes:[],links:[]};
					for(var uuid in backpack.links){
						showGraph.links.push({uuid:backpack.links[uuid].uuid,
																	src:{uuid:backpack.links[uuid].src.uuid,name:backpack.links[uuid].src.name},
																	tg:{uuid:backpack.links[uuid].tg.uuid,name:backpack.links[uuid].tg.name}});
						This.parent.addLink(backpack.links[uuid]);
					}
					This.module.view.listen("show",showGraph);
				}});
			})(this);
		},
		//this will get nodes which are elements of this node as set. Should we create elementLink, or is it enough just to list subsets?
		getElements:function(parameters){//action="show_in_label"
			var data='data='+encodeURIComponent(JSON.stringify({uuid:this.uuid,elements:parameters.elements}));
			console.log(data);
			(function(This){
				jquery.ajax(This.master.database+'db_get_elements_of_set.php',{data:data,type:'POST',async:true,success:function(backpack){
					
					console.log(backpack);//{set:... elements:{}}
					
					if(parameters.action=="show_in_graph"||1){
						console.log(This.parent);
						for(var uuid in backpack.elements){
							var element=This.parent.addNode(backpack.elements[uuid]);
							This.elements[uuid]=element;
							element.elementOf[This.uuid]=This;
						}
					}
					var elementsOfSet={set:backpack.set,elements:backpack.elements,action:"show_in_graph"/*parameters.action*/};

					This.module.view.listen("show_elements_of_set",elementsOfSet);
				}});
			})(this);
		},
		addSet:function(dataSet){
			var set=this.parent.addNode(dataSet);
			this.elementOf[dataSet.uuid]=set;
			set.elements[this.uuid]=this;
		},
		//this should create datanode object from this node and return it
		createDataNode:function(){
			return {uuid:this.uuid,name:this.name,content:this.content,coords:this.coords};
		},
		update:function(dataNode){
			if(dataNode.coords){
				console.log(this.coords);
				console.log(dataNode);
				this.coords={x:dataNode.coords.x, y:dataNode.coords.y};
			}
			if(typeof(dataNode.content)=="string"){
				this.content=dataNode.content;
			}
			if(typeof(dataNode.name)=="string"){
				this.name=dataNode.name;
			}
			return this;
		},
		remove:function(){
			delete this.parent.nodes[this.uuid];
		}
	};
	return Node;
});