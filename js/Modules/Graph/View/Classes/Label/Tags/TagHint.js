define(['jquery'],function ($) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	
	/*
	 * TODO:description
	 */
	
	function Template(dom,tagData){
		var main=$(document.createElement('div')).appendTo(dom)
		.append(document.createTextNode(tagData.name));
		
		return {
			main:main
		};
	}
	
	
	function TagHint(tagData,parent,dom){
		this.dom=Template(dom,tagData);
		this.name=tagData.name;
		this.description=tagData.description;
		this.parent=parent;
		
		this.module=parent.module;
		this.master=parent.master;
		
		(function(This){
			This.dom.main.on('mouseover',function(){
				This.dom.main.css({"background-color":'#ddf'});
			});
			This.dom.main.on('mouseout',function(){
				This.dom.main.css({"background-color":''});
			});
			This.dom.main.on('mouseup',function(){
				This.parent.dom.input.val("");
				This.parent.clearHintList();
				var node_uuid=This.parent.parent.parent.uuid;
					This.module.controller.listen(
						{main:"tags_in_label",sub:"tag_hint_mouseup",callback:{main:"tags_in_label",sub:"add_tag",data:{uuid:node_uuid}}},
						{uuid:node_uuid,tag:This.name}
					);
			});
		})(this);
		
		return this;
	}
	
	
	TagHint.prototype = {
		constructor: TagHint
	};
		
	return TagHint;
});