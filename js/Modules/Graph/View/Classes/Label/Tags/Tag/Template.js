define([],function () {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * Tag TEMPLATE
  * 
  */
  
  function Template(dom,tagData){
    var main=dom.appendChild(document.createElement('li'));
    main.appendChild(document.createTextNode(tagData.name));
    var remove=main.appendChild(document.createElement('span'));
    remove.appendChild(document.createTextNode('xxx'));
    remove.style['background-color']="red";
    
    return {
      main:main,
      remove:remove
    };
  }
  
  return Template;
});