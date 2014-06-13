define(['./EmptyClass/Template'],function (Template) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  */
  
  /*
   * TODO:description
   */
  function EmptyClass(parent,dom){
    this.dom=Template(dom);
    
    return this;
  }
  
  
  EmptyClass.prototype = {
    constructor: EmptyClass
  };
    
  return Label;
});