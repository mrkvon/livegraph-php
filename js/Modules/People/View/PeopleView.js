define(['./PeopleView/People','jquery'],function(People,$){
	
	

	
	function Icon(dom){
		var img=$(document.createElement('img')).appendTo(dom);
		img.attr('src','/img/people_icon.png');
		img.css({"z-index":'5',"height":"30px","position":"fixed","top":"5px","right":"5px"});
		
		

		return img;
	}
	
	function PeopleView(menu,app,module){
		
		this.module=module;
		this.people;
		
		var img=Icon(menu);
		
		//img listeners
		(function(This){
			img.on("mouseup",function(){
				This.people?This.close():This.open(app);
			});
		})(this);
		
	}
	
	PeopleView.prototype = {
		constructor: PeopleView,
		open:function(dom){
			console.log('opening people');
			this.people=new People(this,dom);
		},
		close:function(){
			this.people.remove();
			delete this.people;
			console.log('closing people');
		},
		listen:function(message,data){
			console.log('view listening');
			console.log(message);
			if(message&&message.main=="groups"){
				listenGroups(message,data,this);
			}
			else if(message&&message.main=="people"){
				listenPeople(message,data,this);
			}
			else{
				console.log("PeopleView listen: call not caught");
			}
		}
	};
	
	function listenGroups(message,data,This){
		if(message.sub=="add_group_to_membership_list"){
			if(data && data.error==0 && data.data){
				This.people.membershipList.addGroup(data.data);
			}
		}
		else if(message.sub=="add_groups_to_membership_list"){
			if(data && data.error===0 && data.data){
				for(var id in data.data){
					This.people.membershipList.addGroup(data.data[id]);
				}
			}
		}
		else if(message.sub=="show_group_details"){
			if(data && data.error===0 && data.data){
				console.log(data.data.id);
				if(message.target.makeDetail){
					message.target.makeDetail(data.data);
				}
				else{
					console.log(message.target);
					message.target.showGroup(data.data);
				}
			}
		}
		else if(message.sub=="show_group_members"){
			if(data && data.error===0 && data.data){
				var parentGroup=data.data.parent.id
				for(var username in data.data.users){
					if(This.people.membershipList.groups[parentGroup]){
						This.people.membershipList.groups[parentGroup].detail.addUser(data.data.users[username]);
					}
					else{
						message.target.addUser(data.data.users[username]);
					}
				}
				for(var id in data.data.groups){
					This.people.membershipList.groups[parentGroup].detail.addGroup(data.data.users[username]);
				}
			}
		}
		else if(message.sub=="hint_users"){
			if(data && data.error===0 && data.data){
				if(This&&This.people&&This.people.membershipList&&
					This.people.membershipList.groups[data.data.id]&&This.people.membershipList.groups[data.data.id].detail&&
					This.people.membershipList.groups[data.data.id].detail.addMemberForm){
					This.people.membershipList.groups[data.data.id].detail.addMemberForm.hint(data.data.users);
				}
			}
		}
		else if(message.sub=="join_group"){
			if(data && data.error===0 && data.data){
				console.log('implement!');
				if(data.data.awaiting){
					message.target.addAwaitingButton();
				}
			}
		}
		else if(message.sub=="remove_joiner"){
			if(data && data.error===0 && data.data){
				console.log('implement!');
				if(data.data.deleted>0){
					console.log(data.data.username);
					message.target.removeJoiner(data.data.username);
				}
			}
		}
	}
	
	function listenPeople(message,data,This){
		if(message.sub=="search_make_hint_list"){
			if(data && data.error==0 && data.data){
				message.target.newHintList(data.data);
			}
		}
		else if(message.sub=="show_user_details"){
			if(data && data.error===0 && data.data){
				message.target.makeDetail(data.data);
			}
		}
	}
	
	return PeopleView;
});
