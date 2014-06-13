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
    this.module=this.parent.module;
    this.username=userData.username;
    
    this.dom.username.append(document.createTextNode(userData.username));
    
    (function(This){
      This.dom.main.on('mouseup',function(){
	This.module.controller.listen({main:"groups",sub:"mouseup_user_hint",callback:{main:"groups",sub:"show_group_members"}},
					{id:This.parent.parent.parent.id,username:This.username});
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