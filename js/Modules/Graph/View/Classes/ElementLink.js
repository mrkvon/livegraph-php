/*
 * this file is created from (and will be somewhat similar to) Modules/Graph/View/Classes/Link.js
 * it should create a "this is an element of set" line between set and its element.
 */


define(['../GraphTemplate'],function (GraphTemplate) {
  // Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
  "use strict";

  /**
  * Structure inspired by https://gist.github.com/jonnyreeves/2474026
  */
  function ElementLink(set,element){
    var link=GraphTemplate.link();
    
    this.uuid='';
//     link.line.setAttribute('x1',dataLink.src.coords.x);
//     link.line.setAttribute('y1',dataLink.src.coords.y);
//     link.line.setAttribute('x2',dataLink.tg.coords.x);
//     link.line.setAttribute('y2',dataLink.tg.coords.y);
//   //   livegraph.functions.addAttribute(src_obj,'data_src',this.link.id);
//   //   livegraph.functions.addAttribute(tg_obj,'data_tg',this.link.id);
//     graphLinks.appendChild(link.link);
    this.main=link.link;
    this.line=link.line;
    
    //these two should contain pointers to Node objects of src and tg.
    this.src=undefined;
    this.tg=undefined;
  }
  
  
  ElementLink.prototype = {
    
    constructor: ElementLink,
    set:function(dataLink){//dataLink={src:{uuid:"",coords:{x:num,y:num}},tg:{uuid:"",coords:{}}}
      this.line.setAttribute('x1',dataLink.src.coords.x);
      this.line.setAttribute('y1',dataLink.src.coords.y);
      this.line.setAttribute('x2',dataLink.tg.coords.x);
      this.line.setAttribute('y2',dataLink.tg.coords.y);
      this.uuid=dataLink.uuid;
      return this;
    },
    //this function deals with connecting Link to DOM
    add:function(dataLink,graph){
      var update=false;
      console.log(graph.links[dataLink.uuid]);
      if(graph.links[dataLink.uuid]){
	graph.links[dataLink.uuid].remove();
	update=true;
      }
      
      if(!graph.nodes[dataLink.src.uuid]){
	graph.addNode(dataLink.src);
      }
      
      if(!graph.nodes[dataLink.tg.uuid]){
	graph.addNode(dataLink.tg);
// 	new Label().name(dataLink.tg).addTo(node);
      }
      
      this.src=graph.nodes[dataLink.src.uuid];
      this.tg=graph.nodes[dataLink.tg.uuid];
      
      //add pointer to this link to src and tg Nodes.
      graph.nodes[dataLink.src.uuid].srclinks[dataLink.uuid]=this;
      graph.nodes[dataLink.tg.uuid].tglinks[dataLink.uuid]=this;
      
      graph.DOM.svg.links.appendChild(this.main);
      
      graph.links[dataLink.uuid]=this;
      
      return this;
    },
    
    //this is a function for Link autodestruction
    remove:function(){
      if(this.src&&this.src.label&&this.src.label.links&&this.src.label.links[this.uuid]){
	console.log('removing LabelLinkObject');
	this.src.label.links[this.uuid].remove();
      }
	
      if(this.main&&this.main.parentNode){
	this.main.parentNode.removeChild(this.main);
      }
      delete this;
    },
    //this function should recount Link position (and use current position of the src and tg nodes)
    newPosition:function(){
      
      //to be less system wasteful:remove from DOM and when finished append back.
      var DOMparent=this.main.parentNode;
      console.log(this.main);
      console.log(this.main.parentNode);
//       if (DOMparent) DOMparent.removeChild(this.main);
      var src=this.src; //src node
      var tg=this.tg; //tg node
      this.line.setAttribute('x1',src.coords.x);
      this.line.setAttribute('y1',src.coords.y);
      this.line.setAttribute('x2',tg.coords.x);
      this.line.setAttribute('y2',tg.coords.y);
//       if (DOMparent)DOMparent.appendChild(this.main);
      return this;
    }
    
  };
  
  
  return ElementLink;
});