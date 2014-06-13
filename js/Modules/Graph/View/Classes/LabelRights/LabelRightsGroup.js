define(['jquery'],function ($) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	* 
	* LabelRights object is for showing and granting rights to users in the Label object.
	* 
	*/
	function LabelRightsGroup(groupGrant,userMe,parent,dom){
		
		var main=$(document.createElement('div')).appendTo(dom).append($(document.createTextNode(groupGrant.id)));
		var form=$(document.createElement('form')).appendTo(main);
		
		var have=0;
		var give=0;
		
		userMe.give=userMe.have;
		groupGrant.give=groupGrant.have;
		
		if(userMe.give=='o'){give=3;}
		else if(userMe.give=='w'){give=2;}
		else if(userMe.give=='r'){give=1;}
		else{give=0;}
		
		if(groupGrant.have=='o'){have=3;}
		else if(groupGrant.have=='w'){have=2;}
		else if(groupGrant.have=='r'){have=1;}
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
		
		
		this.id=groupGrant.id;
		
		(function(This){
			This.dom.form.on('submit',function(e){
				e.preventDefault();
				var checked;
				var rh=This.dom.radioHave;
				for(var rg in rh){
					console.log(rh[rg].is(':checked')+rh[rg].val());
					if(rh[rg].is(":checked")){checked=rh[rg].val()};
				}
				
				This.module.controller.listen({main:"rights",sub:"submit_group_grant_rights",callback:{}},
																 {id:This.id,uuid:This.parent.parent.parent.uuid,have:checked,give:"n"});
				return false;
			});
		})(this);
		
		return this;
	}
	
	
	LabelRightsGroup.prototype = {
		constructor: LabelRightsGroup,
		remove:function(){
			this.dom.main.remove();
			delete this.parent.groups[this.username];
		}
	};
	
	return LabelRightsGroup;
});