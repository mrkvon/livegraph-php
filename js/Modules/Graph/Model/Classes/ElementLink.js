/*
 * this is a Graph:Model:ElementLink class. it will represent a [:ELEMENT] object.
 * We need to keep track of Set and Element.
 * TODO:
 */

define([],function () {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  */
  

  
  function ElementLink(data){//data={set: Node, element: Node}
    this.set=data.set;
    this.element=data.element;
  }
  
  ElementLink.prototype = {
    constructor: ElementLink
  };
  
  return ElementLink;
});