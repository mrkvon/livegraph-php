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
		var main=$(document.createElement('li')).appendTo(dom).append(document.createTextNode(tagData.name));
		var remove=$(document.createElement('span')).appendTo(main)
		.append(document.createTextNode('xxx'))
		.css({'background-color':"red"});
		
		return {
			main:main,
			remove:remove
		};
	}
	
	
	
	function Tag(tagData,parent,dom){
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
				This.dom.main.css({'background-color':""});
			});
			This.dom.remove.on('mouseup',function(){
				var node_uuid=This.parent.parent.parent.uuid;
				This.module.controller.listen(
					{main:"tags_in_label",sub:"tag_remove_mouseup",callback:{main:"tags_in_label",sub:"remove_tag",data:{uuid:node_uuid}}},
					{tag:This.name,uuid:node_uuid}
				);
			});
		})(this);
		
		return this;
	}
	
	
	Tag.prototype = {
		constructor: Tag,
		remove:function(){
			var li=this.dom.main;
			li.remove();
			delete this.parent.tags[this.name];
		}
	};
		
	return Tag;
});