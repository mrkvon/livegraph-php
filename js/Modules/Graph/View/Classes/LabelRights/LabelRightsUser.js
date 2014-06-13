define(['jquery'],function ($) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	* 
	* LabelRights object is for showing and granting rights to users in the Label object.
	* 
	*/
	function LabelRightsUser(userGrant,userMe,parent,dom){
		
		var main=$(document.createElement('div')).appendTo(dom).append($(document.createTextNode(userGrant.username)));
		var form=$(document.createElement('form')).appendTo(main);
		
		var have=0;
		var give=0;
		
		userMe.give=userMe.have;
		userGrant.give=userGrant.have;
		
		if(userMe.give=='o'){give=3;}
		else if(userMe.give=='w'){give=2;}
		else if(userMe.give=='r'){give=1;}
		else{give=0;}
		
		if(userGrant.have=='o'){have=3;}
		else if(userGrant.have=='w'){have=2;}
		else if(userGrant.have=='r'){have=1;}
		else{have=0;}
		
		var radioHaveObject={};
		if(give>=3&&have<=3){
			$(document.createTextNode('o')).appendTo(form);
			var radio=$(document.createElement('input')).appendTo(form)
			.attr({type:'radio',name:'have',value:'o'});
			if(have==3){
				radio.attr({"checked":"checked"});
			}
			radioHaveObject.o=radio;
		}
		if(give>=2&&have<=2){
			$(document.createTextNode('w')).appendTo(form);
			var radio=$(document.createElement('input')).appendTo(form)
			.attr({"type":"radio","name":"have","value":"w"});
			if(have==2){
				radio.attr("checked","checked");
			}
			radioHaveObject.w=radio;
		}
		if(give>=1&&have<=1){
			$(document.createTextNode('r')).appendTo(form);
			var radio=$(document.createElement('input')).appendTo(form)
			.attr({"type":"radio","name":"have","value":"r"});
			if(have==1){
				radio.attr("checked","checked");
			}
			radioHaveObject.r=radio;
		}
		if(give>=0&&have<=0){
			$(document.createTextNode('n')).appendTo(form);
			var radio=$(document.createElement('input')).appendTo(form)
			.attr({"type":"radio","name":"have","value":"n"});
			if(have==0){
				radio.attr("checked","checked");
			}
			radioHaveObject.n=radio;
		}
		
		//button for submitting grant...
		var grantButton=$(document.createElement('button')).appendTo(form).append(document.createTextNode("grant"));
		
		this.dom={main:main,form:form,radioHave:radioHaveObject};
		this.parent=parent;
		this.module=parent.module;
		this.master=parent.master;
		
		this.username=userGrant.username;
		
		(function(This){
			This.dom.form.on('submit',function(e){
				e.preventDefault();
				var checked;
				var rh=This.dom.radioHave;
				for(var rg in rh){
					console.log(rh[rg].is(':checked')+rh[rg].val());
					if(rh[rg].is(":checked")){checked=rh[rg].val()};
				}
				
				This.module.controller.listen("submit_grant_rights_form",{username:This.username,uuid:This.parent.parent.parent.uuid,have:checked,give:"n"});
				return false;
			});
		})(this);
		
		return this;
	}
	
	
	LabelRightsUser.prototype = {
		constructor: LabelRightsUser,
		remove:function(){
			this.dom.main.remove();
			delete this.parent.users[this.username];
		}
	};
	
	return LabelRightsUser;
});