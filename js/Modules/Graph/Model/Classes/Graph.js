define(['Modules/Graph/Model/Classes/Node','Modules/Graph/Model/Classes/Link'],function (Node,Link) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	function Graph(parent){
		this.parent=parent;
		this.master=parent.master;
		this.module=parent.module;
		this.nodes={};
		this.links={};
		this.unsaved={nodes:{},links:{}};
		this.offset={x:0,y:0};
		return this;
	}
	
	
	Graph.prototype = {
		/*
		 * TODO
		 */
		constructor: Graph,
		addNode:function(nodeData){
			var node;
			if(nodeData&&nodeData.uuid){
				if(!this.nodes[nodeData.uuid]){
					node=new Node(nodeData,this);
				}else node=this.nodes[nodeData.uuid].update(nodeData);
				node.addTo(this);
			}
			return node;
		},
		addLink:function(linkData){
			var link=new Link(linkData,this);
			return link;
		},
		addElementLink:function(elementData){
			/**elementData={set:nodeData,element:nodeData}**/
			var set=this.addNode(elementData.set);
			var element=this.addNode(elementData.element);
			set.elements[elementData.element.uuid]=element;
			element.elementOf[elementData.set.uuid]=set;
		},
		clearNode:function(){},
		clearLink:function(){},
		clear:function(){//it should clear the whole graph (or based on settings only parts...)
			for(var uuid in this.links){
				this.links[uuid].remove();
			}
			
			for(var uuid in this.nodes){
				this.nodes[uuid].remove();
			}
						for(uuid in this.unsaved.links){
				this.unsaved.links[uuid].remove();
			}
			
			for(var uuid in this.unsaved.nodes){
				this.unsaved.nodes[uuid].remove();
			}
			this.offset={x:0,y:0};
			return this;
		},
		readNode:function(uuid){
			return this.nodes[uuid].read();
		},
		readLink:function(uuid){},
		force:function(stateHierarchy,centre){
			centre=centre||this.countMassCenter();
			for(var i=0;i<10;i++){
				
				
				
				
				var force_strength=0.1;
				
				var centerForce=0.01;
				
				
				var next_graph={};//{uuid:coords,uuid:coords...}
				for (var uuid in this.nodes){
					
					var f=singleForce(this.nodes[uuid],this,{hierarchy:stateHierarchy})
					//var centre=this.countMassCenter();
					var lmnx=centre.x-this.nodes[uuid].coords.x;
					var lmny=centre.y-this.nodes[uuid].coords.y;
// 						var lmn=Math.sqrt(lmnx*lmnx+lmny*lmny);
// 						lmn=lmn<0.1?0.1:lmn;
					f.x+=lmnx/*/lmn/lmn*/*centerForce;
					f.y+=lmny/*/lmn/lmn*/*centerForce;
					//console.log({x:f.x,y:f.y});
					next_graph[uuid]={x:this.nodes[uuid].coords.x+force_strength*f.x,y:this.nodes[uuid].coords.y+force_strength*f.y};
				}
				//console.log(next_graph);
				for(var uuid in this.nodes){
					/*if(next_graph[uuid]) */
					this.nodes[uuid].coords.x=next_graph[uuid].x;
					this.nodes[uuid].coords.y=next_graph[uuid].y;
				//console.log(next_graph[uuid]);
				}
			}
			
			function singleForce(node,graph,settings){
				/**
					* count force of a single particle
					* settings:{repulsion:number,zeroEnergyLength:number,elementZeroEnergyLength:number,
					* hierarchy:number,hierarchyForce:number,springStiffness:number}
					**/
				var settings=settings||{}
				var electrical_repulsion=settings.repulsion||600000;
				var zero_energy_length=settings.zeroEnergyLength||100;
				var element_zero_energy_length=settings.elementZeroEnergyLength||10;
				var stateHierarchy=settings.hierarchy||0;
				var hierarchy_force=(stateHierarchy==1)?(settings.hierarchyForce||100):0;
				var spring_stiffness=settings.springStiffness||-0.5;
				var elementStiffness=settings.elementStiffness||-1;
				
				var f={x:0,y:0};
				
				for(var uuid2 in graph.nodes){
					var node2=graph.nodes[uuid2];
					if(node!=node2){
						var dij=Math.sqrt(Math.pow(node.coords.x-node2.coords.x,2)+
												Math.pow(node.coords.y-node2.coords.y,2))||0.001;
						if(dij!=0){
							f.x+=electrical_repulsion*(node.coords.x-node2.coords.x)/Math.pow(dij,3);
							f.y+=electrical_repulsion*(node.coords.y-node2.coords.y)/Math.pow(dij,3);
						}
					}
				}
				for(var uuidLink in node.src){//for every link connected to node
					var linked=node.src[uuidLink].tg;
					//console.log(node.src[uuidLink].tg);
					var dij=Math.sqrt(Math.pow(node.coords.x-linked.coords.x,2)+
												Math.pow(node.coords.y-linked.coords.y,2));
					if(dij!=0){
						f.x+=spring_stiffness*(dij-zero_energy_length)*(node.coords.x-linked.coords.x)/dij;
						f.y+=spring_stiffness*(dij-zero_energy_length)*(node.coords.y-linked.coords.y)/dij;
					}
					//test of showing hierarchy...
					f.y+=hierarchy_force;
					
				}
				for(var uuidLink in node.tg){
					
					var linked=node.tg[uuidLink].src;
					var dij=Math.sqrt(Math.pow(node.coords.x-linked.coords.x,2)+
												Math.pow(node.coords.y-linked.coords.y,2));
					f.x+=spring_stiffness*(dij-zero_energy_length)*(node.coords.x-linked.coords.x)/dij;
					f.y+=spring_stiffness*(dij-zero_energy_length)*(node.coords.y-linked.coords.y)/dij;
					
					f.y-=hierarchy_force;
					
				}
				for(var uuidLink in node.elements){
					
					var linked=node.elements[uuidLink];
					var dij=Math.sqrt(Math.pow(node.coords.x-linked.coords.x,2)+
												Math.pow(node.coords.y-linked.coords.y,2));
					f.x+=elementStiffness*(dij-element_zero_energy_length)*(node.coords.x-linked.coords.x)/dij;
					f.y+=elementStiffness*(dij-element_zero_energy_length)*(node.coords.y-linked.coords.y)/dij;
					
					f.y-=hierarchy_force;
				}
				for(var uuidLink in node.elementOf){
					
					var linked=node.elementOf[uuidLink];
					var dij=Math.sqrt(Math.pow(node.coords.x-linked.coords.x,2)+
												Math.pow(node.coords.y-linked.coords.y,2));
					f.x+=elementStiffness*(dij-element_zero_energy_length)*(node.coords.x-linked.coords.x)/dij;
					f.y+=elementStiffness*(dij-element_zero_energy_length)*(node.coords.y-linked.coords.y)/dij;
					f.y+=hierarchy_force;
				}
				return f;
			}
			
		},
		countMassCenter:function(){
			var ret={x:0,y:0};
			var countNodes=0;
			for(var uuid in this.nodes){
				var nc=this.nodes[uuid].coords;
				ret.x+=nc.x;
				ret.y+=nc.y;
				countNodes++;
			}
			ret.x/=countNodes;
			ret.y/=countNodes;
			return ret;
		},
		getCoordinates:function(){
			var graphCoords={nodes:[],links:[]};
			for(var uuid in this.nodes){
				graphCoords.nodes.push(this.nodes[uuid].createDataNode());
			}
			return graphCoords;
		},
		updateNode:function(dataNode){
			if(this.nodes[dataNode.uuid]){
				this.nodes[dataNode.uuid].update(dataNode);
			}
		}
	};
	return Graph;
});
