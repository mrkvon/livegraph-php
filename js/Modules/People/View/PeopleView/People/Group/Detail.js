define(['./../User','./Detail/AddMemberForm'],function(User,AddMemberForm){
  
  function Template(dom){
    var wrapper=$(document.createElement('div'))
    .appendTo(dom)
    .css({position:"fixed",height:"100%",width:"100%",top:"0px",left:"0px",'background-color':"rgba(0,0,0,0.7)","z-index":"12"});
    var main=$(document.createElement('div'))
    .appendTo(wrapper)
    .css({position:"relative",width:"60%","margin":"auto",padding:"10px",top:"10%","min-height":"50%",'background-color':"white"});
    //name && id
    var basicInfo=$(document.createElement('div')).appendTo(main).css({});
    var name=$(document.createElement('span')).appendTo(basicInfo).css({'font-weight':'bold'});
    basicInfo.append(document.createTextNode(' ('));
    var id=$(document.createElement('span')).appendTo(basicInfo).css({});
    basicInfo.append(document.createTextNode(')'));
    
    //in this div there should be a button: either MEMBER or JOIN or AWAITING
    var membershipButtonDiv=$(document.createElement('div')).appendTo(main).css({});
    
    
    
    var joined=$(document.createElement('div')).appendTo(basicInfo).css({});
    //var members=$(document.createElement('div')).appendTo(basicInfo).css({});
    var buttonShowMembers=$(document.createElement('button')).appendTo(main).css({}).append(document.createTextNode('show members'));
    var buttonAddMember=$(document.createElement('button')).appendTo(main).css({}).append(document.createTextNode('add member'));
    var wrapperAddMember=$(document.createElement('div')).appendTo(main).css({position:"absolute"});
    var close=$(document.createElement('button'))
    .appendTo(main)
    .css({'background-color':"red",position:"absolute",top:"0px",right:"0px"})
    .append(document.createTextNode('xxx'));
    var admin=$(document.createElement('div')).appendTo(basicInfo).css({});
    var members=$(document.createElement('div')).appendTo(main).css({});
    var awaiting=$(document.createElement('div')).appendTo(main);
    return {
      wrapper:wrapper,
      main:main,
      close:close,
      info:{main:basicInfo,name:name,id:id,joined:joined,members:members},
      buttons:{addMember:buttonAddMember,showMembers:buttonShowMembers},
      wrapperAddMember:wrapperAddMember,
      admin:admin,
      membership:membershipButtonDiv,
      awaiting:awaiting
    };
  }
  
  function Detail(groupData,parent,dom){
    this.dom=Template(dom);
    this.parent=parent;
    this.module=parent.module;
    
    this.id=groupData.id;
    
    this.users={};
    this.groups={};
    this.awaiting={};
//     this.id=groupData.id;
    
    this.dom.info.name.append(document.createTextNode(groupData.name));
    this.dom.info.id.append(document.createTextNode(groupData.id));
    this.dom.info.joined.append(document.createTextNode('joined '+groupData.joined));
    this.dom.info.members.append(document.createTextNode('members: '+groupData.member_count));
    if(groupData.admin){
      this.dom.admin.append(document.createTextNode('you are admin'));
    }
    
    if(groupData.member){
      this.addMemberButton();
      if(groupData.admin){
	this.dom.awaiting.css({border:"1px solid #bfb"});
	this.dom.awaiting.append(document.createTextNode('users who want to join:'));
	for(var username in groupData.awaiting){
	  console.log(username);
	  var wuserData=groupData.awaiting[username];
	  this.addJoiner(wuserData);
	}
      }
    }
    else if(groupData.awaiting){
      this.addAwaitingButton();
    }
    else{
      this.addJoinButton();
    }
    
    (function(This){
      //close the detail on click x
      This.dom.close.on('mouseup',function(){
	This.remove();
      });
      //close the Detail on Esc
      $(window).on('keyup',function(e){
	if(e.keyCode==27){
	  e.stopPropagation();
	  This.remove();
	}
      });
      //show members on mouseup showMembers button.
      This.dom.buttons.showMembers.on('mouseup',function(){
	This.module.controller.listen({main:"groups",sub:"click_show_members",callback:{main:"groups",sub:"show_group_members"}},
				      {id:This.parent.id});
      });
      This.dom.buttons.addMember.on('mouseup',function(){
	if(!This.addMemberForm){
	  This.addMemberForm=new AddMemberForm(This,This.dom.wrapperAddMember);
	}
	else{
	  This.addMemberForm.remove();
	  delete This.addMemberForm;
	  This.dom.wrapperAddMember.empty();
	}
      });
      
    })(this);
  }
  
  Detail.prototype={
    constructor:Detail,
    remove:function(){
      this.dom.wrapper.remove();
      delete this.parent.detail;
    },
    addUser:function(userData){
      if(this.users[userData.username]){
	this.users[userData.username].remove();
      }
      this.removeJoiner(userData.username);
      console.log(userData);
      var user=new User(userData,this,this.dom.info.members);
      this.users[userData.username]=user;
    },
    addGroup:function(groupData){
      console.log(groupData);
    },
    addMemberButton:function(){
      this.dom.membership.empty();
      $(document.createElement('button'))
      .append(document.createTextNode('MEMBER'))
      .css({height:'20px','border-radius':'5px','background-color':'#bfb','font-weight':'bold'})
      .appendTo(this.dom.membership);
      
    },
    addJoinButton:function(){
      this.dom.membership.empty();
      var joinButton=Template(this.dom.membership).main;
      (function(This){
	joinButton.on('mouseup',function(){
	  This.module.controller.listen({main:"people",sub:"group_detail_mouseup_join",
					callback:{main:"groups",sub:"join_group",target:This}},
					{id:This.id});
	});
      })(this);
      
      function Template(dom){
	var main=$(document.createElement('button'))
	.append(document.createTextNode('JOIN'))
	.css({height:'20px','border-radius':'5px','background-color':'#fbb','font-weight':'bold'})
	.appendTo(dom);
	return {main:main};
      }
    },
    addAwaitingButton:function(){
      this.dom.membership.empty();
      $(document.createElement('button'))
      .append(document.createTextNode('AWAITING'))
      .css({height:'20px','border-radius':'5px','background-color':'#bbf','font-weight':'bold'})
      .appendTo(this.dom.membership);
    },
    addJoiner:function(userData){
      this.removeJoiner(userData.username);
      this.awaiting[userData.username]=new Joiner(userData,this,this.dom.awaiting);
    },
    removeJoiner:function(username){
      if(this.awaiting[username]){
	this.awaiting[username].remove();
	delete this.awaiting[username];
      }
    }
  };
  
  function Joiner(userData,parent,dom){
    this.parent=parent;
    this.module=parent.module;
    this.username=userData.username;
    this.dom=Template(dom);
    
    this.dom.username.append(document.createTextNode(userData.username));
    
    (function(This){
      This.dom.buttons.add.on('mouseup',function(){
	console.log('add '+This.username+' in '+This.parent.id);
	This.module.controller.listen({main:"people",sub:"joiner_add_mouseup",
				      callback:{main:"groups",sub:"show_group_members",target:This.parent}},
				      {username:This.username,id:This.parent.id}
	);
      });
      This.dom.buttons.cancel.on('mouseup',function(){
	console.log('cancel '+This.username+' in '+This.parent.id);
	This.module.controller.listen({main:"people",sub:"joiner_cancel_mouseup",
				      callback:{main:"groups",sub:"remove_joiner",target:This.parent}},
				      {username:This.username,id:This.parent.id}
	);
      });
    })(this);
    
    function Template(dom){
      var main=$(document.createElement('div'))
      .css({border:"1px solid #8f8"})
      .appendTo(dom);
      var username=$(document.createElement('span'))
      .css({'font-weight':"bold"})
      .appendTo(main);
      var addButton=$(document.createElement('button'))
      .css({'background-color':"#afa",'margin-left':"5px",padding:"3px",'border-radius':"5px"})
      .append(document.createTextNode("add"))
      .appendTo(main);
      var cancelButton=$(document.createElement('button'))
      .css({'background-color':"#faa",'margin-left':"5px",padding:"3px",'border-radius':"5px"})
      .append(document.createTextNode("cancel"))
      .appendTo(main);
      return {main:main, username:username, buttons:{add:addButton,cancel:cancelButton}};
    }
  }
  
  Joiner.prototype={
    constructor:Joiner,
    remove:function(){
      this.dom.main.remove();
    }
  };
  
  return Detail;
});