define(['../GraphSettings','jquery'],function(GraphSettings, $){
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  */
  
  function Template(dom){
    var link=$(document.createElementNS(GraphSettings.xmlns.svg,"g")).appendTo(dom);
    
    var line=$(document.createElementNS(GraphSettings.xmlns.svg,"line")).appendTo(link).attr({class:'testing'})
    .css({stroke:"#abc",'stroke-width':"2px"});
//     line.setAttribute('class','link_line');
//     line.setAttribute('marker-end','url(#myMarker)');
    
    return {
      link:link,
      line:line
    };
  }
  
  
  function GhostLink(parent, dom, startNodeData){
    var coords=startNodeData.coords;
    this.dom=Template(dom);
    this.dom.line.attr({x1:coords.x,y1:coords.y,x2:coords.x,y2:coords.y});
  }
  
  
  GhostLink.prototype = {
    
    constructor: GhostLink,

    newEnd:function(coords){
      this.dom.line.attr(({x2:coords.x,y2:coords.y}))
    },
    //this is a function for GhostLink autodestruction
    remove:function(){
      this.dom.link.remove();
    }
  };
  
  
  return GhostLink;
});