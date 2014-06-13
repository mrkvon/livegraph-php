define(['./LabelRights','./Label/Tags','./NodeButton','jquery','mathjax','cowboy'],function (LabelRights, Tags, NodeButton, $, mathjax) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	
	/**TODO implement markitup library for viewing the label**/
	/**TODO simplify the usage of this class**/
	
	/**this is a template for label**/
	function Template(dom){
		var label=$(document.createElement('div')).addClass('view_label').appendTo(dom);
		
		var name=$(document.createElement('span')).appendTo($(document.createElement('div')).appendTo(label));
		
		var tabContainer=$(document.createElement('div')).appendTo(label).addClass('label_hide_seek');
		var rowContainer=$(document.createElement('div')).appendTo(tabContainer);
		
		//container for data
		var dataContainer=$(document.createElement('div')).appendTo(rowContainer).addClass('label_data_div');
		
		var tools=$(document.createElement('div')).addClass('label_tools').appendTo(dataContainer);
		
		var edit=$(document.createElement('div')).addClass('label_edit').appendTo(dataContainer);
		
		var data=$(document.createElement('div')).appendTo(dataContainer);
		
		//container of links (objects)
		var divOfLinks=$(document.createElement('div')).addClass('label_link_container').appendTo(data);
		var listOfLinks=$(document.createElement('ul')).appendTo(divOfLinks);
		//end of container of links
		
		//container of tags (objects)
		var wrapperOfTags=$(document.createElement('div')).appendTo(data);
		//end of container of tags
		
		var divOfElements=$(document.createElement('div')).appendTo(data);
		var listOfElements=$(document.createElement('ul')).appendTo(divOfElements);
		
		var divOfSets=$(document.createElement('div')).appendTo(data);
		var listOfSets=$(document.createElement('ul')).appendTo(divOfSets);
		
		var listOfObjects=$(document.createElement('div')).appendTo(data);
		
		var content=$(document.createElement('div')).appendTo(data);
		
		var buttonEdit=$(document.createElement('button')).appendTo(tools)//create edit button. is this the ideal place?
		.append(document.createTextNode('edit'));
		
		var showElements=$(document.createElement('button')).appendTo(tools)//create show_links button
		.append(document.createTextNode('elements'));
		
		var showSet=$(document.createElement('button')).appendTo(tools)//create show_links button
		.append(document.createTextNode('part of'));
		
		var showLinks=$(document.createElement('button')).appendTo(tools)//create show_links button
		.append(document.createTextNode('links'));
		
		var showLinked=$(document.createElement('button')).appendTo(tools)//create show_links button
		.append(document.createTextNode('linked'));
		
		var deleteNode=$(document.createElement('button')).appendTo(tools)//create show_links button
		.append(document.createTextNode('delete'));
		
		var hideShowRights=$(document.createElement('button')).appendTo(tools)//create show_links button
		.append(document.createTextNode('share'));
		
		//container for rights
		var rightsContainer=$(document.createElement('div')).appendTo(rowContainer).css({position:'absolute'});
		var rightsDiv=$(document.createElement('div')).appendTo(rightsContainer);
		//end of container for rights
		

		
		return {
			main:label,
			data:{main:data,name:name,content:content,links:listOfLinks,elements:listOfElements,sets:listOfSets,linkDiv:divOfLinks,objects:listOfObjects},//we need divOfLinks to attach eventListener
			tools:{main:tools,edit:buttonEdit,showElements:showElements,showSet:showSet,showLinks:showLinks,showLinked:showLinked,delete:deleteNode,rights:hideShowRights},
			edit:{main:edit},
			rights:rightsContainer,
			tags:wrapperOfTags
		};
	}
	
	/**
	 * docs
	 * 
	 * Class Label()
	 * 
	 */
	
	function Label(parent){
		this.dom=Template(parent.graph.dom.html.label);
		
		this.isActive=false; //tells us whether label is just name or is active (shows content and tools)
		this.parent=parent;
		this.module=parent.module;
		this.master=parent.master;
		
		this.objects={};//object {"some_name":{main:DOM, parent:},...}
		this.links={};//object {uuid:LabelLinkObject,uuid:LabelLinkObject}
		this.elements={};
		this.sets={};
		this.tags=new Tags(this,this.dom.tags);
		this.rights=null;
		
		
		return this;
	}
	
	
	Label.prototype = {
		constructor: Label,
		addLabelRights:function(){
			this.rights=new LabelRights(this,this.dom.rights);
		},
		removeLabelRights:function(){
			if(this.rights){
				this.rights.remove();
				delete this.rights;
			}
		},
		highlight:function(bOn){
			//if(!this.isActive){
			this.dom.main.parent().append(this.dom.main);
				if(bOn){
					this.dom.data.name.css({'background-color':'rgba(255,255,255,0.95)'});
				}else{
					this.dom.data.name.css({'background-color':''});
				}
			//}
		}
	};
	
	///implementation of prototype functions:
	
	Label.prototype.remove=function(){
		for(var name in this.objects){
			this.objects[name].remove();
		}
		for(var uuid in this.links){
			this.links[uuid].remove();
		}
		this.dom.main.remove();
		delete this.parent.label;
	};
	
	Label.prototype.name=function(dataObject){
		this.dom.data.name.text(dataObject.name);
		setTimeout((function(object){
			//console.log('timeout');
			return function(){
				mathjax.Hub.Queue(["Typeset",MathJax.Hub,object]);
			};
		})(this.dom.data.name.get(0)),0);
		
		
		
//		 mathjax.Hub.Queue(["Typeset",MathJax.Hub,this.dom.data.name]);
		return this;
	};
	
	Label.prototype.active=function(bToBe){
		var GraphController=this.module.controller;
		if(bToBe===true){
			this.dom.main.removeClass().addClass("label_active");
			this.isActive=true;
			//this.dom.tools.show(true);
			(function(tHis){
				tHis.dom.data.linkDiv.on('mouseup',function(e){
					GraphController.listen('mouseup_label_links',{uuid:tHis.parent.uuid});
				});
				console.log('adding tags');
				GraphController.listen({main:"tags_in_label",sub:"get_tags",callback:{main:"tags_in_label",sub:"add_tags",data:{uuid:tHis.parent.uuid}}},{uuid:tHis.parent.uuid});
			})(this);
			
		}
		if(bToBe===false){
			this.dom.main.removeClass().addClass('view_label');
			this.dom.data.content.text('');
			this.dom.data.links.empty();
			this.dom.data.elements.empty();
			this.dom.edit.main.empty();
			this.isActive=false;
		}
		return this;
	};
	
	Label.prototype.info=function(dataObject){
		this.dom.data.name.text(dataObject.name);
		this.createContent(dataObject);
		//console.log(this.dom.data.content);
		
		
		/**MathJax**/
		setTimeout((function(object){
			//console.log('timeout');
			return function(){
				mathjax.Hub.Queue(["Typeset",MathJax.Hub,object]);
			};
		})(this.dom.data.name.get(0)),0);
		
		setTimeout((function(object){
			return function(){
				mathjax.Hub.Queue(["Typeset",MathJax.Hub,object]);
			};
		})(this.dom.data.content.get(0)),0);
		
		return this;
	};
	
	//this should add link button to Label.data.links place and to label.links object.
	Label.prototype.addLink=function(linkDataObject){
		//console.log('inside addLink');
		//console.log(linkDataObject.src.uuid+"======"+this.parent.uuid);
		if(linkDataObject.src.uuid==this.parent.uuid){
			//console.log('inside addLink');
			//console.log(this.links);
			if(this.links[linkDataObject.uuid]){
				this.links[linkDataObject.uuid].remove();
			}
			var linkButton=new LabelLinkObject(linkDataObject,this);
			linkButton.parent=this;
			this.dom.data.links.append(linkButton.dom.main);
			this.links[linkDataObject.uuid]=linkButton;
		}
	};
	
	//this should add link button to Label.data.links place and to label.data object.
	Label.prototype.addElement=function(elementDataObject){
		var GraphController=this.module.controller;
		(function(This){
				//console.log(This.parent);
				var element=new NodeButton(elementDataObject,This.parent.parent,This);
				element.addTo(This.elements,This.dom.data.elements);
				//console.log(This.parent.uuid);
				element.createClickListener('show_element_of_set_in_graph',{uuid:This.parent.uuid});
				element.createRemovingListener({main:"element",sub:"delete_element_link",callback:""},{uuid:This.parent.uuid});//this is not finished! even the function is not finished.
		})(this);
	};
	
	//this object is a button in label representing link to another node
	function LabelLinkObject(linkDataObject,parent){
		//create DOM
		function lloTemplate(){
			var main=$(document.createElement("li"));
			var close=$(document.createElement("span")).appendTo(main).append(document.createTextNode("x"));
			main.append(document.createTextNode(linkDataObject.tg.name));
			return {main:main,close:close};
		}
		
		this.dom=lloTemplate();
		this.name=linkDataObject.tg.name;
		this.parent=parent;
		this.module=parent.module;
		this.master=parent.master;
		
		this.link=parent.parent.parent.links[linkDataObject.uuid];
		this.tg=parent.parent.parent.nodes[linkDataObject.tg.uuid];
		this.objects={};//name:{object}//this should contain pointers to "objects" (instances of targeted nodes used in text)
		
		
		/**add event listeners**/
		var GraphController=this.module.controller;
		(function(This){
			/**highlighting**/
			This.dom.main.on('mouseover',function(){
				This.link.highlight(true,{"stroke":"red",fill:'red'});
				This.tg.highlight(true,{"stroke":"red","fill":"pink"});
			});
			This.dom.main.on('mouseout',function(){
				This.link.highlight(false,{"stroke":""});
				This.tg.highlight(false,{"stroke":"","fill":""});
			});
			
			/**adding object to text**/
			This.dom.main.on('mouseup',function(){
				if(This.parent.dom.edit.content){
					//console.log(This.parent.edit.content);
					insertTextAtCursor(This.parent.dom.edit.content,"[["+This.parent.parent.uuid+"|"+This.name+"|"+This.name+"]]");
					This.parent.createContent({content:This.parent.dom.edit.content.val()});
				}
			});
			
			/**link deleting listener**/
			This.dom.close.on('mouseup',function(){
				var link={uuid:This.link.uuid};				
				GraphController.listen('clicked_delete_link',{nodes:[],links:[link]});
			});
		})(this);
		

		
		return this;
	}
	
	LabelLinkObject.prototype.remove=function(){
		console.log('removing LabelLinkObject');
		//console.log(this.main);
		this.dom.main.remove();
		delete this.parent.label;
	}
	
	Label.prototype.createContent=function(dataObject){
		var contentText=dataObject.content;
		
		function ConnectItem(objectData,parent,dom){
			function ciTemplate(dom){
				var connectedNodeDOM=$(document.createElement('li')).appendTo(dom);
//				 var fieldset=connectedNodeDOM;
				var remove=$(document.createElement('span')).appendTo(connectedNodeDOM).text('x').css({'background-color':'blue'});
				var span=$(document.createElement('span')).appendTo(connectedNodeDOM).text(objectData.name);
				
				return {main:connectedNodeDOM,remove:remove};
			}
			
			this.dom=ciTemplate(dom);
			this.name=objectData.name;
			this.uuid=objectData.uuid;
			this.parent=parent;
			this.instance=[];//list of all occurences of object in text: {alias:occurence_in_text,main:DOM}

			return this;
		}
		
		ConnectItem.prototype.remove=function(){
			this.dom.main.remove();
			delete this.parent.objects[this.name];
		}
		
		for(var nm in this.objects){
			this.objects[nm].remove();
		}
		
		var wrapper=$(document.createElement('div'));
		var objectWrapper=$(document.createElement('ul')).appendTo(wrapper);
		
		var textToProcess=contentText;//text which should be processed into a beautiful output
		//this while uses regexp to extract [[|]] and make span of it... and append to wrapper.
		
		while(textToProcess.length>0){
			
			if(textToProcess.length>0){
				var regexParagraph=/(\n|^).*?(?=\n|$)/;
				var paragraph=regexParagraph.exec(textToProcess);
				var domParagraph=$(document.createElement('p')).appendTo(wrapper);
				var paragraphTextToProcess=paragraph[0];
				
				
				//domParagraph.appendChild(document.createTextNode(paragraph[0]));
				textToProcess=textToProcess.slice(paragraphTextToProcess.length);
				
				while(paragraphTextToProcess.length>0){
					if(paragraphTextToProcess.length>0){
						var regexNotNode=/([\s\S]*?)(?=\[\[.*?\|.*?\]\]|$)/;
						var notNode=regexNotNode.exec(paragraphTextToProcess);
						wrapper.append($(document.createTextNode(notNode[0])));
						paragraphTextToProcess=paragraphTextToProcess.slice(notNode[0].length);
					}
					//console.log(paragraphTextToProcess);
					if(paragraphTextToProcess.length>0){
						//console.log('2'+paragraphTextToProcess);
						var regexNodeString=/\[\[(.*?)\|(.*?)\]\]/;
						var nodeString=regexNodeString.exec(paragraphTextToProcess);
						var span=$(document.createElement('span')).addClass('ref').appendTo(wrapper);
						
						var regexObjectPart=/(.*?)\|(.*)/;
						
						var regObjResult=regexObjectPart.exec(nodeString[2]);
						if(regObjResult!=null){
							var objName=regObjResult[1];
							var objAlias=regObjResult[2];
							
							
							if(!this.objects[objName]){
								this.objects[objName]=new ConnectItem({name:objName,uuid:regObjResult[1]},this,objectWrapper);
							}

							this.objects[objName].instance.push({alias:objAlias,main:span});
							span.append($(document.createTextNode(objAlias)));
							
						}
						else{
							span.append($(document.createTextNode(nodeString[2])));
						}
						(function(uuid,thisObject,name){//this listener should highlight the nodes onmouseover in text.
							//console.log(span);
							span.on('mouseover',function(){
								console.log(thisObject.parent);//.parent.nodes[uuid]);
		// 						thisObject.parent.parent.nodes[uuid].center.style.stroke='red';
		// 						thisObject.parent.parent.nodes[uuid].center.style.fill='pink';
		// 						thisObject.parent.links[uuid].style.stroke='red';
		// 						thisObject.parent.center.style.fill='red';
							
// 								console.log(thisObject.objects[name].instance);
								var ob=thisObject.objects[name];
								var oi=ob.instance;
								for(var i=0, len=oi.length;i<len;i++){
									oi[i].main.css({'background-color':'yellow'});
								}
								
								ob.dom.main.css({'background-color':'red'});
								$(this).css({'background-color':'pink'});
							});
							span.on('mouseout',function(){
		// 						console.log(thisObject.parent.parent.nodes[uuid]);
		// 						thisObject.parent.parent.nodes[uuid].center.style.stroke='';
		// 						thisObject.parent.parent.nodes[uuid].center.style.fill='';
		// 						thisObject.parent.links[uuid].style.stroke='';
		// 						thisObject.parent.center.style.fill='';

								var ob=thisObject.objects[name];
								var oi=ob.instance;
								for(var i=0, len=oi.length;i<len;i++){
									oi[i].main.css({'background-color':''});
								}
								
								ob.dom.main.css({'background-color':''});
								$(this).css({'background-color':''});
							});
							
						})(nodeString[1],this,objName);
						paragraphTextToProcess=paragraphTextToProcess.slice(nodeString[0].length);
					}
				}
			}
		}
		this.dom.data.content.empty();
		this.dom.data.content.append(wrapper);
//		 wrapper.appendChild(document.createTextNode(contentText));
		//console.log(mathjax);
		setTimeout((function(wrapper){
			//console.log('timeout');
			return function(){
				mathjax.Hub.Queue(["Typeset",MathJax.Hub,wrapper]);
			};
		})(wrapper.get(0)),0);
		return wrapper;
	}
	
	
	//this function will be executed after clicking on edit button in node info label. it is editing option for label.
	Label.prototype.editMode=function(dataObject){
		var GraphController=this.module.controller;
		
		function editTemplate(dom){
			var form=$(document.createElement('form')).appendTo(dom);
			var name=$(document.createElement('textarea')).attr({placeholder:'name'}).appendTo(form);
			var content=$(document.createElement('textarea')).attr({placeholder:'content'}).appendTo(form);
			var saveButton=$(document.createElement('input')).attr({type:'button',value:'save'}).appendTo(form);
			var reloadButton=$(document.createElement('input')).attr({type:'button',value:'reload'}).appendTo(form);
			
			return {
				main:form,
				name:{main:name},
				content:{main:content},
				buttons:{save:saveButton,reload:reloadButton}
			};
		}
		
		this.dom.edit.main.empty();
		var editForm=editTemplate(this.dom.edit.main);
		console.log(editForm);
		this.dom.edit.content=editForm.content.main;
		this.dom.edit.name=editForm.name.main;
		this.dom.edit.name.text(dataObject.name);
		this.dom.edit.content.text(dataObject.content);
		//add event listeners to save and update
		
		editForm.buttons.save.on('mouseup',function(e){
			e.preventDefault();
			e.stopPropagation();
				var node={uuid:dataObject.uuid,name:editForm.name.main.val(),content:editForm.content.main.val()};
				GraphController.listen('save',{nodes:[node],links:[]});
				return false;
		});
		
		editForm.buttons.reload.on('mouseup',function(e){
			e.preventDefault();
			e.stopPropagation();
				GraphController.listen('edit',{uuid:dataObject.uuid});
				return false;
		});
		
		

		
		
		/** **/
		(function(thisObject){
			
			/**create preview of edit content**/
			$.debounce(500,someCallback);
			
			function someCallback(){
				thisObject.createContent({content:thisObject.dom.edit.content.val()});
			}
			
			/**on keyup, create preview of edit content**/
			thisObject.dom.edit.content.on('keyup',$.debounce(500,someCallback));
		})(this);
		
		return this;
	};
	
	
	Label.prototype.update=function(){};
	
	Label.prototype.newPosition=function(){
		var objectPosition=this.parent.parent.dom.svg.main.get(0).createSVGPoint();
		var graphText=this.parent.parent.dom.html.main;
		objectPosition=objectPosition.matrixTransform(this.parent.dom.main.get(0).getCTM());
		this.dom.main.css({left:''+(objectPosition.x+15-parseInt(graphText.css('left')))+'px',
											top:''+(objectPosition.y-10-parseInt(graphText.css('top')))+'px'});
		
		return this;
	};
	
	Label.prototype.addTo=function(graphObject){
		this.parent=graphObject;

		var GraphController=this.module.controller;
		
		this.newPosition();
		
		$(this.parent.parent.dom.html.label).append(this.dom.main);

		this.dom.tools.edit.on('mouseup',function(){
				GraphController.listen('edit',{uuid:graphObject.uuid});
		});
		
		this.dom.tools.showElements.on('mouseup',function(){//this event listener is to
																																		//show elements of this node as set
				GraphController.listen('clicked_show_elements',{uuid:graphObject.uuid});
		});
		
		this.dom.tools.showSet.on('mouseup',function(){//this event listener is to show sets to which this node belongs.
				GraphController.listen({main:"label",sub:"show_set_mouseup"},{uuid:graphObject.uuid});
		});
		
		this.dom.tools.showLinks.on('mouseup',function(){
				GraphController.listen('clicked_show_links',{uuid:graphObject.uuid});
		});
		
		console.log(this.dom.tools);
		this.dom.tools.showLinked.on('mouseup',function(){
				GraphController.listen('clicked_show_linked',{uuid:graphObject.uuid});
		});
		
		this.dom.tools.edit.on('mouseup',function(){
				GraphController.listen('edit',{uuid:graphObject.uuid});
		});
		
		this.dom.tools.delete.on('mouseup',function(){
				GraphController.listen('clicked_delete_node',{nodes:[{uuid:graphObject.uuid}],links:[]});
		});
		
		(function(This){
			console.log(This.dom.tools.rights);
			This.dom.tools.rights.on('mouseup',function(){
				console.log(This.rights);
				if(!This.rights){
					This.addLabelRights();
				}
				else{
					This.removeLabelRights();
				}
			});
		})(this);
		
		graphObject.label=this;
		
		return this;
	};
	
	//this is duplicate of function in HyperlinkLabel
	//this function puts text to cursor position in input element el.
	function insertTextAtCursor(el, text) {
		var val = el.val(), endIndex, range;
		if (typeof el.get(0).selectionStart != "undefined" && typeof el.get(0).selectionEnd != "undefined") {
			endIndex = el.get(0).selectionEnd;
			el.val(val.slice(0, el.get(0).selectionStart) + text + val.slice(endIndex));
			el.get(0).selectionStart = el.get(0).selectionEnd = endIndex + text.length;
		}
		else if (typeof document.selection != "undefined" && typeof document.selection.createRange != "undefined") {
			el.focus();
			range = document.selection.createRange();
			range.collapse(false);
			range.text = text;
			range.select();
		}
	}
	
	return Label;
});