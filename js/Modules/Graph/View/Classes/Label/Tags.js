define(['./Tags/TagHint','./Tags/Tag','jquery'],function (TagHint,Tag,$) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	
	/*
	 * TODO:description
	 */
	
	function Template(dom){
		var wrapperOfTags=$(document.createElement('div'))
		.appendTo(dom)
		.append(
			$(document.createElement('span'))
			.append($(document.createTextNode('Tags')))
		);
		var divOfTags=$(document.createElement('div')).appendTo(wrapperOfTags).css({border:"1px solid #ccc","min-height":"20px"});

		var listOfTags=$(document.createElement('ul')).css({display:'inline-block'}).appendTo(divOfTags);
		//end of container of tags
		var tagInput=$(document.createElement('input'))
		.css({display:'inline-block','border':'1px solid rgba(200,128,255,0.9)','background-color':'rgba(200,128,255,0.3)'})
		.appendTo(divOfTags);
		//end of container of tags
		var hintList=$(document.createElement('div'))
		.appendTo(wrapperOfTags)
		.css({position:"relative"});
		return {
			main:wrapperOfTags, input:tagInput, list:listOfTags, hintlist:hintList
		};
	}
	
	
	function Tags(parent,dom){
		this.dom=Template(dom);
		this.parent=parent;
		this.module=parent.module;
		this.master=parent.master;
		
		this.tags={};
		
		var GraphController=this.module.controller;
		
		/*
		 * event listeners
		 */
		(function(This){
			This.dom.input.on('keyup',function(e){
				var text=This.dom.input.val();
				var node_uuid=This.parent.parent.uuid;
				if(text.length){
						GraphController.listen(
							{main:"tags_in_label",sub:"tag_input_keyup",callback:{main:"tags_in_label",sub:"tags_to_hint_list",data:{uuid:node_uuid}}},
							{text:text}
						);
				}
				else This.clearHintList();
			});
		})(this);
		
		
		return this;
	}
	
	
	Tags.prototype = {
		constructor: Tags,
		addTag:function(tagData){ //data{name:...,description:...,uses:...,...}
			if(tagData){
				//var item=this.dom.list.appendChild(document.createElement('li'));
				var tag=new Tag(tagData,this,this.dom.list);
				this.tags[tagData.name]=tag;
			}
		},
		removeTag:function(tagData){
			this.tags[tagData.name].remove();
		},
		clearTags:function(){
			for(var name in this.tags){
				this.tags[name].remove();
			}
		},
		clearHintList:function(){
			var tls=this.dom.hintlist;
			tls.empty();
		},
		createHintList: function(tagData){
			var tls=this.dom.hintlist;
			this.clearHintList();
			var wrapper=$(document.createElement('div'))
			.appendTo(tls)
			.css({position:"absolute",'background-color':"#fff",border:"1px solid black",width:"100%"});
			//wrapper.style['margin-left']=wrapper.style['margin-right']="1px";
			var i=0;
			for(var tagName in tagData){
				i++;
				var tag=new TagHint(tagData[tagName],this,wrapper);
			}
			if(i==0){
				var nothing=$(document.createElement('div'))
				.append(document.createTextNode('nothing found. '))
				.appendTo(wrapper);
				var link=$(document.createElement('a')).appendTo(nothing).append(document.createTextNode('Create New Tag.'));
				
				(function(This){
					link.on('mouseup',function(){
						nothing.remove();
						
						
						
						
						
						var newTagDiv=$(document.createElement('div')).appendTo(wrapper);
						var newTagForm=$(document.createElement('form')).appendTo(newTagDiv);
						var nameInput=$(document.createElement('input')).appendTo(newTagForm)
						.attr({type:"text",placeholder:"tag name",value:This.dom.input.val()}).css({border:"1px solid green",'background-color':"#beb"});
						var descriptionInput=$(document.createElement('textarea')).appendTo(newTagForm)
						.attr({placeholder:"tag description"})
						.css({border:"1px solid green",'background-color':"#beb"});
						var button=$(document.createElement('input')).attr({type:'submit',value:'create new tag'})
						.appendTo(newTagForm);
						
						(function(This){
							//submit form to create new tag
							newTagForm.on('submit',function(e){
								e.preventDefault();
								e.stopPropagation();
								//This.clearHintList();
								//console.log('create new tag '+nameInput.val()+' '+descriptionInput.val());
									This.module.controller.listen({
											main:"tags_in_label",
											sub:"tag_submit_create_new_tag",
											callback:{main:"tags_in_label",sub:"tags_to_hint_list",data:{uuid:This.parent.parent.uuid}}
										},
										{name:nameInput.val(),description:descriptionInput.val()}//tag creating
									);
							});
						})(This);
					});
				})(this);
			}
		}
	};
		
	return Tags;
});