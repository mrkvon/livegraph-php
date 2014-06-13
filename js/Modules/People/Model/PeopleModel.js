/*
 * IMPORTANT: what is the data format we expect to receive from database???
 * 
 * TODO 
 */


define(['jquery'],
function($){
	
	function PeopleModel(module){
		this.module=module;
								this.master=module.master;
	}
	
	PeopleModel.prototype={
		constructor:PeopleModel,
		listen:function(message,data){
			console.log('model listening');
			console.log(message);
			if(message.main=="groups"){
				listenGroups(message,data,this);
			}
			else if(message.main=="people"){
				listenPeople(message,data,this);
			}
			else{
				console.log("PeopleModel: call not understood");
			}
		}
	}

	function listenGroups(message,data,This){
								var module=This.module;
		if(message.sub=="create_new_group"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_create_group.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="get_groups_of_user"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_get_groups_of_user.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="get_group_details"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_get_group_details.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="get_group_members"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_get_group_members.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="search_users"){
			console.log(data);
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_search_users.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				backpack.data.id=data.id;
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="add_user_to_group"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_add_member_to_group.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
	}
	
	function listenPeople(message,data,This){
								var module=This.module;
		if(message.sub=="search_users_groups"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_search_users_groups.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="get_user_details"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_get_user_details.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="join_group"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_create_join_group.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
		else if(message.sub=="join_delete_from_group"){
			var Data='data='+encodeURIComponent(JSON.stringify(data));
			$.ajax(This.master.database+'db_user_delete_join.php',{data:Data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				module.view.listen(message.callback,backpack);
			}});
		}
	}
	
	return PeopleModel;
});