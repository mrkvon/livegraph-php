define([],function () {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * LabelRights object is for showing and granting rights to users in the Label object.
  * 
  */
  
  function Template(dom){
    var main=dom.appendChild(document.createElement('div'));
    
    return {
      main:main
    };
  }
  
  return Template;
});