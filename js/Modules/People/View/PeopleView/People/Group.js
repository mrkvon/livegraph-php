define(['./Group/Detail','jquery'],function(Detail,$){
  
  function Template(dom){
    var main=$(document.createElement('div')).css({border:"1px solid gray",margin:"3px",position:"relative"}).appendTo(dom);
    var name=$(document.createElement('span')).css({'font-weight':'bold'}).appendTo(main);
    var infoButton=$(document.createElement('button')).appendTo(main).append(document.createTextNode('info')).css({'background-color':'blue','font-color':'white'});
    return {main:main,name:name,infoButton:infoButton};
  }
  
  
  function Group(groupData,parent,dom){ //groupData:{name:string,id:string,admin:true/false}
    this.dom=Template(dom);
    console.log('here');
    this.parent=parent;
    this.module=parent.module;
    this.id=groupData.id;
    
    //put data in
    this.dom.name.append($(document.createTextNode(groupData.name+' '))).append($(document.createTextNode(groupData.id)));
    
    //listeners
    (function(This){
      This.dom.infoButton.on('mouseup',function(){
	This.module.controller.listen({main:"groups",sub:"click_group_info",callback:{main:"groups",sub:"show_group_details",target:This}},{id:This.id});
	console.log('implement group details '+This.id);
      });
    })(this);
  }
  
  Group.prototype={
    constructor:Group,
    remove:function(){
      this.dom.main.remove();
      delete this.parent.groups[this.id];
    },
    makeDetail:function(groupData){
      if(this.detail){this.detail.remove();};
      this.detail=new Detail(groupData,this,this.dom.main);
    }
  }
  
  return Group;
});