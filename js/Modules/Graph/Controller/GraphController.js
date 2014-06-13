define([/*'Modules/Graph/Model/GraphModel'*/],function(/*GraphModel*/){
	
	function GraphController(master,module){
		this.module=module;
		this.master=master;
		
		this.status={force:false,edit:false,select:false,forceType:0,automation:{users:{}}};
	
		this.mouseEditingState={from:{type:null,uuid:null},to:{type:null,uuid:null}};
		this.dragdropState={move:false,node:{uuid:null}};
	}
	
	GraphController.prototype={
		constructor:GraphController,
		listen:function(message,data){
			var GraphModel=this.module.model;
			var GraphView=this.module.view;
			var status=this.status;
			var mouseEditingState=this.mouseEditingState;
			var dragdropState=this.dragdropState;			
			
			try{
				console.log('controller listening: '+message+JSON.stringify(message));
			}catch(e){
				console.log(JSON.stringify(e));
			}
			if(message=='click_on_node'&&data.uuid){
				console.log(data);
				GraphModel.listen('info',{nodes:[{uuid:data.uuid,hide:data.hide}],links:[]});
			}
			else if(message=='clicked_show_links'&&data.uuid){
				GraphModel.listen('show_links',{nodes:[{uuid:data.uuid}],links:[]});
			}
			else if(message=='clicked_show_linked'&&data.uuid){
				GraphModel.listen({main:'node',sub:'show_linked'},{nodes:[{uuid:data.uuid}],links:[]});
			}
			else if(message=='clicked_show_elements'&&data.uuid){
				GraphModel.listen('show_elements',{uuid:data.uuid,elements:[],action:"show_in_label"});
			}
			else if(message=='show_element_of_set_in_graph'){
				console.log(data);
				GraphModel.listen('show_elements',{uuid:data.owner.uuid,elements:[{uuid:data.button.uuid}],action:"show_in_graph"});
			}
			else if(message=='edit'&&data.uuid){
				console.log('controller_edit');
				GraphModel.listen('edit',{nodes:[data.uuid],links:[]});
			}
			else if(message=='save'){
				console.log(data);
				GraphModel.listen('update',data);
			}/*
			else if(message=='background_dblclick'){
				console.log(data);
			}*/
			else if(message=='mousedown_node'){//when node is mousedowned...
				console.log(data.uuid);
				if (status.edit){ //... if editing is on ...
					fromNode(data.uuid,this);
				}
				else if(!status.edit){
					GraphView.listen('create_mousemove_dragdrop_listener');
					startDrag(data.uuid,this);
				}
			}
			else if(message=='mouseup_node'){
				console.log('node mouseuped');
				if (status.edit){
					toNode(data.uuid,{hide:data.hide,action:"add_link_to_node"},this);
				}
				else if(!status.edit){
					//this part is for dragdropping node.
						GraphView.listen('remove_mousemove_dragdrop_listener');
					if(dragdropState.move==true){
						stopDrag(this.dragdropState,this);
					} else {//show or hide detailed label
						this.listen("click_on_node",data)
					}
				}
				dragdropState={move:false,node:{uuid:null}};
				mouseEditingState={from:{type:null,uuid:null},to:{type:null,uuid:null}};
			}
			else if(message=='mouseup_node_tools_addElementButton'){
				console.log('node mouseuped');
				if (status.edit){
					toNode(data.uuid,{action:"add_element_to_node"},this);
				}
				dragdropState={move:false,node:{uuid:null}};
				mouseEditingState={from:{type:null,uuid:null},to:{type:null,uuid:null}};
			}
			
			else if(message=='mouseup_label_links'){
				console.log(data);
				if (status.edit){
					toNodeLabelLinks(data.uuid,this);
				}
				mouseEditingState={from:{type:null,uuid:null},to:{type:null,uuid:null}};
			}
			else if(message=='clicked_delete_link'){
				console.log(data);
				GraphModel.listen('delete',data);
			}
			else if(message=='clicked_delete_node'){
				console.log(data);
				GraphModel.listen('delete',data);
			}
			else if(message=='move_node'){
				
				(function(dragdropState){
					console.log(dragdropState);
					GraphView.listen('move_node',{uuid:dragdropState.node.uuid,coords:data.coords});
					GraphModel.listen('move_node',{uuid:dragdropState.node.uuid,coords:data.coords});
				})(dragdropState);
				dragdropState.move=true;
			}
			else if(message=='move_graph'){
				(function(/*dragdropState*/){/*
					console.log(dragdropState);*/
					GraphView.listen('move_graph',{coords:data.coords});
				})(/*dragdropState*/);
	//			 dragdropState.move=true;
			}
			else if(message=='search_click_show_node'){
				GraphModel.listen({main:'graph',sub:'show-graph',callback:'show'},{nodes:[{uuid:data}],links:[]});
			}
// 			else if(message=='search_click_show_link'){
// 				GraphModel.suck({nodes:[],links:[{uuid:uuid}]});
// 			}
			else if(message=='labelRights_input_focused'){
				GraphModel.listen('search_usernames',{uuid:data.uuid,callback:"labelRights_input_list_usernames",string:data.string});
			}
			else if(message=='submit_labelRights_add_user_form'){
				GraphModel.listen('get_user_rights',{username:data.username,uuid:data.uuid,callback:"labelRights_show_user"});
			}
			else if(message=='submit_grant_rights_form'){
				console.log(data);
				GraphModel.listen('grant_rights',{username:data.username,uuid:data.uuid,have:data.have,give:data.give,callback:""});
			}
			else if(message&&message.main=='automation'){
				listenAutomation(message,data,this);
			}
			else if(message&&message.main=='button'){
				listenButton(message,data,this);
			}
			else if(message&&message.main=='element'){
				listenElement(message,data,this);
			}
			else if(message&&message.main=='graph'){
				listenGraph(message,data,this);
			}
			else if(message&&message.main=='label'){
				listenLabel(message,data,this);
			}
			else if(message&&message.main=='rights'){
				listenRights(message,data,this);
			}
			else if(message&&message.main=='selection'){
				listenSelection.call(this,message,data);
			}
			else if(message&&message.main=='tags_in_label'){
				listenTagsInLabel(message,data,this);
			}
			else if(message&&message.main=='tools'){
				listenTools(message,data,this);
			}
		}
	};
	
	
	//this function should start dragging of node
	function startDrag(uuid,This){
		This.dragdropState.node.uuid=uuid;
	}
	
	function stopDrag(dragdropState,This){
//		 console.log(dragdropState.move);

		This.dragdropState={move:false,node:{uuid:null}};
	}
	
	function fromNode(uuid,This){
		console.log('inside fromNode'+uuid);
		This.mouseEditingState.from.uuid=uuid;
		This.mouseEditingState.from.type='node';
		
		//here should be GhostLink created. we get the actual coordinates of clicked node stored in GraphModel
		//and we send data to View and start a ghost link.

		This.module.model.listen({main:'node',sub:'get_coords',callback:{main:'ghost_link',sub:'start'}},{uuid:uuid});
	}
	
	
	function toNode(uuid,params,This){ //params:{action:"add_element_to_node"("add_link_to_node"),hide:data.hide (show or hide label?)}
		var mouseEditingState=This.mouseEditingState;
		var GraphModel=This.module.model;
		
		mouseEditingState.to.uuid=uuid;
		mouseEditingState.to.type='node';
		if(mouseEditingState.from.uuid&&mouseEditingState.from.type){
			console.log(JSON.stringify(mouseEditingState));
			if(mouseEditingState.from.type=='node'&&mouseEditingState.to.type=='node'){
				if(mouseEditingState.from.uuid!=mouseEditingState.to.uuid){
					var fromNodeUuid=mouseEditingState.from.uuid;
					var toNodeUuid=mouseEditingState.to.uuid;
					
					if(params.action=='add_element_to_node'){//this will add element to superset (fromnode is element, tonode is set)
						//add element
						var set_element_data={set:{uuid:toNodeUuid},element:{uuid:fromNodeUuid}};
						GraphModel.listen("add_element_to_set",set_element_data);
					}
					else if(params.action=='add_link_to_node'){//this will add element to superset (fromnode is element, tonode is set)
						GraphModel.listen('add_link_to_node',{src:{uuid:mouseEditingState.to.uuid},tg:{uuid:mouseEditingState.from.uuid}});
					}
				}
				else{
					This.listen('click_on_node',{uuid:mouseEditingState.to.uuid,hide:params.hide});
				}
			}
		}
		mouseEditingState.from.uuid=mouseEditingState.from.type=mouseEditingState.to.uuid=mouseEditingState.to.type=null;
	}
	
	function toNodeLabelLinks(uuid,This){
		var mouseEditingState=This.mouseEditingState;
		var GraphModel=this.module.model;
		
		
		console.log('inside toNodeLabelLinks');
		console.log(JSON.stringify(mouseEditingState));
		mouseEditingState.to.uuid=uuid;
		mouseEditingState.to.type="node";
		if(mouseEditingState.from.uuid&&mouseEditingState.from.type){
			console.log(JSON.stringify(mouseEditingState));
			if(mouseEditingState.from.type=='node'&&mouseEditingState.to.type=='node'
				&&mouseEditingState.from.uuid!=mouseEditingState.to.uuid){
				GraphModel.listen('add_link_to_node',{src:{uuid:mouseEditingState.to.uuid},tg:{uuid:mouseEditingState.from.uuid}});
			}
		}
		mouseEditingState.from.uuid=mouseEditingState.from.type=mouseEditingState.to.uuid=mouseEditingState.to.type=null;
	}

	
// 	function dragdrop(drobject){
// //		 console.log('drob'+drobject.dx+' '+drobject.dy+' '+drobject.mousedown);
// 		if(drobject.mousedown=='background')
// 		{
// // 				console.log('send '+parseFloat(drobject.dx)+parseFloat(drobject.dy));
// 			GraphModel.changeOffset({dx:parseInt(drobject.dx),dy:parseInt(drobject.dy)});
// 		}
// 	}
	
// 	function moveTo(drobject){
// //		 console.log('drob'+drobject.dx+' '+drobject.dy+' '+drobject.mousedown);
// 		if(drobject.mousedown=='background'){
// // 				console.log('send '+parseFloat(drobject.dx)+parseFloat(drobject.dy));
// 			GraphModel.setOffset({x:parseInt(drobject.x),y:parseInt(drobject.y)});
// 		}
// 	}
	
	
	/*
	 * hierarchising functions called from "listen"
	 */
	
	function listenAutomation(message,data,This){
		var GraphModel=This.module.model;
		var GraphView=This.module.view;
		var status=This.status;
		
		if(message.sub=="user_form_submit"){
			GraphModel.listen({main:"get_user",callback:message.callback},data);
		}
		if(message.sub=="user_change_status"){
			var users=status.automation.users
			users[data.username]={username:data.username,rights:data.rights,
				active:(users[data.username]&&users[data.username].active)?false:true
			}
			
			GraphView.listen({main:"automation",sub:"user_change_status"},users[data.username]);
		}
		if(message.sub=="tag_input_keyup"){
			GraphModel.listen({main:"search_tags",callback:message.callback},data);
		}
	}
	
	function listenElement(message,data,This){
		var GraphModel=This.module.model;
		
		if(message.sub=="delete_element_link"){
			console.log("remove");
			console.log(data);
			GraphModel.listen({main:"element",sub:"delete",callback:{main:"element",sub:"delete"}},{set:{uuid:data.owner.uuid},element:{uuid:data.button.uuid}});
		}
	}
	
	function listenGraph(message,data,This){
		console.log(message.sub);
		var GraphModel=This.module.model;
		var GraphView=This.module.view;
		var status=This.status;
		
		if(message.sub=='background-dblclick'){
			/**this one should save new node. it has coords in data.**/
			GraphModel.listen({main:'node',sub:'save-new'},data);
			console.log(data);
		}
		else if(message.sub=='load'){
			/**this message is for processing url to show nodes and links after loading of app. **/
			console.log(data.url);//url
			var graphToSend={nodes:[],links:[]};
			
			var regexNodes=/^\/graph\/.*?nodes\/(.*?)\/.*$/;//this is regex to fetch uuids of nodes from url.
			var regexLinks=/^\/graph\/.*?links\/(.*?)\/.*$/;//this is regex to fetch uuids of links from url.
			
			var resultNodes=regexNodes.exec(data.url);						//here we process the regex to result. ("uuid--uuid--uuid--uuid")
			var resultLinks=regexLinks.exec(data.url);						//here we process the regex to result. ("uuid--uuid--uuid--uuid")

//console.log(result);
			
			if(resultNodes&&resultNodes[1]){//if matched
				var nodeUuids=resultNodes[1];
				var nodeUuidArray=nodeUuids.split('--');//array of node uuids we want to show.
				GraphModel.listen({main:'graph',sub:'get_links_of_nodes',callback:{main:'graph',sub:'show-graph'}},{nodes:nodeUuidArray});
				
				for(var i=0,len=nodeUuidArray.length;i<len;i++){
					graphToSend.nodes.push({uuid:nodeUuidArray[i]});
				}
			}
			if(resultLinks&&resultLinks[1]){//if matched
				var linkUuids=resultLinks[1];
				var linkUuidArray=linkUuids.split('--');//array of node uuids we want to show.
				
				for(var i=0,len=linkUuidArray.length;i<len;i++){
					graphToSend.links.push({uuid:linkUuidArray[i]});
				}
			}
			GraphModel.listen({main:'graph',sub:'show-graph',callback:{main:'graph',sub:'show-graph'}},graphToSend);
		}
		else if(message.sub=='mousedown_background'){ //sources: Graph/View/classes/Graph.js
			if(status.select){
				console.log('started_selection. implement!,'+JSON.stringify(data.coords));
				
				GraphView.listen({main:'graph',sub:'start-selection'},{coords:data.graphCoords});
			}
			else if(true/*!GraphState.get('edit')*/){
				GraphView.listen('create_mousemove_dragdrop_graph_listener',{coords:data.coords});
			}
		}
		else if(message.sub=='mouseup_background'){
			console.log('background mouseuped');
			if (status.select){
// 				console.log('finished selection. implement!'+JSON.stringify(data.coords));
// 					GV.listen({main:'graph',sub:'finish-selection'},{coords:data.coords});

			}
			else if(true/*!GraphState.get('edit')*/){
				//this part is for dragdropping node.
					GraphView.listen('remove_mousemove_dragdrop_graph_listener');
			}
		}/*
		else if(message.sub='move-selection'){
			
		}*/
		else if(message.sub=='wheel-svg'){
			//console.log('scroll '+data.direction+((data.direction=='up')?' zoomin':' zoomout'));
			var value=data.value||1.2;
			var magnify=((data.direction=='up')?value:(1/value));
 			GraphView.listen({main:'graph',sub:'zoom'},{ratio:magnify,center:data.coords});
		}
	}
	
	function listenLabel(message,data,This){
		var GraphModel=This.module.model;
		
		if(message.sub=="show_set_mouseup"){
			GraphModel.listen({main:"node",sub:"get_sets",callback:{main:"node",sub:"add_sets"}},data);
		}
	}
	
	function listenRights(message,data,This){
		var GraphModel=This.module.model;
		
		if(message.sub=="keyup_input_username"){
			GraphModel.listen({main:"rights",sub:"search_users",callback:message.callback},data);
		}
		if(message.sub=="keyup_input_group"){
			GraphModel.listen({main:"rights",sub:"search_groups",callback:message.callback},data);
		}
		if(message.sub=="mouseup_group_hint"){
			GraphModel.listen({main:"rights",sub:"get_group_rights",callback:message.callback},data);
		}
		if(message.sub=="submit_group_grant_rights"){
			GraphModel.listen({main:"rights",sub:"group_grant_rights",callback:message.callback},data);
		}
	}
	
	function listenSelection(message,data){
		var GraphModel=this.module.model;
		
		if(message.sub=='shortest-path'){
			GraphModel.listen({main:'graph',sub:'find-path',callback:{main:'graph',sub:'show-path'}},data);
		}
	}
	
	function listenTagsInLabel(message,data,This){
		var GraphModel=This.module.model;
		
		if(message.sub=="tag_input_keyup"){
			GraphModel.listen({main:"search_tags",callback:message.callback},data);
		}
		if(message.sub=="tag_hint_mouseup"){
			GraphModel.listen({main:"tag",sub:"tag_node",callback:message.callback},data);
		}
		if(message.sub=="tag_remove_mouseup"){
			GraphModel.listen({main:"tag",sub:"untag_node",callback:message.callback},data);
		}
		if(message.sub=="tag_submit_create_new_tag"){
			GraphModel.listen({main:"tag",sub:"create_new_tag",callback:message.callback},data);
		}
		if(message.sub=="get_tags"){
			GraphModel.listen({main:"node",sub:"get_tags_of_node",callback:message.callback},data);
		}
	}
	
	function listenTools(message,data,This){
		var GraphModel=This.module.model;
		var GraphView=This.module.view;
		var status=This.status;
		
		if(message.sub=="clicked_force_type"){
			status.forceType=status.forceType>=1?0:++status.forceType;
			GraphView.listen('update_tools_state',{forceType:status.forceType});
		}
		else if(message.sub=='clicked_select'){
			/**turn on and on selection button: **/
			status.select=!status.select;
			GraphView.listen('update_tools_state',{select:status.select});
		}
		else if(message.sub=='clicked_clear'){
			GraphModel.listen('clear',{});
		}
		else if(message.sub=='clicked_links'){
			console.log(data);
			GraphModel.listen({main:'graph',sub:'get_links_of_nodes',callback:'show'},data);
		}
		else if(message.sub=='clicked_force'){
			status.force=!status.force;
			console.log("force: "+status.force);
			var frc=function(){
				if(status.force){
					GraphModel.listen('force',{hierarchy:status.forceType});
					console.log('repeat_force');
					setTimeout(frc,0);
				}
			};
			if(status.force){
				GraphView.listen('remove_labels');
				GraphView.listen('update_tools_state',{force:true});
				frc();
			}
			else{
				GraphView.listen('add_labels');
				GraphView.listen('update_tools_state',{force:false});
			}
		}
		else if(message.sub=='clicked_edit'){
			status.edit=(!status.edit) ? true : false;
			GraphView.listen('update_tools_state',{edit:status.edit});
		}
	}
	
	
	
	/*
	 * end of hierarchizing functions called from "listen"
	 */
	
	return GraphController;
});