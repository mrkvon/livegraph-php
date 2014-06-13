define(['Modules/Graph/View/GraphViewTools','Modules/Graph/View/Classes/Node','Modules/Graph/View/Classes/Link','./GhostLink','Modules/Graph/View/GraphSettings','jquery'],
			 function (GraphViewTools,Node,Link,GhostLink,GraphSettings,$) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	* 
	* TODO
	* 
	* 
	*/
	
	function Template(domElement){
		var main=$(document.createElement('div')).attr({id:'graph_wrapper'});
		var svg=$(document.createElementNS(GraphSettings.xmlns.svg,'svg')).attr({class:GraphSettings.classes.graph}).appendTo(main);
		var defs=$(document.createElementNS(GraphSettings.xmlns.svg,'defs')).appendTo(svg);
		var marker=$(document.createElementNS(GraphSettings.xmlns.svg,'marker'))
		.attr({'id':'myMarker','viewBox':'0 0 10 10','refX':'15','refY':'5',
					'markerUnits':'strokeWidth','orient':'auto','markerWidth':'8','markerHeight':'8'})
		.appendTo(defs);
		var polyline=$(document.createElementNS(GraphSettings.xmlns.svg,'polyline'))
		.attr({'points':'0,0 10,5 0,10 1,5'})
		.appendTo(marker);
		
//		 polyline.setAttribute('fill','black');
		
		var background=$(document.createElementNS(GraphSettings.xmlns.svg,'rect'))
		.attr({'height':'100%','width':'100%',class:GraphSettings.classes.background}).appendTo(svg);
		
		var all=$(document.createElementNS(GraphSettings.xmlns.svg,'g')).appendTo(svg);
		var links=$(document.createElementNS(GraphSettings.xmlns.svg,'g')).appendTo(all);
		var nodes=$(document.createElementNS(GraphSettings.xmlns.svg,'g')).appendTo(all);
		
		var selection=$(document.createElementNS(GraphSettings.xmlns.svg,'rect'))
		.attr({class:'selection-square',stroke:'#66f',fill:'#66f','fill-opacity':0.2});
		
		var html=$(document.createElement('div')).attr({class:GraphSettings.classes.allTextContainer})
		.css({left:'0px',top:'0px'}).appendTo(main);
		var info=$(document.createElement('div')).attr({class:GraphSettings.classes.infoContainer}).appendTo(html);
		var label=$(document.createElement('div')).attr({class:GraphSettings.classes.labelContainer}).appendTo(html);
		
		main.appendTo(domElement);

		return {
			main:main,
			svg:{main:svg,all:all,nodes:nodes,links:links,background:background,selection:selection},
			html:{main:html,info:info,label:label}
		};
	}
	
	
	function Graph(domElement,parent){
		this.parent=parent;
		this.module=parent.module;
		this.master=parent.master;
		
		
		this.dom=Template(domElement);
		this.nodes={};
		this.links={};
		this.coords={x:0,y:0};
		console.log(this);
		this.tools=new GraphViewTools(this.dom.main,this);
		this.selection={nodes:{},links:{},master:this.master.selection};
		//this.selection.master=this.master
		
		var GraphController=this.module.controller;
		
		/**event listeners**/
		(function(graph){
			
			graph.dom.svg.background.on('mousedown',function(e){
					graph.module.controller.listen({main:'graph',sub:'mousedown_background'},
																	{
																		coords:graph.clientToSvgCoords({x:e.clientX,y:e.clientY}),
																		graphCoords:graph.clientToGraphCoords({x:e.clientX,y:e.clientY})
																	});
			});
			
			graph.dom.svg.background.on('mouseup',function(e){
					graph.module.controller.listen({main:'graph',sub:'mouseup_background'},{coords:graph.clientToSvgCoords({x:e.clientX,y:e.clientY})});
			});
			
			graph.dom.svg.background.on('dblclick',function(e){
				e.stopPropagation();
// 				graph.dom.main.onmousemove=null;
				var graphCoordsOfEvent=graph.clientToGraphCoords({x:e.clientX,y:e.clientY});
				
				var nodeToSave={name:'',content:'',coords:{x:graphCoordsOfEvent.x,y:graphCoordsOfEvent.y}};
				/**on background dblclick, send this info to controller (save new node at the moment...)**/
				graph.module.controller.listen({main:'graph',sub:'background-dblclick'},{nodes:[nodeToSave],links:[]});
				return false;
			});
			
			function controllerScroll(e) {
				e.preventDefault();
// 				console.log(();
// 				console.log(graph.clientToGraphCoords());
				GraphController.listen({main:'graph',sub:'wheel-svg'},{coords:/*graph.clientToGraphCoords(*/{x:e.originalEvent.clientX,y:e.originalEvent.clientY}/*)*/,direction:(e.originalEvent.deltaY>0)?'down':'up'});
			}
			
			graph.dom.svg.main.on('wheel',$.throttle(100, true, controllerScroll));
			
		})(this);
	}
	
	
	
	
	/**docs****
	 * 
	 * class Graph
	 * 
	 *** properties
	 * dom {...}
	 * nodes {uuid:Node, uuid:Node,...}
	 * links {uuid:Node, uuid:Node,...}
	 * 
	 * 
	 * 
	 *** methods
	 *
	 * getCenterSVG();
	 * 
	 * prototypes used with Graph
	 * addNode
	 * addLink
	 * clear * restarts graph - all nodes cleared, all links cleared
	 * node(id) * return node by given id or exception? null?
	 * link(id)
	 ***/
	
	
	Graph.prototype = {
		/*
		 * TODO
		 */
		constructor: Graph,
		addNode: function(nodeData,settings){
			
			/**settings: should we show label? should the label be in editing mode?**/
			
			/**we use random coordinates, therefore we don't need coordinates in database**/
			nodeData.coords=nodeData.coords||this.getRandomGraphCoords();
			var node;
			var update=false;
			if(this.nodes[nodeData.uuid]){
				node=this.nodes[nodeData.uuid];
				node.set(nodeData);
				update=true;
			} else {
				node=new Node({},nodeData,this,this.dom.svg.nodes);
				this.module.model.listen('move_node',{uuid:nodeData.uuid,coords:nodeData.coords});
			}
			
			this.nodes[node.uuid]=node;
			if(update){
				//what is a difference?
				console.log('update');
			}
			
			node.addLabel(nodeData);
			
// 			this.master.updateHistory();
			
			return node;
		},
		addLink: function(linkData,settings){
			/**settings:...**/
			settings=settings||{};
			var link=new Link(settings).set(linkData).add(linkData,this).newPosition();
			
			/**if src and tg nodes have active labels, we put object link to the labels.**/
			var srcNode=this.node(linkData.src.uuid);
			if(srcNode&&srcNode.label&&srcNode.label.isActive){
				srcNode.label.addLink(linkData);
			}
			
// 			this.master.updateHistory();
			
			return link;
		},
		addElementLink:function(data){
			var link={uuid:data.set.uuid+data.element.uuid,src:data.set,tg:data.element};
			this.addLink(link,{color:'red'});
		},
		addGhostLink:function(ghostLinkData){
			console.log(ghostLinkData);
			var ghostLink=new GhostLink(this, this.dom.svg.links, ghostLinkData);
			return ghostLink;
		},
		clear:function(){
			for(var uuid in this.links){
				this.links[uuid].remove();
			}
			for(var uuid in this.nodes){
				this.nodes[uuid].remove();
			}
			this.master.updateHistory();
		},
		clientToGraphCoords: function(clientCoords){//screenCoords={x:clientX,y:clientY}, return {x:,y:}
		
		/**what system of coordinates is graph coordinates?*/
		
			var svg=this.dom.svg.main.get(0);
			var graphAll=this.dom.svg.all.get(0);
			var pt = svg.createSVGPoint();
			pt.x = clientCoords.x;
			pt.y = clientCoords.y;
			var globalPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
			var globalToLocal = graphAll.getTransformToElement(svg).inverse();
			var inObjectSpace = globalPoint.matrixTransform(globalToLocal);
			return({x:parseInt(inObjectSpace.x),y:parseInt(inObjectSpace.y)});
		},
		clientToSvgCoords: function(clientCoords){//screenCoords={x:clientX,y:clientY}, return {x:,y:}
			var svg=this.dom.svg.main.get(0);
			var pt = svg.createSVGPoint();
			pt.x = clientCoords.x;
			pt.y = clientCoords.y;
			var globalPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
//			 var globalToLocal = svg.getTransformToElement(svg).inverse();
			var inObjectSpace = globalPoint/*.matrixTransform(globalToLocal)*/;
			return({x:parseInt(inObjectSpace.x),y:parseInt(inObjectSpace.y)});
		},/*
		drawSelection:function(coords1,coords2){
			var x1,x2,y1,y2;
			if(coords1.x>coords2.x){x1=coords1.x;x2=coords2.x;}else{x1=coords2.x;x2=coords1.x;}
			if(coords1.y>coords2.y){y1=coords1.y;y2=coords2.y;}else{y1=coords2.y;y2=coords1.y;}
			
			this.dom.svg.main.append(document.createElementNS());
		},
		*/
		getCenterClient:function(){
			var offset=this.dom.main.offset();
			var width=this.dom.main.width();
			var height=this.dom.main.height();
			var clientCenter={x:offset.left+width/2,y:offset.top+height/2};
			
			return clientCenter;
		},
		getCenterGraph:function(){
			return this.clientToGraphCoords(this.getCenterClient());
		},
		getCenterSVG:function(){
			
			//this will return the center of graph visible screen in svg coordinates
			
			var graphMainOffset=$(this.dom.main).offset();
			var graphMainWidth=$(this.dom.main).width();
			var graphMainHeight=$(this.dom.main).height();
			var clientCenter=this.clientToSvgCoords({x:graphMainOffset.left+graphMainWidth/2,y:graphMainOffset.top+graphMainHeight/2}); //this is window centre in svg coordinates.
			clientCenter.x+=this.coords.x;
			clientCenter.y+=this.coords.y;
			
			return clientCenter;
		},
		getRandomGraphCoords:function(){
			var graphMainOffset=$(this.dom.main).offset();
			var graphMainWidth=$(this.dom.main).width();
			var graphMainHeight=$(this.dom.main).height();
			
			var clientRandom=this.clientToGraphCoords({x:graphMainOffset.left+graphMainWidth*Math.random(),y:graphMainOffset.top+graphMainHeight*Math.random()});
			
			return clientRandom;
		},
		graphToSvgCoords: function(graphCoords){//screenCoords={x:clientX,y:clientY}, return {x:,y:}
			var svg=this.dom.svg.main.get(0);
			var graphAll=this.dom.svg.all.get(0);
			var pt = svg.createSVGPoint();
			pt.x = graphCoords.x;
			pt.y = graphCoords.y;
			var graphToSvg = graphAll.getTransformToElement(svg);
			var svgCoords = pt.matrixTransform(graphToSvg);
			return({x:parseInt(svgCoords.x),y:parseInt(svgCoords.y)});
		},
		removeLabels:function(){
			for(var uuid in this.nodes){
				this.nodes[uuid].removeLabel();
			}
		},
		addLabels:function(){
			console.log("implement adding labels");
			
			for(var uuid in this.nodes){
				this.nodes[uuid].addLabel();
			}
		},
		newPosition:function(coords){
			console.log(coords);
//			 console.log(parameters);
			this.coords.x=coords.x;
			this.coords.y=coords.y;
			
//			 this.dom.svg.all.setAttribute('transform','translate('+coords.x+','+coords.y+')');
			
			
			var graphAll=this.dom.svg.all.get(0);
			var graph=this.dom.svg.main.get(0);
			
			var targetTransformation=graphAll.getTransformToElement(graph);
			
			var pt=graph.createSVGPoint();
//			 pt.x=coords.x;
//			 pt.y=coords.y;
			var ptTrans=pt.matrixTransform((graph.getScreenCTM().multiply(graphAll.getTransformToElement(graph))).inverse());
			//console.log(ptTrans);
			
			var newT=targetTransformation;/*.translate(ptTrans.x,ptTrans.y).scale(ratio).translate(-ptTrans.x,-ptTrans.y);*/
			//console.log(newT);
			$(graphAll).attr({'transform':'matrix('+newT.a+','+newT.b+','+newT.c+','+newT.d+','+coords.x/*newT.e*/+','+coords.y/*newT.f*/+')'});
//			 
			var nodes=this.nodes;
			
			for(var uuid in nodes)
			{
				var node=nodes[uuid];
				node.newPosition(node.coords);
			}
		},
		node:function(id){
			/**this function should return Node object from Graph based on id. If node non-existent, it will return null**/
			return this.nodes[id]||null;
		},
		selectWithSquare:function(set){ //set:[num,num,num,num] or false.
		/*
		 * select nodes. the coordinates are [x1,y1,x2,y2] - squares of the selection.
		 * select all nodes that are within this square, or unselect all.
		 */
			set=set||false;
			this.selectionClear();
			if($.isArray(set)&&set.length==4){
				/**make the selection**/
				var x1,x2,y1,y2
				if(set[0]<set[2]){x1=set[0];x2=set[2];}else{x1=set[2];x2=set[0];}
				if(set[1]<set[3]){y1=set[1];y2=set[3];}else{y1=set[3];y2=set[1];}
				for(var uuid in this.nodes){
					var node=this.nodes[uuid];
					//console.log(node.coords.x<x2 && node.coords.x>x1 && node.coords.y<y2 && node.coords.y>y1);
					if(node.coords.x<x2 && node.coords.x>x1 && node.coords.y<y2 && node.coords.y>y1){//is the node inside the square?
						node.select(true); //select the node
					}
				}
			}
			else if(set===false){
				this.selectionClear();
			}
		},
		selectionClear:function(){
			this.selection.master.clearSelection();
			for(var uuid in this.selection.nodes){
				this.selection.nodes[uuid].select(false);
			}
			for(var uuid in this.selection.links){
				this.selection.links[uuid].select(false);
			}
		},
		selectionSquare:function(set,set2){
			/*
			 * this function draws rectangle as user drags for selection
			 * Boolean set = false => the square will disappear
			 * Array set => [x1,y1,x2,y2] the sides of square in graph coordinates
			 * Object set, Object set2 => set {x1:number,y1:number}, set2 {x2:number, y2:number} two corners of rectangle.
			 */
			set=set||false;
			set2=set2||false;
			if(typeof set=='boolean'&&!set){ //hide selection
				this.dom.svg.selection.remove();
			}
			else if($.isArray(set)&&set.length==4){ //[x1,y1,x2,y2]
				makeSquare(set[0],set[1],set[2],set[3],this);
			}
			else if(typeof set=='object'&&typeof set2=='object'){ //{x1,y1},{x2,y2}
				makeSquare(set.x,set.y,set2.x,set2.y,this);
			}
			function makeSquare(xx1,yy1,xx2,yy2,graph){
				var x1,x2,y1,y2
				if(xx1<xx2){x1=xx1;x2=xx2;}else{x1=xx2;x2=xx1;}
				if(yy1<yy2){y1=yy1;y2=yy2;}else{y1=yy2;y2=yy1;}
				graph.dom.svg.selection.attr({x:x1,y:y1,width:x2-x1,height:y2-y1}).appendTo(graph.dom.svg.all);
			}
		},/*
		updateLabelPositions:function(){
			
		}*/
		zoom:function(parameters){
			/**void zoom(object{center:{x:clientX,y:clientY},ratio:number})**/
			
			console.log(parameters);
			var parameters=parameters||{};
			var coords=parameters.center||this.getCenterClient();
			var ratio=parameters.ratio||parameters.zoom||1;
			var graphAll=this.dom.svg.all.get(0);
			var graph=this.dom.svg.main.get(0);
			
			var targetTransformation=graphAll.getTransformToElement(graph);
			
			var pt=graph.createSVGPoint();
			pt.x=coords.x;
			pt.y=coords.y;
			var ptTrans=pt.matrixTransform((graph.getScreenCTM().multiply(graphAll.getTransformToElement(graph))).inverse());
			//console.log(ptTrans);
			
			var newT=targetTransformation.translate(ptTrans.x,ptTrans.y).scale(ratio).translate(-ptTrans.x,-ptTrans.y);
			//console.log(newT);
			
			
			/**unsuccessful attempt of zoom animation**/
// 			$(graphAll).css({aaaa:1,bbbb:1,cccc:1,dddd:1,eeee:1,ffff:1}).animate({
// 				aaaa: newT.a,
// 				bbbb: newT.b,
// 				cccc: newT.c,
// 				dddd: newT.d,
// 				eeee: newT.e,
// 				ffff: newT.f
// 			},
//       {duration: 1000,
//        step: function(a,b,c,d,e,f){
//            $(this).attr({'transform':'matrix('+a+','+b+','+c+','+d+','+e+','+f+')'});
//          }
//        });
			
			
			$(graphAll).attr({'transform':'matrix('+newT.a+','+newT.b+','+newT.c+','+newT.d+','+newT.e+','+newT.f+')'});
			
			var graph=this;
			function updateLabels(){
				console.log('updating');
				var nodes=graph.nodes;
				
				for(var uuid in nodes)
				{
					var node=nodes[uuid];
					node.newPosition(node.coords);
				}
			}
			updateLabels();
// 			(function(){$.debounce(200, updateLabels);})();
			
			this.coords.x=newT.e;
			this.coords.y=newT.f;
		}
	};
	
	return Graph;
});