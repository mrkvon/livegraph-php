define(['./AddMemberForm/UserHint'],function(UserHint){
  
  function Template(dom){
    var main=$(document.createElement('div')).appendTo(dom);
    var form=$(document.createElement('form')).appendTo(main);
    var input=$(document.createElement('input'))
    .appendTo(form)
    .css({border:"1px solid grey"})
    .attr({placeholder:"add member"});
    var hint=$(document.createElement('div')).appendTo(form)
    .css({position:'absolute','background-color':'white'});
    var addButton=$(document.createElement('input')).attr({type:'submit',value:'add to group'})
    .appendTo(form);
    
    return {main:main,form:form,input:input,hint:hint};
  }
  
  function AddMemberForm(parent,dom){
    this.dom=Template(dom);
    this.parent=parent;
    this.module=parent.module;
    this.hint;
    
    (function(This){
      This.dom.form.on('submit',function(e){
	e.preventDefault();
	e.stopPropagation();
	console.log(This.dom.input.val());
// 	This.module.controller.listen({main:"groups",sub:"submit_add_member",callback:{main:"groups",sub:"show_group_members"}},
// 				      {id:This.parent.id});
      });
      This.dom.input.on('keyup',function(){
	var stringy=This.dom.input.val();
	if(stringy.length>0){
	console.log(This.parent.parent.id);
	  This.module.controller.listen({main:"groups",sub:"keyup_add_member",callback:{main:"groups",sub:"hint_users"}},
					{text:stringy,id:This.parent.parent.id});
	}
	else{
	  This.clearHint();
	};
      });
    })(this);
  }
  
  AddMemberForm.prototype={
    constructor:AddMemberForm,
    remove:function(){
      this.dom.main.remove();
    },
    clearHint:function(){
      for(var hintname in this.hint){
	this.hint[hintname].remove();
	delete this.hint[hintname];
      }
    },
    hint:function(usersData){
      this.clearHint();
      for(var username in usersData){
	if(this.hint[username]){this.hint[username].remove();delete this.hint[username];}
	this.hint[username]=new UserHint(usersData[username],this,this.dom.hint);
      }
    }
  };
  
  
  return AddMemberForm;
});