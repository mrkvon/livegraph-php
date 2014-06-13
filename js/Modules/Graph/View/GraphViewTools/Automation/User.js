define(['./User/Template'],function (Template,User) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * Automation User is just a little object for clicking users...
  */
  function User(userData,parent){
    this.dom=Template(parent.dom.user.list);
    this.parent=parent;
    this.username=userData.username;
    this.rights='n';
    
    this.dom.username.appendChild(document.createTextNode(userData.username));
    
    
    //event listeners
    (function(This){
      This.dom.form.addEventListener('submit',function(e){e.preventDefault();})
      This.dom.username.addEventListener('mouseup',function(e){
	e.preventDefault();
	var value=This.dom.rights.value;
	
	require(['Modules/Graph/Controller/GraphController'],function(GraphController){
	  GraphController.listen({main:"automation",sub:"user_change_status"},{username:This.username,rights:value});
	});
	return false;
      },false);
    })(this);
    //end of event listeners
    
    return this;
  }
  
  
  User.prototype = {
    constructor: User,
    remove:function(){
      this.dom.main.parentNode.removeChild(this.dom.main);
      delete this.parent.users[this.username];
    },
    changeStatus:function(data){
      this.rights=data.rights;
      this.dom.username.setAttribute("style",data.active?"background-color:#6d7;padding:5px;border-radius:10px":"background-color:gray;padding:5px;border-radius:10px");
    }
  };
  
  return User;
});