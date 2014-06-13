//create buttons of graph window...


define(['./GraphSettings','./GraphViewTools/Template'/*,'./GraphViewTools/Automation'*/,'jquery'],
function(GraphSettings,Template/*,Automation*/,$){
	
	function ToolsButton(domparent,settings){
		var settings=settings||{};
		settings.style=settings.style||{};
		settings.style.r=settings.style.r||15;
		settings.style.opacity=settings.style.opacity||0.6;
		settings.style.stroke=settings.style.stroke||"black";
		settings.style.fill=settings.style.fill||"gray";
		settings.position=settings.position||{x:0,y:0};
		
		this.dom={};
		
		//creating DOM elements of button
		this.dom.main=$(document.createElementNS(GraphSettings.xmlns.svg,'g')).appendTo(domparent)
		.css({position:"absolute",width:"100%",height:"100%"})
		.attr("transform","translate("+settings.position.x+","+settings.position.y+")");
		this.dom.button=$(document.createElementNS(GraphSettings.xmlns.svg,'circle')).appendTo(this.dom.main)
		.attr(settings.style);
		if(settings.background){
			this.dom.button.attr("fill","url(#"+settings.background+")");
		}
		//		 for(var property in settings.style){
//			 this.dom.button.setAttribute(property,settings.style[property]);
//		 }
		//set position of button
		

		return this;
	}
	
	ToolsButton.prototype.set=function(bValue){
		this.dom.button.attr("opacity",bValue?1:0.6);
	}
	
	//button with more than two states...
	function ToolsStateButton(domparent,settings,states){
		var settings=settings||{};
		settings.style=settings.style||{};
		settings.style.r=settings.style.r||15;
		//settings.style.opacity=settings.style.opacity||0.6;
		settings.style.stroke=settings.style.stroke||"black";
		settings.style.fill=settings.style.fill||"gray";
		settings.position=settings.position||{x:0,y:0};
		
		this.dom={};
		
		this.dom.states={};
		//this.dom.parent=domparent;
		
		this.dom.main=$(document.createElementNS(GraphSettings.xmlns.svg,'g'))/*.appendTo(domparent)*/
			.css({position:"absolute",width:"100%",height:"100%"})
			.attr("transform","translate("+settings.position.x+","+settings.position.y+")").appendTo(domparent);
		
		for(var state in states){
			
			var State=states[state];
			this.dom.states[state]=$(document.createElementNS(GraphSettings.xmlns.svg,'circle'))
			.attr(State.style);
			if(State.background) this.dom.states[state].attr("fill","url(#"+State.background+")");
			
			
//			 this.dom.states[state]=
		}
		
		this.dom.states[0].appendTo(this.dom.main);
		
		return this;
	}
	
	ToolsStateButton.prototype.set=function(state){//value is number or string or whatever...
//		 console.log(state);
//		 console.log(this.dom.states[state]);
		for(var s in this.dom.states){
			this.dom.states[s].remove();
		}
// //		 alert("");
		this.dom.states[state].appendTo(this.dom.main);
	}
	
	function GraphViewTools(DOMElement,parent){
		this.parent=parent;
		this.master=parent.master;
		this.module=parent.module;
		
		this.buttons={};
		this.automation;
		this.dom=Template(DOMElement);
		
		//$(document.createElement())
		
		this.dom.svg=$(document.createElementNS(GraphSettings.xmlns.svg,'svg')).appendTo(this.dom.main)
		.attr({version:"1.1",baseProfile:"full",xmlns:"http://www.w3.org/2000/svg",
					"xmlns:xlink":"http://www.w3.org/1999/xlink","xmlns:ev":"http://www.w3.org/2001/xml-events"});
		//		 this.dom.svg.setAttribute("class",GraphSettings.classes.graph);
		var defs=$(document.createElementNS(GraphSettings.xmlns.svg,'defs')).appendTo(this.dom.svg);
		
		//edit icon
		var editPattern=$(document.createElementNS(GraphSettings.xmlns.svg,'pattern')).appendTo(defs)
		.attr({id:"edit_icon",x:0,y:0,patternUnits:"objectBoundingBox",height:"100%",width:"100%"});
		var editImage=$(document.createElementNS(GraphSettings.xmlns.svg,'image')).appendTo(editPattern)
		.attr({x:0,y:0,width:"30",height:"30"});
		console.log(editImage.get(0));
		(editImage.get(0)).setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","/img/edit_icon.png");
		
		
		//force icon
		var forcePattern=$(document.createElementNS(GraphSettings.xmlns.svg,'pattern')).appendTo(defs)
		.attr({id:"force_icon",x:0,y:0,patternUnits:"objectBoundingBox",height:"100%",width:"100%"});
		var forceImage=$(document.createElementNS(GraphSettings.xmlns.svg,'image')).appendTo(forcePattern)
		.attr({x:0,y:0,width:"30",height:"30"});
		(forceImage.get(0)).setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","/img/force_icon.png");
		
		//clear icon
		var clearPattern=$(document.createElementNS(GraphSettings.xmlns.svg,'pattern')).appendTo(defs)
		.attr({id:"clear_icon",x:0,y:0,patternUnits:"objectBoundingBox",height:"100%",width:"100%"});
		var clearImage=$(document.createElementNS(GraphSettings.xmlns.svg,'image')).appendTo(clearPattern)
		.attr({x:0,y:0,width:"30",height:"30"});
		(clearImage.get(0)).setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","/img/clear_icon.png");
		
		var zoominPattern=$(document.createElementNS(GraphSettings.xmlns.svg,'pattern')).appendTo(defs)
		.attr({id:"zoomin_icon",x:0,y:0,patternUnits:"objectBoundingBox",height:"100%",width:"100%"});
		var zoominImage=$(document.createElementNS(GraphSettings.xmlns.svg,'image')).appendTo(zoominPattern)
		.attr({x:0,y:0,width:"20",height:"20"});
		(zoominImage.get(0)).setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","/img/zoomin_icon.png");
		
		var zoomoutPattern=$(document.createElementNS(GraphSettings.xmlns.svg,'pattern')).appendTo(defs)
		.attr({id:"zoomout_icon",x:0,y:0,patternUnits:"objectBoundingBox",height:"100%",width:"100%"});
		var zoomoutImage=$(document.createElementNS(GraphSettings.xmlns.svg,'image')).appendTo(zoomoutPattern)
		.attr({x:0,y:0,width:"20",height:"20"});
		(zoomoutImage.get(0)).setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","/img/zoomout_icon.png");
		
		var toolbox=$(document.createElementNS(GraphSettings.xmlns.svg,'g')).appendTo(this.dom.svg)
		.addClass(GraphSettings.classes.toolbox);
		
		//create buttons
		this.buttons.edit=new ToolsButton(toolbox,{background:"edit_icon",position:{x:20,y:20},style:{r:15,opacity:0.6,fill:"#775",stroke:"black"}});

		//add listeners to buttons

		
		this.buttons.force=new ToolsButton(toolbox,{background:"force_icon",position:{x:60,y:20},style:{r:15,opacity:0.6,fill:"blue",stroke:"black"}});

		
		this.buttons.forceType=new ToolsStateButton(toolbox,{position:{x:70,y:40}},
																								{0:{position:{x:60,y:20},style:{r:10,opacity:1,fill:"blue",stroke:"black"}},
																								1:{position:{x:60,y:20},style:{r:10,opacity:1,fill:"green",stroke:"black"}}}
		);

		
		this.buttons.clear=new ToolsButton(toolbox,{background:"clear_icon",position:{x:100,y:20},style:{r:15,opacity:1,fill:"#dbd",stroke:"black"}});

		//***automation turned off
//		 this.automation=new Automation(this,this.dom.automation);
		
		/**create selection button, turn selection on and off**/
		this.buttons.select=new ToolsButton(toolbox,{position:{x:140,y:20},style:{r:15,opacity:0.6,fill:"#dbd",stroke:"black"}});
		
		this.buttons.links=new ToolsButton(toolbox,{position:{x:180,y:20},style:{r:15,opacity:1,fill:"#bdb",stroke:"black"}});
		
		var topzoom=0;
		var bottomzoom=25;
		
		var zoom=$(document.createElementNS(GraphSettings.xmlns.svg,'g')).appendTo(toolbox)
		.attr("transform","translate(10,50)");
		
		var zoomin=$(document.createElementNS(GraphSettings.xmlns.svg,'rect')).appendTo(zoom)
		.attr({transform:"translate(0,"+topzoom+")",fill:"#bbb",stroke:"black",height:20,width:20})
		.attr("fill","url(#zoomin_icon)");
		
		var zoomout=$(document.createElementNS(GraphSettings.xmlns.svg,'rect')).appendTo(zoom)
		.attr({transform:"translate(0,"+bottomzoom+")",fill:"#bbb",stroke:"black",height:20,width:20})
		.attr("fill","url(#zoomout_icon)");
		//add listeners to buttons
		
//		 var zoomscale=$(document.createElementNS(GraphSettings.xmlns.svg,'line')).appendTo(zoom)
//		 .attr({fill:"#ffa",stroke:"#aaf", 'stroke-width':"7px",x1:10,y1:topzoom+22,x2:10,y2:bottomzoom-2});
//		 
//		 var zoombar=$(document.createElementNS(GraphSettings.xmlns.svg,'line')).appendTo(zoom)
//		 .attr({fill:"#dd3",stroke:"#acf", 'stroke-width':"10px",y1:(topzoom+20+bottomzoom)/2.0,x1:0,y2:(topzoom+20+bottomzoom)/2.0,x2:20});
//		 

		
		(function(This){
			This.buttons.links.dom.main.on('mouseup',function(){
				//links should show all links of currently visible nodes.
					var nodes=This.module.view.graph.nodes;
					var nodeUuids=[];
					for(var uuid in nodes){
						nodeUuids.push(uuid);
					}
					This.module.controller.listen({main:'tools',sub:'clicked_links'},{nodes:nodeUuids});
			});
			
			This.buttons.select.dom.main.on('mouseup',function(){
					This.module.controller.listen({main:'tools',sub:'clicked_select'});
			});
			
			This.buttons.edit.dom.main.on('mouseup',function(){
				This.module.controller.listen({main:'tools',sub:"clicked_edit"});
			});
			
			This.buttons.forceType.dom.main.on('mouseup',function(){
				This.module.controller.listen({main:"tools",sub:"clicked_force_type"},null);
			});
			
			This.buttons.force.dom.main.on('mouseup',function(){
				This.module.controller.listen({main:'tools',sub:"clicked_force"});
			});
						
			This.buttons.clear.dom.main.on('mouseup',function(){
				This.module.controller.listen({main:'tools',sub:"clicked_clear"});
			});
			
			zoomin.on('mouseup',function(){
				This.module.view.listen("zoom_by",{zoom:0.2,center:"auto"});
			});
			zoomout.on('mouseup',function(){
				This.module.view.listen("zoom_by",{zoom:-0.2,center:"auto"});
			});
			
		})(this);

//		 console.log(toolbox);
//		 console.log('tools');
		
		
		return this;
	}
	
	
	GraphViewTools.prototype = {
		/*
		 * TODO
		 */
		constructor: GraphViewTools,
		update:function(data){//data:{toolname:state}
			for(var toolname in data){
				if(this.buttons[toolname]){
					this.buttons[toolname].set(data[toolname]);
				}
			}
		}
	};
	
	return GraphViewTools;
});