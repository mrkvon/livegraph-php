define(['./People/MembershipList','./People/PeopleSearch','./People/Group/Detail',"jquery"],function (MembershipList,PeopleSearch,GroupDetail,$) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  */
  
  /*
   * TODO:description
   */
  function Template(dom){
    var wrapper=$(document.createElement('div'))
    .appendTo($(document.createElement('div')).appendTo(dom).css({position:"absolute",height:"100%",width:"100%",top:"0px"}))
    .css({'pointer-events':'visible',"height":"100%",width:'100%',"background-color":"white","z-index":"11","position":"absolute","top":"0px",bottom:"0px","left":"0px",overflow:"auto"});

    
//     var input=$(document.createElement('input')).appendTo(groups);
//     input.css({"border":"1px solid grey","margin":"10px",padding:"3px"});
//     var outputDiv=$(document.createElement('div')).appendTo(groups);

    var peopleSearch=$(document.createElement('div')).appendTo(wrapper)
    .css({'min-height':"20px",'min-width':"100px",position:"relative",'background-color':"#ddf"});
    //element for showing groups in which the user is.
    
    var groups=$(document.createElement('div')).appendTo(wrapper);
    
    var createDiv=$(document.createElement('div')).appendTo(groups).css({"position":"relative"});
    var createButton=$(document.createElement('button'))
    .css({'min-height':"25px",'border-radius':"6px",padding:"3px",margin:"5px",'background-color':"#9db"})
    .append(document.createTextNode("create new group"))
    .appendTo(createDiv);
//     groups.append(document.createTextNode("ahoj vazeni.toto je test"));
    var createWrapper=$(document.createElement('div')).appendTo(createDiv).css({position:"relative"});
    
    

    var groupWrapper=$(document.createElement('div')).appendTo(groups).css({});
    
    
    return {main:wrapper,search:peopleSearch,groups:{main:groups,membershipList:{wrapper:groupWrapper},create:{main:createDiv,button:createButton,wrapper:createWrapper}}};
  }
  
  
  
  function People(parent,dom){
    this.dom=Template(dom);
    this.parent=parent;
    this.module=this.parent.module;
    
    this.membershipList=new MembershipList(this,this.dom.groups.membershipList.wrapper);
    
    this.search=new PeopleSearch(this,this.dom.search);
    //event listeners
    
    (function(This){
      var create=This.dom.groups.create;
      
      create.button.on('mouseup',function(e){
	e.preventDefault();
	e.stopPropagation();
	console.log('clicked_form');
	if(!create.wrapper.children().length){
	  var form=$(document.createElement('form')).appendTo(create.wrapper);
	  var formName=$(document.createElement('input')).appendTo(form)
	    .attr({placeholder:"Name Of Group"})
	    .css({"border":"1px solid grey","margin":"3px"});
	  var formId=$(document.createElement('input')).appendTo(form)
	    .attr({placeholder:"Unique identificator (only azAZ09_-.)"})
	    .css({"border":"1px solid grey","margin":"3px"});
	  var formSubmit=$(document.createElement('input')).appendTo(form);
	  formSubmit.attr({name:"create",type:"submit",value:"create"});
	  
	  form.on("submit",function(e){//we want to create new user group
	    e.preventDefault(); e.stopPropagation();
	    console.log("name: "+formName.val()+", id: "+formId.val());
	    
	    
	    This.module.controller.listen({main:"groups",sub:"submit_create_form",
					  callback:{main:"groups",sub:"add_group_to_membership_list"}},
		      {name:formName.val(),id:formId.val()});
	  });
	}
	else{create.wrapper.empty();}
      });
    })(this);
    
    return this;
  }
  
  
  People.prototype = {
    constructor: People,
    remove:function(){
      this.dom.main.remove();
    },
    showGroup:function(groupData){
      this.removeGroup();
      this.group=new GroupDetail(groupData,this,this.dom.main);
    },
    removeGroup:function(groupData){
      if(this.group){
	this.group.remove();
	delete this.group;
      }
    }
  };
    
  return People;
});