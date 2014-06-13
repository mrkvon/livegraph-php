define(['./User/Detail','jquery'],function(Detail,$){
  
  function Template(dom){
    var main=$(document.createElement('div')).css({border:"1px solid gray",margin:"3px",position:"relative"}).appendTo(dom);
    var username=$(document.createElement('span')).css({'font-weight':'bold'}).appendTo(main);
    var infoButton=$(document.createElement('button')).appendTo(main).append(document.createTextNode('info')).css({'background-color':'blue','font-color':'white'});
    return {main:main,username:username,infoButton:infoButton};
  }
  
  
  function User(userData,parent,dom){ //userData:{username:string}
    this.dom=Template(dom);
    console.log('here');
    this.parent=parent;
    this.module=parent.module;
    this.username=userData.username;
    this.detail;
    
    //put data in
    this.dom.username.append($(document.createTextNode(userData.username+' ')));
    
    //listeners
    (function(This){
      This.dom.infoButton.on('mouseup',function(){
	This.module.controller.listen({main:"people",sub:"click_user_info",callback:{main:"people",sub:"show_user_details",target:This}},{username:This.username});
	console.log('implement user details '+This.username);
      });
    })(this);
  }
  
  User.prototype={
    constructor:User,
    remove:function(){
      this.dom.main.remove();
      delete this.parent.users[this.username];
    },
    makeDetail:function(userData){
      if(this.detail){this.detail.remove();};
      this.detail=new Detail(userData,this,this.dom.main);
    }
  }
  
  return User;
});