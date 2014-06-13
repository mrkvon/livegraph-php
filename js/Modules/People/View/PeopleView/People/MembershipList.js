define(['./Group','jquery'],function(Group,$){
  
  "use strict";
  
  function Template(dom){
    var main=$(document.createElement('div')).appendTo(dom).css({position:'relative',overflow:'auto'});
    return {main:dom};
  }
  
  function MembershipList(parent,dom){
    this.dom=Template(dom);
    this.parent=parent;
    this.module=parent.module;
    
    this.groups={};
    
    this.module.controller.listen({main:"groups",sub:"get_groups_of_user",callback:{main:"groups",sub:"add_groups_to_membership_list"}},{});
    
  }
  
  MembershipList.prototype={
    constructor:MembershipList,
    addGroup:function(groupData){
      if(this.groups[groupData.id]){
	this.groups[groupData.id].remove();
      }
      var group;
      (function(This){
	console.log(This.dom.main);
	group=new Group(groupData,This,This.dom.main);
      })(this);
      this.groups[groupData.id]=group;
    }
  };
  
  return MembershipList;
});