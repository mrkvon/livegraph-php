define(['./Automation/Template','./Automation/User'],function (Template,User) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /*
   * TODO: on change of rights option it should change in database, too. it is not finely tuned yet!!!!!
   * 
   * 
   */
  
  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * Automation is tool object for automating giving rights and tagging during creation of nodes etc.
  * 
  */
  function Automation(parent,dom){
    this.dom=Template(dom);
    this.parent=parent;
    this.users={};
    
    /*
     * automation eventlisteners
     */
    (function(This){
      var automation=This.dom;
//       This.dom.inputUsername.addEventListener('focus',function(){
// 	//this function should fill this.dom.usernameList with usernames from database.
// 	require(['Modules/Graph/Controller/GraphController'],function(GraphController){
// 	  GraphController.listen({main:"automation",},{uuid:This.parent.parent.uuid,string:""});
// 	});
//       });
//       This.dom.inputUsername.addEventListener('keyup',function(e){});
//       
      automation.user.form.addEventListener('submit',function(e){
	e.preventDefault();
	require(['Modules/Graph/Controller/GraphController'],function(GraphController){
	  GraphController.listen({main:"automation",sub:"user_form_submit",callback:{main:"automation",sub:"user_add"}},{username:automation.user.inputUsername.value});
	});
	return false;
      },false);
      
      automation.tag.input.addEventListener('keyup',function(e){
	var text=automation.tag.input.value;
	if(text.length){
	  require(['Modules/Graph/Controller/GraphController'],function(GraphController){
	    GraphController.listen({main:"automation",sub:"tag_input_keyup",callback:{main:"automation",sub:"tags_to_hint_list"}},{text:text});
	  });
	}
	else This.clearTagHintList();
      });
//       
    })(this);
    /*
     * end of automation eventlisteners
     */
    
    return this;
  }
  
  
  Automation.prototype = {
    constructor: Automation,
    addUser: function(userData){
      if(this.users[userData.username]){
	this.users[userData.username].remove();
      }
      
      var user=new User(userData,this);
      this.users[userData.username]=user;
    },
    clearTagHintList:function(){
      var tls=this.dom.tag.livesearch;
      while(tls.firstChild){
	tls.removeChild(tls.firstChild);
      }
    },
    newTagHintList: function(tagData){
      var tls=this.dom.tag.livesearch;
      this.clearTagHintList();
      for(var tagName in tagData){
	tls.appendChild(document.createElement('div')).appendChild(document.createTextNode(tagName));
      }
    }
  };
  
  return Automation;
});