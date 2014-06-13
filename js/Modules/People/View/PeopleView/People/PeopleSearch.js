define(['jquery'],function ($) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * PeopleSearch object is for showing and granting rights to users in the Label object.
  * 
  */
  
  function Template(dom){
    var main=$(document.createElement('div')).appendTo($(dom))
    .css({'background-color':'white','z-index':'15'});
    
    //title
    //var title=$(document.createElement('h2')).appendTo(main).append(document.createTextNode('search people and groups'));
    
    var form=$(document.createElement('form')).appendTo(main);
    var input=$(document.createElement('input')).appendTo(form)
    .attr({placeholder:"search people & groups"})
    .css({border:"2px solid #a9f",margin:"5px",padding:"2px",'border-radius':"6px"});
    var hintList=$(document.createElement('div')).appendTo(main)
    .css({position:"absolute",'z-index':"20"});
    
    return {main:main,form:form,input:input,hintList:hintList};
  }
  
  
  function PeopleSearch(parent,dom){
    this.dom=Template(dom);

    this.parent=parent;
    this.module=this.parent.module;
    
    this.hintList;

    
    (function(This){
      This.dom.input.on('keyup',function(e){
	e.preventDefault();
	e.stopPropagation();
	var text=This.dom.input.val();
	if(e.keyCode==27){
	  This.clearHintList();
	}
	else if(text.length>0){
	  This.module.controller.listen({main:"people",sub:"keyup_search_users_groups",callback:{main:"people",sub:"search_make_hint_list",target:This}},{text:text});
	}
	else{
	  This.clearHintList();
	}
      });
    })(this);
    
    return this;
  }
  
  
  PeopleSearch.prototype = {
    constructor: PeopleSearch,
    newHintList: function(data){
      this.clearHintList();
      this.hintList=new HintList(this,this.dom.hintList);
      for(var username in data.users){
	this.hintList.addUserHint(data.users[username]);
      }
      for(var id in data.groups){
	this.hintList.addGroupHint(data.groups[id]);
      }
//       var uList=this.dom.usernameList;
//       this.clearHintList();
//       console.log(usersData);
//       for(var username in usersData){
// 	var userHint=new UserHint(usersData[username],this,this.dom.usernameList);
// 	this.userHints[username]=userHint;
//       }
//       for(var i=0;i<users.length;i++){
// 	var option=$(document.createElement('option')).appendTo(this.dom.usernameList)
// 	.attr({value:users[i].username});
//       }
    },
    clearHintList:function(){
//       for(var username in this.userHints){
// 	this.userHints[username].remove();
// 	delete this.userHints[username];
//       }
      if(this.hintList){
	this.hintList.remove();
      }
      this.dom.hintList.empty();
    },
    remove: function(){
      this.dom.main.remove();
    }
  };
  
  
  function HintList(parent,dom){
    this.dom=Template(dom);
    this.parent=parent;
    this.module=parent.module;
    this.users={};
    this.groups={};
    
    function Template(dom){
      var main=$(document.createElement('div'))
      .appendTo(dom)
      .css({'background-color':"#def",border:"1px solid #abc",'z-index':20});
      var users=$(document.createElement('div'))
      .appendTo(main)/*.append(document.createTextNode("people"))*/;
      
      var groups=$(document.createElement('div'))
      .appendTo(main)/*.append(document.createTextNode("groups"))*/;
      
      return {main:main,users:users,groups:groups};
    }
  }
  
  HintList.prototype={
    constructor:HintList,
    remove:function(){
      this.dom.main.remove();
    },
    addUserHint:function(userData){ //{username:...,}
      var username=userData.username;
      if(this.users[username]){
	this.users[username].remove();
	delete this.users[username];
      }
      this.users[username]=new UserHint(parent,this.dom.users,userData);
    },
    addGroupHint:function(groupData){ //{name:...,id:...}
      var groupId=groupData.id;
      if(this.groups[groupId]){
	this.groups[groupId].remove();
	delete this.groups[groupId];
      }
      this.groups[groupId]=new GroupHint(this,this.dom.groups,groupData);
    }
  };
  
  
  function UserHint(parent,dom,userData){
    this.parent=parent;
    this.module=parent.module;
    this.dom=Template(dom);
    this.username=userData.username;
    
    //adding name
    this.dom.username.append(document.createTextNode(userData.username));
    
    function Template(dom){
      var main=$(document.createElement('div')).appendTo(dom)
      .css({'background-color':"#afb",border:"1px solid #8e9",margin:"2px",'z-index':"20"});
      var username=$(document.createElement('span')).appendTo(main);
      return {main:main,username:username};
    }
  };
  
  UserHint.prototype={
    constructor:UserHint,
    remove:function(){
      this.dom.main.remove();
    }
  };
  
  function GroupHint(parent,dom,groupData){
    this.parent=parent;
    this.module=parent.module;
    this.dom=Template(dom);
    this.id=groupData.id;
    
    //add name and id
    this.dom.name.append(document.createTextNode(groupData.name));
    this.dom.id.append(document.createTextNode(groupData.id));
    
    (function(This){
      This.dom.main.on('mouseup',function(){
	console.log(This);
	This.module.controller.listen({main:"groups",sub:"click_group_info",callback:{main:"groups",sub:"show_group_details",target:This.module.view.people}},{id:This.id});
      });
    })(this);
    
    function Template(dom){
      var main=$(document.createElement('div')).appendTo(dom)
      .css({'background-color':"#fab",border:"1px solid #e89",margin:"2px"});
      var name=$(document.createElement('div')).appendTo(main)
      .css({'font-weight':"bold"});
      var id=$(document.createElement('div')).appendTo(main);
      return {main:main,name:name,id:id};
    }
  }
  
  GroupHint.prototype={
    constructor:GroupHint,
    remove:function(){
      this.dom.main.remove();
    }
  }
  
  return PeopleSearch;
});