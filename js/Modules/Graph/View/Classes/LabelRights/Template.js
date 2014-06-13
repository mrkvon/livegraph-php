define(['jquery'],function ($) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * LabelRights object is for showing and granting rights to users in the Label object.
  * 
  */
  
  function LabelRightsTemplate(dom){
    var main=$(document.createElement('div')).appendTo($(dom))
    .css({'min-width':'100px','background-color':'white',border:'2px solid green','z-index':'15'});
    
    //title
    var title=$(document.createElement('h2')).appendTo(main).append(document.createTextNode('grant rights'));
    
    //div into which we will add users
    var userDiv=$(document.createElement('div')).appendTo(main);
    var groupDiv=$(document.createElement('div')).appendTo(main);
    var formDiv=$(document.createElement('div')).appendTo(main);
    var form=$(document.createElement('form')).appendTo(formDiv);
    var inputUsername=$(document.createElement('input')).appendTo(form).attr({type:"text",placeholder:"username"/*,"list":"username_list"*/})
    .css({border:"1px solid #55aa33"});
    var usernameList=$(document.createElement('div')).appendTo(form).css({position:"absolute"});
    var inputGroup=$(document.createElement('input')).appendTo(form).attr({type:"text",placeholder:"group name/id"/*,"list":"username_list"*/})
    .css({border:"1px solid #55aa33"});
    var groupList=$(document.createElement('div')).appendTo(form).css({position:"absolute"});
    //id and name of list might be added not in template but later (otherwise we don't have original id and it causes troubles)
//     var usernameList=$(document.createElement('datalist')).appendTo(form).attr({id:"username_list"});
    //var addUserButton=$(document.createElement('button')).appendTo(form).append(document.createTextNode("+"));
    
    
    /*
     * returning object
     * main: wrapper div
     * usernameList: list for hinting usernames to which option tags with value=username should be added
     */
    
    
    return {main:main,usernameList:usernameList,userDiv:userDiv,inputUsername:inputUsername,/*addUserButton:addUserButton,*/addUserForm:form,group:{input:inputGroup,hint:groupList,div:groupDiv}};
  }
  
  
  return LabelRightsTemplate;
});