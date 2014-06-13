/*
 * IMPORTANT: what is the data format we expect to receive from database???
 * 
 * TODO 
 */


define(['jquery','Modules/Graph/Model/Classes/Graph'],function(jquery,Graph){
	
	function GraphModel(master,module){
		this.master=master;
		this.module=module;
		
		this.graph=new Graph(this);
	}
	
	
	GraphModel.prototype={
		constructor:GraphModel,
		listen:function listen(message,data){
			/**
			 * message:info,show_links,show_linked,show_elements,edit,update,save_new,add_link_to_node,
			 * 	delete,force,clear,add_element_to_set,move_node,search_usernames,get_user_rights,grant_rights
			 * message.main: get_user,element,search_tags,tag,node,rights
			 * 
			 * 
			 **/
			var graph=this.graph;
			var GraphView=this.module.view;
			
			//console.log('model listening: '+message);
			if(message=='info'){
				for(var i=0,len=data.nodes.length;i<len;i++){
					console.log(data.nodes[i].hide);
					if(data.nodes[i].uuid&&data.nodes[i].uuid!="unsaved_node"){
						if(!data.nodes[i].hide){
							//console.log('sucking');
							suck({nodes:[{uuid:data.nodes[i].uuid}],links:[]},message,this);
							//console.log('asdf'+graph.nodes[data.nodes[0]].info)
						}
						else{
							GraphView.listen('info_off',{nodes:[{uuid:data.nodes[i].uuid}],links:[]});
						}
					}
				}
			}
			else if(message=='show_links'){
				for(var i=0,len=data.nodes.length;i<len;i++){
					graph.nodes[data.nodes[i].uuid].getLinks();
				}
			}
			else if(message=='show_elements'){
					var elements=data.elements;
					graph.nodes[data.uuid].getElements({action:data.action,elements:data.elements});
			}
			else if(message=='edit'){
				//console.log(data);
				for(var i=0,len=data.nodes.length;i<len;i++){
					suck({nodes:[{uuid:data.nodes[i]}],links:[]},message,this);
				}
			}
			else if(message=='update'){//data
				console.log(data);
				update(data,this);
			}
// 			else if(message=='save_new'){//data={}
// 				create(data,this);
// 			}
			else if(message=="add_link_to_node"){
				console.log(data);
				create({nodes:[],links:[data]},this);
			}
			else if(message=="delete"){
				console.log(data);
				deleteGraph(data,this);
			}
			else if(message=="force"){
				//console.log(graph);
				graph.force(data.hierarchy/*,{x:100,y:100}*/);
				GraphView.listen("update_position",graph.getCoordinates());
			}
			else if(message=="clear"){
				graph.clear();
				console.log(graph);
				GraphView.listen("clear",{});
			}
			else if(message=="add_element_to_set"){//this will add element to a set
				addElementToSet(data,this);
			}
			else if(message=="move_node"){
				graph.updateNode(data);
			}
			else if(message=="search_usernames"){
				if(!data.string){
					console.log("we search");
					var Data='data='+encodeURIComponent(JSON.stringify({flag:"ALL"}));
					jquery.ajax(this.master.database+'db_get_all_users.php',{data:Data,type:'POST',async:true,success:function(backpack){
	// 					console.log(backpack);
						
						GraphView.listen(data.callback,{users:backpack.users,uuid:data.uuid});
					}});
				}
			}
			else if(message=="get_user_rights"){
				var Data='data='+encodeURIComponent(JSON.stringify({username:data.username,uuid:data.uuid}));
				console.log(Data);
				
				jquery.ajax(this.master.database+'db_get_user_rights.php',{data:Data,type:'POST',async:true,success:function(backpack){
					//backpack{user_me:{username, have,give},user_grant:{username,have,give},uuid:""}
					GraphView.listen(data.callback,backpack);
				}});
			}
			else if(message=="grant_rights"){
				/*
				* this function receives {username:"",uuid:"",have:"",give:""}.
				* it sends data to database: we want to create rights link between user with username and node with uuid.
				* the user will be granted rights to do with (have), and to grant (give) the node.
				* database is responsible for checking whether we can grant that
				* and whether it does not deteriorate what user already has.
				*/
				console.log(data);
				var Data='data='+encodeURIComponent(JSON.stringify({username:data.username,uuid:data.uuid,have:data.have,give:data.give}));
				jquery.ajax(this.master.database+'db_grant_rights.php',{data:Data,type:'POST',async:true,success:function(backpack){
					console.log(backpack);
					GraphView.listen(data.callback,backpack);
				}});
			}
			else if(message.main=="get_user"){
				var Data='data='+encodeURIComponent(JSON.stringify({username:data.username}));
				jquery.ajax(this.master.database+'db_get_user.php',{data:Data,type:'POST',async:true,success:function(backpack){
					console.log(backpack);
					GraphView.listen(message.callback,backpack);
				}});
			}
			else if(message.main=="element"){//this is not very well implemented!! this message does not make sense for deleting link
				console.log(data);
				var Data='data='+encodeURIComponent(JSON.stringify(data));
				jquery.ajax(this.master.database+'db_delete_element_link.php',{data:Data,type:'POST',async:true,success:function(backpack){
					console.log(backpack);
					for(var eluuid in backpack.elements){
						delete graph.nodes[backpack.set.uuid].elements[eluuid];
						delete graph.nodes[eluuid].elementOf[backpack.set.uuid];
					}
					GraphView.listen(message.callback,backpack);
				}});
			}
			else if(message.main=="search_tags"){
				var Data='data='+encodeURIComponent(JSON.stringify(data));
				jquery.ajax(this.master.database+'db_tag_search_tag.php',{data:Data,type:'POST',async:true,success:function(backpack){
					console.log(backpack);
					GraphView.listen(message.callback,backpack);
				}});
			}
			else if(message.main=='graph'){
				//console.log('gr');
				listenGraph(message,data,this);
			}
			else if(message.main=="node"){
				listenNode(message,data,this);
			}
			else if(message.main=="rights"){
				listenRights(message,data,this);
			}
			else if(message.main=="tag"){
				listenTag(message,data,this);
			}
			else{
				console.log("GraphModel: call not understood");
			}
		}
	};
	
	
	
// 	var graph=new Graph();
	function listenGraph(message,data,This){
		var GraphView=This.module.view;
		
		if(message.sub=='get_links_of_nodes'){
			/**data should be nodes:[uuid,uuid,uuid]**/
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_graph_get_links_of_nodes.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				var links=[];
				for(var i=0,l=backpack.length;i<l;i++){
					links.push(This.graph.addLink(backpack[i]));
				}
				GraphView.listen(message.callback,{nodes:[],links:links});
			}});
		}
		else if(message.sub=='find-path'){
			/**data should be {nodes:[uuid,uuid,uuid]}**/
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			console.log(Data);
			jquery.ajax(This.master.database+'db-find-paths.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				var links=[];
				var elements=[];
				for(var i=0, leni=backpack.length;i<leni;i++){
					var pathdata=backpack[i];
					for (var j=0,lenj=pathdata.length;j<lenj;j++){
						var relation=pathdata[j];
						if(relation.type=='LINK_TO'){
							var link={uuid:relation.uuid,src:relation.src,tg:relation.tg};
							This.graph.addLink(link);
							links.push(link);
						}
						else if(relation.type=='ELEMENT'){
							var element={set:relation.src,element:relation.tg};
							This.graph.addElementLink(element);
							elements.push(element);
						}
					}
				}
				GraphView.listen(message.callback,{elements:elements,links:links});
			}});
		}
		else if(message.sub=='show-graph'){
			suck(data,message.callback,This);
		}
	}
	
	
	function listenNode(message,data,This){
		var GraphView=This.module.view;
		var graph=This.graph;
		if(message.sub=="get_tags_of_node"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_tag_get_tags_of_node.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="get_coords"){
			console.log(graph.readNode(data.uuid));
			GraphView.listen(message.callback,graph.readNode(data.uuid));
		}
		else if(message.sub=="get_sets"){//get sets which contain this element. what to do with them?
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_node_get_sets.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				if(backpack&&backpack.sets&&backpack.element){
					graph.addNode(backpack.element);
					for(var setUuid in backpack.sets){
						graph.nodes[backpack.element.uuid].addSet(backpack.sets[setUuid]);
					}
				}
				GraphView.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=='save-new'){//data={}
			create(data,This);
		}
		else if(message.sub=='show_linked'){
			for(var i=0,len=data.nodes.length;i<len;i++){
				graph.nodes[data.nodes[i].uuid].getLinked();
			}
		}
	}
	
	function listenRights(message,data,This){
		var GraphView=This.module.view;
		if(message.sub=="search_users"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_user_search_users.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
		if(message.sub=="search_groups"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_user_search_groups.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
		if(message.sub=="get_group_rights"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_rights_get_group_rights.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
		if(message.sub=="group_grant_rights"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_rights_group_grant_rights.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
	}
	
	function listenTag(message,data,This){
		var GraphView=This.module.view;
		if(message.sub=="tag_node"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_tag_tag_node.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
		if(message.sub=="untag_node"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_tag_untag_node.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
		if(message.sub=="create_new_tag"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			jquery.ajax(This.master.database+'db_tag_create_tag.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				GraphView.listen(message.callback,backpack);
			}});
		}
	}
	
	//this function should delete part of graph from Model and database.
	function deleteGraph(protograph,This){
		var GraphView=This.module.view;
		var graph=This.graph;
		var data='data='+encodeURIComponent(JSON.stringify(protograph));
		jquery.ajax(This.master.database+'db_delete.php',{data:data,type:'POST',async:true,success:function(backpack){
			console.log(backpack);
			
			var partialGraph={nodes:[],links:[]};
			
			for(var i=0,len=backpack.nodes.length;i<len;i++){
				console.log(backpack.nodes[i]);
				if(graph.nodes[backpack.nodes[i].uuid]){
					graph.nodes[backpack.nodes[i].uuid].remove();
					partialGraph.nodes.push(backpack.nodes[i]);
				}
			}
			for(var i=0,len=backpack.links.length;i<len;i++){
				console.log(graph.links);
				if(graph.links[backpack.links[i].uuid]){
					graph.links[backpack.links[i].uuid].remove();
				}
				partialGraph.links.push(backpack.links[i]);
			}
			GraphView.listen("remove",partialGraph);
		}});
	}
	
	function addElementToSet(data,This){//data expected as: {"set":{"uuid":""},"element":{"uuid":""}}
		var GraphView=This.module.view;
		console.log('implement database access!');
		console.log(JSON.stringify(data));
		var data='data='+encodeURIComponent(JSON.stringify(data));
		jquery.ajax(This.master.database+'db_add_element_to_set.php',{data:data,type:'POST',async:true,success:function(backpack){
			console.log(backpack);
			var elementsOfSet={set:backpack.set,elements:[backpack.element],action:"show_in_graph"/*parameters.action*/};
			GraphView.listen("show_elements_of_set",elementsOfSet);
		}});
		
	}
	
	function create(protograph,This){
		var GraphView=This.module.view;
		var graph=This.graph;
		
		/**we need to solve the independence of coordinates.
		 * this solution is not nice. we presume that there is always just one node saved maximum.
		 * maybe it would be better to create nodes and links independently. less efficient though.
		 **/
		var nodeCoords=(protograph.nodes[0]&&protograph.nodes[0].coords)?protograph.nodes[0].coords:null;
		
		//console.log(protograph);
		var data='data='+encodeURIComponent(JSON.stringify(protograph));
		jquery.ajax(This.master.database+'db_create.php',{data:data,type:'POST',async:true,success:function(backpack){
			console.log(backpack);
			var partialGraph={nodes:[],links:[]};
			if(backpack.nodes.length){
				if(nodeCoords) backpack.nodes[0].coords=nodeCoords;
				var node=graph.addNode(backpack.nodes[0]);
				
				partialGraph.nodes.push(node);
			}
			for(var i=0,len=backpack.links.length;i<len;i++){
				var link=graph.addLink(backpack.links[i]);
				partialGraph.links.push(link);
			}
			GraphView.listen("show_new",partialGraph);
		}});
	}
	
	//this function is supposed to show a graph
	
	function update(protograph,This){
		var GraphView=This.module.view;
		
		//console.log(protograph);
		var data='data='+encodeURIComponent(JSON.stringify(protograph));
		console.log(data);
		jquery.ajax(This.master.database+'db_update.php',{data:data,type:'POST',async:true,success:function(backpack){
			console.log(backpack);
			var showGraph={nodes:[],links:[]};
			for(var i=0,len=backpack.nodes.length;i<len;i++){
				var node=This.graph.addNode(backpack.nodes[i]);
				showGraph.nodes.push(node);
			}
			
//			 var node=new Node(backpack);
//			 graph.nodes[node.uuid]=node;
			GraphView.listen("show",showGraph);
		},complete:function(){console.log('finished')}});
	}
	
	
	
	function suck(protograph,message,This){
		var GraphView=This.module.view;
		//console.log(GraphView);
		
		var graph=This.graph;
		
		for(var i=0,len=protograph.nodes.length;i<len;i++){
			var data='data='+encodeURIComponent(JSON.stringify(protograph.nodes[i]));
			//console.log(protograph);
			jquery.ajax(This.master.database+'db_read_node.php',{data:data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				if(backpack){
					var node=graph.addNode(backpack);
					//console.log(message);
					GraphView.listen(message,{nodes:[graph.nodes[node.uuid]],links:[]});
				}
			}});
		}
		for(var i=0,len=protograph.links.length;i<len;i++){
			var data='data='+encodeURIComponent(JSON.stringify(protograph.links[i]));
			jquery.ajax(This.master.database+'db_read_link.php',{data:data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				if(backpack&&backpack.uuid&&backpack.src&&backpack.tg){
					var link=graph.addLink(backpack);
					GraphView.listen(message,{nodes:[],links:[graph.links[link.uuid]]});
				}
			}});
		}
	}
	
	return GraphModel;
});