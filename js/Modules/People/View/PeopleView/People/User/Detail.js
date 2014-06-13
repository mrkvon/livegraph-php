define(['./../User'],function(User,AddMemberForm){
  
  function Template(dom){
    var wrapper=$(document.createElement('div'))
    .appendTo(dom)
    .css({position:"fixed",height:"100%",width:"100%",top:"0px",left:"0px",'background-color':"rgba(0,0,0,0.7)","z-index":"12"});
    var main=$(document.createElement('div'))
    .appendTo(wrapper)
    .css({position:"relative",width:"60%","margin":"auto",padding:"10px",top:"10%","min-height":"50%",'background-color':"white"});
    var basicInfo=$(document.createElement('div')).appendTo(main).css({});
    var username=$(document.createElement('div')).appendTo(basicInfo).css({'font-weight':'bold'});
    var joined=$(document.createElement('div')).appendTo(basicInfo).css({});
    var info=$(document.createElement('div')).appendTo(basicInfo).css({});
    var website=$(document.createElement('div')).appendTo(basicInfo).css({});
//     var buttonShowMembers=$(document.createElement('button')).appendTo(main).css({}).append(document.createTextNode('show members'));
//     var buttonAddMember=$(document.createElement('button')).appendTo(main).css({}).append(document.createTextNode('add member'));
//     var wrapperAddMember=$(document.createElement('div')).appendTo(main).css({position:"absolute"});
    var close=$(document.createElement('button'))
    .appendTo(main)
    .css({'background-color':"red",position:"absolute",top:"0px",right:"0px"})
    .append(document.createTextNode('xxx'));
    return {
      wrapper:wrapper,
      main:main,
      close:close,
      info:{main:basicInfo,username:username,joined:joined,info:info,website:website},
      buttons:{}
    };
  }
  
  function Detail(userData,parent,dom){
    this.dom=Template(dom);
    this.parent=parent;
    this.module=parent.module;
    
    this.groups={};
//     this.id=userData.id;
    
    this.dom.info.username.append(document.createTextNode(userData.username));
    this.dom.info.joined.append(document.createTextNode('joined '+userData.joined));
    this.dom.info.info.append(document.createTextNode('info: '+userData.info));
    this.dom.info.website.append(document.createTextNode('website: '+userData.website));
    
    (function(This){
      //close the detail on click x
      This.dom.close.on('mouseup',function(e){
	e.stopPropagation();
	e.preventDefault();
	This.remove();
      });
      //close the Detail on Esc
      $(window).on('keyup',function(e){
	if(e.keyCode==27){
	  e.stopPropagation();
	  This.remove();
	}
      });
      
    })(this);
  }
  
  Detail.prototype={
    constructor:Detail,
    remove:function(){
      this.dom.wrapper.remove();
      delete this.parent.detail;
    }
  }
  
  return Detail;
});