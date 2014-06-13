define([],function () {
  
  /*
   * User Template
   */
  
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * 
  */
  
  function Template(domParent){
    var main=domParent.appendChild(document.createElement('li'));
    var form=main.appendChild(document.createElement('form'));
    
    var name=form.appendChild(document.createElement('button'));
    name.setAttribute("style","background-color:#999;padding:5px;border-radius:10px");
    form.appendChild(document.createTextNode(' to '));
    //selection
    var rights=form.appendChild(document.createElement('select'));
    //options
    var oo=rights.appendChild(document.createElement('option'));
    oo.setAttribute('value','o');
    oo.appendChild(document.createTextNode('own'));
    var ow=rights.appendChild(document.createElement('option'));
    ow.setAttribute('value','w');
    ow.appendChild(document.createTextNode('write'));
    var or=rights.appendChild(document.createElement('option'));
    or.setAttribute('value','r');
    or.appendChild(document.createTextNode('read'));

    return {
      main:main,
      username:name,
      form:form,
      rights:rights
    };
  }
  
  
  return Template;
});