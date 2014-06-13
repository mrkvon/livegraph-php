define([],function () {
	"use strict";
	/*
	 * TODO:description
	 */
	
	function Template(dom){
		var main=$(document.createElement('div')).appendTo(dom).css({'border':'1px solid blue','background-color':'white','z-index':'15'});
		var username=$(document.createElement('span')).appendTo(main).css({'font-weight':'bold'});
		
		return {main:main,username:username};
	}
	
	function UserHint(userData,parent,dom){
		this.dom=Template(dom);
		this.parent=parent;
		this.module=parent.module;
		this.master=parent.master;
		
		this.username=userData.username;
		
		this.dom.username.append(document.createTextNode(userData.username));
		
		(function(This){
//			 This.dom.main.on('mouseup',function(){
// 				This.module.controller.listen({main:"rights",sub:"mouseup_user_hint",callback:{main:"rights",sub:""}},
// 																				{id:This.parent.parent.parent.id,username:This.username});
//			 });
			
			This.dom.main.on('mouseup',function(e){
				e.preventDefault();e.stopPropagation();
				This.module.controller.listen("submit_labelRights_add_user_form",{username:This.username,uuid:This.parent.parent.parent.uuid});
				return false;
			});
			
		})(this);
		
		return this;
	}
	
	
	UserHint.prototype = {
		constructor: UserHint,
		remove:function(){
			this.dom.main.remove();
		}
	};
		
	return UserHint;
});