define([],function () {
	"use strict";
	/*
	 * TODO:description
	 */
	
	function Template(dom){
		var main=$(document.createElement('div')).appendTo(dom).css({'border':'1px solid red','background-color':'white'});
		var name=$(document.createElement('span')).appendTo(main).css({'font-weight':'bold'});
		main.append(document.createTextNode(' '));
		var id=$(document.createElement('span')).appendTo(main).css({});
		
		return {main:main,name:name,id:id};
	}
	
	function GroupHint(userData,parent,dom){
		this.dom=Template(dom);
		this.parent=parent;
		this.master=parent.master;
		this.module=parent.module;
		
		this.name=userData.name;
		this.id=userData.id;
		
		this.dom.name.append(document.createTextNode(userData.name));
		this.dom.id.append(document.createTextNode(userData.id));
		
		(function(This){
//			 This.dom.main.on('mouseup',function(){
// 				This.module.controller.listen({main:"rights",sub:"mouseup_user_hint",callback:{main:"rights",sub:""}},
// 																				{id:This.parent.parent.parent.id,username:This.username});
//			 });
			
			This.dom.main.on('mouseup',function(e){
				e.preventDefault();e.stopPropagation();
				This.module.controller.listen({main:"rights",sub:"mouseup_group_hint",callback:{main:"rights",sub:"group_div_show_group",target:This.parent}},{id:This.id,uuid:This.parent.parent.parent.uuid});
				return false;
			});
			
		})(this);
		
		return this;
	}
	
	
	GroupHint.prototype = {
		constructor: GroupHint,
		remove:function(){
			this.dom.main.remove();
		}
	};
		
	return GroupHint;
});