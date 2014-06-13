define([],function () {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * TAGHINT TEMPLATE
  * 
  */
  
  function Template(dom,tagData){
    var main=dom.appendChild(document.createElement('div'));
    main.appendChild(document.createTextNode(tagData.name));
    
    return {
      main:main
    };
  }
  
  return Template;
});