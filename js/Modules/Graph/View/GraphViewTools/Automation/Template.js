define([],function () {
  //AUTOMATION TEMPLATE
  
  
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * Template creates dom object for automation
  * 
  */
  
  function Template(parent){
    var main=document.createElement('div');
    main.style["background-color"]="#fdd";
    main.style.padding="5px";
    main.style["border-radius"]="10px";

    main.appendChild(document.createTextNode("new creations will be"));
    
    var autoUser=main.appendChild(document.createElement("div"));
    autoUser.setAttribute("style","pointer-events:visible");
    autoUser.appendChild(document.createTextNode("for users"));
    var userDiv=autoUser.appendChild(document.createElement('div'));
    var userList=userDiv.appendChild(document.createElement('ul'));
    var userFormDiv=autoUser.appendChild(document.createElement('div'));
    var userForm=userFormDiv.appendChild(document.createElement('form'));
    var inputUsername=userForm.appendChild(document.createElement('input'));
    inputUsername.setAttribute("type","text");
    inputUsername.setAttribute("list","username_list");
    var usernameList=userForm.appendChild(document.createElement('datalist'));
    usernameList.id="username_list";
    var addUserButton=userForm.appendChild(document.createElement('button'));
    addUserButton.appendChild(document.createTextNode("+"));
    
    var autoTag=main.appendChild(document.createElement("div"));
    autoTag.setAttribute("style","pointer-events:visible");
    autoTag.appendChild(document.createTextNode("with tags"));
    var tagDiv=autoTag.appendChild(document.createElement('div'));
    var tagList=tagDiv.appendChild(document.createElement('ul'));
    var tagFormDiv=autoTag.appendChild(document.createElement('div'));
    var tagForm=tagFormDiv.appendChild(document.createElement('form'));
    var inputTag=tagForm.appendChild(document.createElement('input'));
    inputTag.setAttribute("type","text");
//     inputTag.setAttribute("list","tag_list");
//     var tagList=tagForm.appendChild(document.createElement('datalist'));
//     tagList.id="tag_list";
    var addTagButton=tagForm.appendChild(document.createElement('button'));
    addTagButton.appendChild(document.createTextNode("+"));
    var tagLivesearch=tagForm.appendChild(document.createElement('div'));
    tagLivesearch.style['background-color']='#fff';
    //tagLivesearch.style.border="1px solid black";
    tagLivesearch.style['margin-top']="3px";

    /*
     * end of automation
     */
    
    parent.appendChild(main);
    
    /*
     * returning object
     * main: wrapper div
     * usernameList: list for hinting usernames to which option tags with value=username should be added
     */
    
    
    return {
      main:main,
      user:{
	list:userList,
	form:userForm,
	inputUsername:inputUsername,
	addButton:addUserButton
      },
      tag:{
	livesearch:tagLivesearch,
	form:tagForm,
	input:inputTag,
	addButton:addTagButton
      }
    };
  }
  
  
  return Template;
});