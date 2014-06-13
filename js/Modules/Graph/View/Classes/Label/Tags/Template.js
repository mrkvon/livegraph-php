define([],function () {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  */
  
  function Template(dom){
    var wrapperOfTags=dom.appendChild(document.createElement('div'));
    wrapperOfTags.appendChild(document.createElement('span')).appendChild(document.createTextNode('Tags'));
    var divOfTags=wrapperOfTags.appendChild(document.createElement('div'));
    divOfTags.style.border="1px solid #ccc";
    divOfTags.style['min-height']="20px";
    //divOfTags.setAttribute("style","min-height:20px;background-color:#b7e");
    
    var listOfTags=divOfTags.appendChild(document.createElement('ul'));
    //end of container of tags
    var tagInput=divOfTags.appendChild(document.createElement('input'));
    //end of container of tags
    var hintList=wrapperOfTags.appendChild(document.createElement('div'));
    hintList.style.position="relative";
    return {
      main:wrapperOfTags, input:tagInput, list:listOfTags, hintlist:hintList
    };
  }
  
  return Template;
});