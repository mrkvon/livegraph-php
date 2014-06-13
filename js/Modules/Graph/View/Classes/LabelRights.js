define(['./LabelRights/Template','./LabelRights/LabelRightsUser','./LabelRights/LabelRightsGroup','./LabelRights/UserHint','./LabelRights/GroupHint','jquery'],function (LRT,LabelRightsUser,LabelRightsGroup,UserHint,GroupHint,$) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	* 
	* LabelRights object is for showing and granting rights to users in the Label object.
	* 
	*/
	function LabelRights(parent,dom){
		this.dom=LRT(dom);
//		 console.log(parent);
//		 this.dom.inputUsername.attr({list:"username_list_"+parent.parent.uuid});
//		 this.dom.usernameList.attr({id:"username_list_"+parent.parent.uuid});
		
		this.parent=parent;
		this.module=parent.module;
		this.master=parent.master;
		
		this.users={};//username:LabelRightsUser object
		this.groups={};
		this.userHints={};
		this.groupHints={};
		
		(function(This){

			This.dom.inputUsername.on('keyup',function(e){
				e.preventDefault();e.stopPropagation();
				var text=This.dom.inputUsername.val();
				if(e.keyCode==27){
					This.clearHintList();
				}
				else if(text.length>0){
					This.module.controller.listen({main:"rights",sub:"keyup_input_username",
																callback:{main:"rights",sub:"usernamelist_show_users",target:This}},
																{uuid:This.parent.parent.uuid,text:text});
				}
				else{
					This.clearHintList();
				}
			});
			
			This.dom.group.input.on('keyup',function(e){
				e.preventDefault();e.stopPropagation();
				var text=This.dom.group.input.val();
				if(e.keyCode==27){
					This.clearGroupHintList();
				}
				else if(text.length>0){
						This.module.controller.listen({main:"rights",sub:"keyup_input_group",
																	callback:{main:"rights",sub:"grouplist_show_groups",target:This}},
																	{uuid:This.parent.parent.uuid,text:text});
				}
				else{
					This.clearGroupHintList();
				}
			});
			
		})(this);
		
		
		return this;
	}
	
	
	LabelRights.prototype = {
		constructor: LabelRights,
		newHintList: function(usersData){
			var uList=this.dom.usernameList;
			this.clearHintList();
			console.log(usersData);
			for(var username in usersData){
				var userHint=new UserHint(usersData[username],this,this.dom.usernameList);
				this.userHints[username]=userHint;
			}
//			 for(var i=0;i<users.length;i++){
// 				var option=$(document.createElement('option')).appendTo(this.dom.usernameList)
// 				.attr({value:users[i].username});
//			 }
		},
		clearHintList:function(){
			for(var username in this.userHints){
				this.userHints[username].remove();
				delete this.userHints[username];
			}
			this.dom.usernameList.empty();
		},
		newGroupHintList:function(groupsData){
			var gList=this.dom.group.hint;
			this.clearGroupHintList();
			for(var id in groupsData){
				var groupHint=new GroupHint(groupsData[id],this,gList);
				this.groupHints[id]=groupHint;
				//gList.append($(document.createElement('div')).append(document.createTextNode(groupsData[id].name+' '+groupsData[id].id)));
			}
		},
		clearGroupHintList:function(){
			for(var id in this.groupHints){
				this.groupHints[id].remove();
				delete this.groupHints[id];
			}
			this.dom.group.hint.empty();
		},
		addUser: function(userGrant,userMe){
			if(this.users[userGrant.username]){
				this.users[userGrant.username].remove();
			}
			
			var user=new LabelRightsUser(userGrant,userMe,this,this.dom.userDiv);
			this.users[userGrant.username]=user;
		},
		addGroup: function(groupGrant,userMe){
			if(this.groups[groupGrant.id]){
				this.groups[groupGrant.id].remove();
			}
			
			var group=new LabelRightsGroup(groupGrant,userMe,this,this.dom.group.div);
			this.groups[groupGrant.id]=group;
		},
		remove: function(){
			this.dom.main.remove();
		}
	};
	
	return LabelRights;
});