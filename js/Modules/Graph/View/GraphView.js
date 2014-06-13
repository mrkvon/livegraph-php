define(['./GraphSettings','jquery','mathjax','./Classes/Graph','cowboy'], function(GraphSettings,jquery,mathjax,Graph){
	
/*
	
	var graph;
	//data
	
	*/
	function GraphView(htmldom,master,module){
		this.module=module;
		this.master=master;
		
		this.graph=new Graph(htmldom,this);
	}
	
	GraphView.prototype={
		constructor:GraphView,
		listen:function(message,data){
			try{console.log('graph view listening: '+JSON.stringify(message));}catch(e){console.log(e);}
			console.log(data);
			var graph=this.graph;
			var GraphController=this.module.controller;
			
			if(message=='info'){
				for(var i=0,len=data.nodes.length;i<len;i++){
					var uuid=data.nodes[i].uuid;
					if(graph.nodes[uuid]){
						if(!graph.nodes[uuid].label){
							graph.nodes[uuid].addLabel(data.nodes[i]);
						}
						graph.nodes[uuid].label.dom.main.parent().append(graph.nodes[uuid].label.dom.main);
						graph.nodes[uuid].label.info(data.nodes[i]).active(true);
						
						//this code is only work code to show link list after showing a label.
						//console.log(graph.nodes[this.uuid].label.data.info);
						GraphController.listen('clicked_show_links',{uuid:uuid});
					}
				}
			}
			//trigger when we want to hide details in label
			else if(message=='info_off'){
				for(var i=0,len=data.nodes.length;i<len;i++){
					graph.nodes[data.nodes[i].uuid].label.active(false);
				}
			}
			//trigger when we want to turn on edit mode (we want to edit details (in label (of node)))
			else if(message=='edit'){
				//console.log('edit'+JSON.stringify(data));
				
				for(var i=0,len=data.nodes.length;i<len;i++){
					graph.nodes[data.nodes[i].uuid].label.editMode(data.nodes[i]);
				}
			}
			else if(message=='save_new'){
				graph.nodes[data.nodes[0].uuid].label.editMode(data.nodes[0]);
			}
			//we just update graph based on received data
			else if(message=='show'){
				console.log(data);
				change(data,{center:true},this);
			}
			else if(message=='update_position'){
				//console.log(data);
				for(var i=0;i<data.nodes.length;i++){
					var dataNode=data.nodes[i]
					if(graph.nodes[dataNode.uuid]){
						graph.nodes[dataNode.uuid].newPosition(dataNode.coords);
					}
				}
			}
			else if(message=='show_new'){
				//this commented code was moved to function Node.prototype.remove
	//			 var node=graph.nodes[GraphSettings.other.unsavedNode].main;
	//			 var label=graph.nodes[GraphSettings.other.unsavedNode].label.main;
	//			 node.parentNode.removeChild(node);
	//			 label.parentNode.removeChild(label);
	//			 delete graph.nodes[GraphSettings.other.unsavedNode];
	//			 if(data.nodes.length==1&&graph.nodes[GraphSettings.other.unsavedNode]){
	// 				graph.nodes[GraphSettings.other.unsavedNode].remove();
	//			 }
				change(data,{},this);
			}
			else if(message=='remove'){
	//			 console.log(data);
				remove(data,this);
			}
			else if(message=='remove_labels'){
				graph.removeLabels();
			}
			else if(message=='add_labels'){
				graph.addLabels();
			}
			else if(message=='update_tools_state'){
				graph.tools.update(data);
			}
			else if(message=='create_mousemove_dragdrop_listener'){
				function someCallback(e) {
					GraphController.listen('move_node',{coords:graph.clientToGraphCoords({x:e.clientX,y:e.clientY})});
				}
				// don't fire more than 10 times per second
				var debouncedCallback = $.throttle(100,true, someCallback);
				//		 document.getElementById('some-id').addEventListener('mousemove', debouncedCallback);

				graph.dom./*svg.*/main.on('mousemove',debouncedCallback);
			}
			else if(message=='remove_mousemove_dragdrop_listener'){
				graph.dom./*svg.*/main.off('mousemove');
			}
			else if(message=='create_mousemove_dragdrop_graph_listener'){
				(function(coords,gCoords){
					function someCallback2(e) {
						var graphCoords=graph.clientToSvgCoords({x:e.clientX,y:e.clientY});
						var finalCoords={x:graphCoords.x-coords.x+gCoords.x,y:graphCoords.y-coords.y+gCoords.y};
// 						console.log(gCoords);
						GraphController.listen('move_graph',{coords:finalCoords});
					}
					// don't fire more than 10 times per second
					var debouncedCallback = $.throttle(100,true, someCallback2);
					//		 document.getElementById('some-id').addEventListener('mousemove', debouncedCallback);

					graph.dom./*svg.*/main.on('mousemove',debouncedCallback);
				})(data.coords,{x:graph.coords.x,y:graph.coords.y});
			}
			else if(message=='remove_mousemove_dragdrop_graph_listener'){
				graph.dom./*svg.*/main.off('mousemove');
			}
			else if(message=='move_node'){
	//			 console.log('move_node');
	//			 console.log(data);
				if(data.uuid){
					graph.nodes[data.uuid].newPosition(data.coords);
				}
			}
			else if(message=='move_graph'){
	//			 console.log('move_graph');
	//			 console.log(data);
				graph.newPosition(data.coords);
			}
			else if(message=='zoom_by'){
	//			 console.log(message);
				graph.zoom({zoom:data.zoom/*center:{x:$(window).width()/2,y:$(window).height()/2}*/})
			}
			else if(message=="show_elements_of_set"){
				console.log(data);
				if(data.action=="show_in_label"||1){
					for(var uuid in data.elements) graph.nodes[data.set.uuid].label.addElement(data.elements[uuid]);
				}
				if(data.action=="show_in_graph"){
					//this is just for now. we want to show elements of the node as set in graph.
					var links=[];
					var nodes=[];
					for(var uuid in data.elements){
						var link={uuid:data.set.uuid+data.elements[uuid].uuid,src:data.set,tg:data.elements[uuid]}
						console.log(link);
						links.push(link);
						nodes.push(data.elements[uuid]);
						//change({nodes:[data.elements[uuid]],links:[link]},{action:"elements"},this);
					}
					change({nodes:nodes,links:links},{action:"elements"},this);
				}
			}
			else if(message=="clear"){
				graph.clear();
	//			 console.log(graph);
			}
			else if(message=="labelRights_input_list_usernames"){
				console.log(data.users);
				graph.nodes[data.uuid].label.rights.newHintList(data.users);
			}
			else if(message=="labelRights_show_user"){
				console.log(data);
				if(data.user_grant.username&&data.user_me.username){
					graph.nodes[data.uuid].label.rights.addUser(data.user_grant,data.user_me);
				}
			}
			else if(message.main=="automation"){
				console.log(data);
				if(message.sub=="user_add"){
					for(var username in data.users){
						graph.tools.automation.addUser(data.users[username]);
					}
				}
				else if(message.sub=="user_change_status"){
					graph.tools.automation.users[data.username].changeStatus(data);
				}
				else if(message.sub=="tags_to_hint_list"){
					//console.log(data);
					graph.tools.automation.newTagHintList(data);
				}
			}
			else if(message.main=="tags_in_label"){
				console.log(data);
				if(message.sub=="tags_to_hint_list"){
					console.flilog(data);
					console.log(message.data.uuid);
					graph.nodes[message.data.uuid].label.tags.createHintList(data);
				}
				if(message.sub=="add_tag"){
					console.log(data);
					console.log(message.data.uuid);
					graph.nodes[message.data.uuid].label.tags.addTag(data);
				}
				if(message.sub=="remove_tag"){
					if(data&&data.name){
						graph.nodes[message.data.uuid].label.tags.removeTag(data);
					}
				}
				if(message.sub=="add_tags"){
					if(data.tags){
						graph.nodes[message.data.uuid].label.tags.clearTags();
						for(var name in data.tags){
							graph.nodes[message.data.uuid].label.tags.addTag(data.tags[name]);
						}
					}
				}
			}
			else if(message.main=="element"){
				if(message.sub=="delete"){
					for(var eluuid in data.elements){
						graph.links[data.set.uuid+eluuid].remove();
					}
				}
			}
			else if(message.main=="rights"){
				listenRights(message,data,this);
			}
			else if(message.main=="ghost_link"){
				listenGhostLink(message,data,this);
			}
			else if(message.main=="graph"){
				listenGraph(message,data,this);
			}
			else if(message.main=="node"){
				listenNode(message,data,this);
			}
			else{
				console.log("call not understood");
			}
		}
	};
	
	
	function listenRights(message,data,This){
		if(message.sub=="usernamelist_show_users"){
			var usersData=data.data.users;
			message.target.newHintList(usersData);
		}
		else if(message.sub=="grouplist_show_groups"){
			var groupsData=data.data.groups;
			message.target.newGroupHintList(groupsData);
		}
		else if(message.sub=="group_div_show_group"){
			console.log(data.data);
			if(data.data.group_grant.id&&data.data.user_me.username){
				message.target.addGroup(data.data.group_grant,data.data.user_me);
			}
		}
	}
	
	function listenGhostLink(message,data,This){
		var graph=This.graph;
		
		if(message.sub=="start"){
			var ghostLink=graph.addGhostLink(data);
			
			(function(ghostLink){
				function someCallback(e) {
					ghostLink.newEnd(graph.clientToGraphCoords({x:e.clientX,y:e.clientY}));
				}
				// don't fire more than 10 times per second
				var debouncedCallback = $.throttle(100,true, someCallback);
				//		 document.getElementById('some-id').addEventListener('mousemove', debouncedCallback);

				$(graph.dom.main).on("mousemove",debouncedCallback);
				$(graph.dom.main).on("mouseup",function(){
					$(graph.dom.main).off("mousemove",debouncedCallback);
					$(graph.dom.main).off("mouseup",function(){
						$(graph.dom.main).off("mousemove",debouncedCallback);
						$(graph.dom.main).off("mouseup",debouncedCallback);
					});
					ghostLink.remove();
				});
			})(ghostLink);			
		}
		else{
			console.log("GraphView::GhostLink: subcall not understood: "+message.sub);
		}
	}
	
	function listenGraph(message,data,This){
		var graph=This.graph;
		if(message.sub=='start-selection'){
			
			var start=data.coords;
			This.master.on('selection');
			
			
			
			(function(start){
				function someCallback(e) {
					var end=graph.clientToGraphCoords({x:e.clientX,y:e.clientY});
					graph.selectionSquare([start.x,start.y,end.x,end.y]);
					graph.selectWithSquare([start.x,start.y,end.x,end.y]);
				}
				// don't fire more than 10 times per second
				var debouncedCallback = $.throttle(100,true, someCallback);
				//		 document.getElementById('some-id').addEventListener('mousemove', debouncedCallback);
				var rmls=function(e){
					e.stopPropagation();
					$(graph.dom.main).off("mousemove",debouncedCallback);
					$(graph.dom.main).off("mouseup",rmls);
					
					var end=graph.clientToGraphCoords({x:e.clientX,y:e.clientY});
					graph.selectWithSquare([start.x,start.y,end.x,end.y]);
					graph.selectionSquare(false);
					console.log(graph.selection);
				};
					
				$(graph.dom.main).on("mousemove",debouncedCallback);
				$(graph.dom.main).on("mouseup",rmls);
			})(start);
		}
		else if(message.sub=='show-graph'){
			change(data,{center:false},This);
		}
		else if(message.sub=='show-path'){
			
			for(var i=0, leni=data.links.length;i<leni;i++){
				console.log(i);
				This.graph.addLink(data.links[i]);
			}
			for(var j=0, lenj=data.elements.length;j<lenj;j++){
				console.log(j);
				This.graph.addElementLink(data.elements[j]);
			}
			This.master.updateHistory(true);
		}
		else if(message.sub=='zoom'){
			This.graph.zoom({ratio:data.ratio,center:data.center});
		}
//		 else if(message.sub=='finish-selection'){
//			 //nothing...
//		 }
	}
	
	function listenNode(message,data,This){
		if(message.sub=="add_sets"){
			if(data&&data.element&&data.sets){
				for(var uuid in data.sets){
					var link={uuid:data.sets[uuid].uuid+data.element.uuid,src:data.sets[uuid],tg:data.element}
					console.log(link);
					change({nodes:[data.element,data.sets[uuid]],links:[link]},{action:"elements"},This);
				}
			}
			else{
				console.log("no sets found (either non-existent or you don't have rights or you are not logged in)");
			}
		}
		else if(message.sub=="jlwerjwlejrwk"){
			//nothing...
		}
	}
	
	
	
	
	
	
	
// 			//this function should 
// 	function newNodeInterface(nodeData){//{node:{uuid:'unsaved_node',name:'',content:'',coords:{x:0,y:0\}}
// 		nodeData=nodeData||{};
// 		nodeData.coords=nodeData.coords||{};
// 		nodeData.coords.x=nodeData.coords.x||0;
// 		nodeData.coords.y=nodeData.coords.y||0;
// 		nodeData.uuid=nodeData.uuid||GraphSettings.other.unsavedNode; nodeData.name=nodeData.name||''; nodeData.content=nodeData.content||'';
// 		
// 		graph.addNode(nodeData).label.active(true).info(nodeData).editNew(nodeData);
// 	}
	
	function remove(protograph,This){
		var graph=This.graph;
		for(var i=0,len=protograph.nodes.length;i<len;i++){
			graph.nodes[protograph.nodes[i].uuid].remove();
		}
		for(var i=0,len=protograph.links.length;i<len;i++){
			if(graph.links[protograph.links[i].uuid]){
				graph.links[protograph.links[i].uuid].remove();
			}
		}
	}
	
	
	function change(object,settings,This){
		var graph=This.graph;
//		 console.log(object);
		settings=settings||{action:""};
		for(var i=0,len=object.nodes.length;i<len;i++){
			var objectNode=object.nodes[i];
			console.log(objectNode);
			var newNode=graph.addNode(objectNode);
			if(settings.center){
				newNode.center();
			}
			if(settings.active){
				newNode.active(true);
			}
			if(settings.edit){
				
			}
		}
		
		////************
		////adding links
		for(var i=0,len=object.links.length;i<len;i++){
			var objectLink=object.links[i];
			
			var sett={};
			if(settings.action=="elements"){
				console.log("elements");
				sett.color="red";
			}
			
			
			graph.addLink(objectLink,sett);
		}
		This.master.updateHistory();
	}
	

	

	
// 	function translateAll(coords){
// 		
// 		var newT=(graph.dom.svg.main.createSVGMatrix().translate(coords.x,coords.y));
// 				
// 		graph.dom.svg.all.setAttribute('transform','matrix('+newT.a+','+newT.b+','+newT.c+','+newT.d+','+newT.e+','+newT.f+')');
// 		
// //		 /*this is to move labels and infos
// //		 * 
// //		 */
// 		graph.dom.html.main.style.top=coords.y+'px';
// 		//console.log(coords.y+'px');
// 		graph.dom.html.main.style.left=coords.x+'px';
// 	}
	
	return GraphView;
});