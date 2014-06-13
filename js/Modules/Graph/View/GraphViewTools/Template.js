define(['jquery'],function ($) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  * 
  * LabelRights object is for showing and granting rights to users in the Label object.
  * 
  */
  
  function Template(parent){
    var main=$(document.createElement('div')).appendTo(parent);
    main.addClass("view_graph_tools");
    
    /*
     * automation: the window for automatic granting rights and tagging
     */
    var automationDiv=$(document.createElement('div')).appendTo(main)
    .css({position:"absolute",left:"10px",top:"130px","min-height":"50px","min-width":"50px"});
    
    /*
     * returning object
     * main: wrapper div
     * usernameList: list for hinting usernames to which option tags with value=username should be added
     */
    
    
    return {
      main:main,
      automation:automationDiv
    };
  }
  
  
  return Template;
});
