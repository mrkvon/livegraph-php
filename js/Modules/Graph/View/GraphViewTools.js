//create buttons of graph window...


define(['./GraphSettings','jquery'],
function(GraphSettings,$){
	
	function Template(parent){
    var main=$(document.createElement('div')).appendTo(parent);
    main.addClass("view_graph_tools");
    
    return {
      main:main
    };
  }
	
	
	
	function ToolsButton(domparent,settings){
		var settings=settings||{};
		settings.style=settings.style||{};
		settings.style.height=settings.style.height||34;
		settings.style.width=settings.style.width||34;
		settings.style.opacity=settings.style.opacity||0.6;
		settings.style.border=settings.style.border||'2px solid black';
		settings.style['background-color']=settings.style['background-color']||"gray";
		settings.position=settings.position||{x:0,y:0};
		settings.title=settings.title||'?';
		
		this.dom={};
		
		//creating DOM elements of button
		this.dom.main=$(document.createElement('button')).appendTo(domparent)
		.css({position:"absolute",left:settings.position.x,top:settings.position.y,'pointer-events':'visible',
				'border-radius':'5px'}).css(settings.style).attr({title:settings.title});
		if(settings.background){
			this.dom.main.css({'background-image':'url('+settings.background+')','background-size':'30px 30px','background-position':'0px 0px'});
		}
		//		 for(var property in settings.style){
//			 this.dom.button.setAttribute(property,settings.style[property]);
//		 }
		//set position of button
		

		return this;
	}
	
	ToolsButton.prototype.set=function(bValue){
		this.dom.main.css({opacity:bValue?1:0.6});
	}
	
	//button with more than two states...
	function ToolsStateButton(domparent,settings,states){
		var settings=settings||{};
		settings.style=settings.style||{};
// 		settings.style.r=settings.style.r||15;
		//settings.style.opacity=settings.style.opacity||0.6;
// 		settings.style.stroke=settings.style.stroke||"black";
// 		settings.style.fill=settings.style.fill||"gray";
		settings.position=settings.position||{x:0,y:0};
		
		this.dom={};
		
		this.dom.states={};
		//this.dom.parent=domparent;
		
		this.dom.main=$(document.createElement('button'))/*.appendTo(domparent)*/
			.css({position:'absolute'/*,width:"30px",height:"30px"*/,
					left:settings.position.x,top:settings.position.y/*,border:'3px solid black'*/,'pointer-events':'visible'})
			.appendTo(domparent);
		
		for(var state in states){
			
			var State=states[state];
			State.style=State.style||{};
			State.style.width=State.style.width||'34px';
			State.style.height=State.style.height||'20px';
			State.style.opacity=State.style.opacity||1;
			State.style.border=State.style.border||'2px solid black';
			State.style['border-radius']=State.style['border-radius']||'5px';
			this.dom.states[state]=State;
			
			
// 			this.dom.states[state]=$(document.createElement('button')).css({width:'34px',height:'20px',position:'relative',opacity:1,border:'2px solid black','border-radius':'5px'})
// 			.css(State.style);

			
			//if(State.background) this.dom.states[state].attr("fill","url(#"+State.background+")");
			
			
//			 this.dom.states[state]=
		}
		
		if(this.dom.states[0]) this.dom.main.css(this.dom.states[0].style);
		
		return this;
	}
	
	ToolsStateButton.prototype.set=function(state){//value is number or string or whatever...
//		 console.log(state);
//		 console.log(this.dom.states[state]);
// 		for(var s in this.dom.states){
// 			this.dom.states[s].remove();
// 		}
// //		 alert("");
		//this.dom.states[state].appendTo(this.dom.main);
		this.dom.main.css(this.dom.states[state].style);
	}
	
	function GraphViewTools(DOMElement,parent){
		this.parent=parent;
		this.master=parent.master;
		this.module=parent.module;
		
		this.buttons={};
		this.automation;
		this.dom=Template(DOMElement);
		
		var toolbox=$(document.createElement('div')).appendTo(this.dom.main)
		.addClass(GraphSettings.classes.toolbox);
		
		//create buttons
		this.buttons.edit=new ToolsButton(toolbox,{title:'edit',background:'/img/edit_icon.png',position:{x:5,y:5},style:{opacity:0.6,'background-color':'#fff'}});

		//add listeners to buttons

		
		this.buttons.force=new ToolsButton(toolbox,{title:'force',background:'/img/force_icon.png',position:{x:45,y:5},style:{opacity:0.6,'background-color':'blue'}});

		
		this.buttons.forceType=new ToolsStateButton(toolbox,{position:{x:45,y:40}},
																								{0:{style:{'background-color':"blue"}},
																								1:{style:{'background-color':"red"}}});

		
		this.buttons.clear=new ToolsButton(toolbox,{title:'clear',background:'/img/clear_icon.png',position:{x:85,y:5},style:{opacity:1,'background-color':'#dbd'}});

		//***automation turned off
//		 this.automation=new Automation(this,this.dom.automation);
		
		/**create selection button, turn selection on and off**/
		this.buttons.select=new ToolsButton(toolbox,{title:'select',background:'/img/select_icon.png',position:{x:125,y:5},style:{opacity:0.6,'background-color':'#dbd'}});
		
		this.buttons.linking=new ToolsButton(toolbox,{title:'find all links between nodes',background:'/img/linking_icon.png',position:{x:165,y:5},style:{opacity:1,'background-color':'#bdb'}});
		
		this.buttons.zoomin=new ToolsButton(toolbox,{title:'zoom in',position:{x:5,y:60},
			style:{
				opacity:1,'background-color':'eee',
				height:'24px',width:'24px',
				border:'2px solid black','border-radius':'0px',
				'background-image':'url(/img/zoomin_icon.png)',
				'background-size':'20px 20px'
			}
		});
		
		this.buttons.zoomout=new ToolsButton(toolbox,{title:'zoom out',position:{x:5,y:85},
			style:{
				opacity:1,'background-color':'eee',
				height:'24px',width:'24px',
				border:'2px solid black','border-radius':'0px',
				'background-image':'url(/img/zoomout_icon.png)',
				'background-size':'20px 20px'
			}
		});
		
		
		(function(This){
			This.buttons.linking.dom.main.on('mouseup',function(){
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
				This.module.controller.listen({main:'tools',sub:"clicked_force_type"},null);
			});
			
			This.buttons.force.dom.main.on('mouseup',function(){
				This.module.controller.listen({main:'tools',sub:"clicked_force"});
			});
						
			This.buttons.clear.dom.main.on('mouseup',function(){
				This.module.controller.listen({main:'tools',sub:"clicked_clear"});
			});
			
			This.buttons.zoomin.dom.main.on('mouseup',function(){
				This.module.view.listen("zoom_by",{zoom:1.2,center:"auto"});
			});
			This.buttons.zoomout.dom.main.on('mouseup',function(){
				This.module.view.listen("zoom_by",{zoom:1/1.2,center:"auto"});
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