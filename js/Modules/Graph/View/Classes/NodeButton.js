define(['Modules/Graph/View/Classes/Label','jquery'],function (Label,$) {
	// Forces the JavaScript engine into strict mode: http://tinyurl.com/2dondlh
	"use strict";

	/**
	* Structure inspired by https://gist.github.com/jonnyreeves/2474026
	*/
	function NodeButton(nodeData,graph,parent){//
		this.module=parent.module;
		this.master=parent.master;
		
		var main=$(document.createElement("li"));
		var close=$(document.createElement("span")).appendTo(main).append(document.createTextNode("x "));
		main.append(document.createTextNode(nodeData.name));
		this.dom={main:main,close:close};
		this.name=nodeData.name;
		this.uuid=nodeData.uuid;
		this.node=graph.node(nodeData.uuid);
		this.parent=parent;
		this.list=undefined; //list of these nodeButtons
		
		return this;
	}
	
	
	NodeButton.prototype = {
		
		constructor: NodeButton,
		addTo:function(objects,DOMlist){
			this.list=objects;
			//console.log('*********************************');
			if(objects[this.uuid]){
				objects[this.uuid].remove();
			}
			objects[this.uuid]=this;
			$(DOMlist).append(this.dom.main);
			return this;
		},
		createRemovingListener:function(action,ownerData){//action:name of action to perform after click
			(function(This){
				This.dom.close.on('mouseup',function(e){
					e.stopPropagation();
					This.module.controller.listen(action,{button:{uuid:This.uuid},owner:ownerData});
				});
			})(this);
			return this;
		},
		createClickListener:function(action,ownerData){
			(function(This){
				This.dom.main.on('mouseup',function(){
					This.module.controller.listen(action,{button:{uuid:This.uuid},owner:ownerData});
				});
			})(this);
		},
		remove:function(){
			this.dom.main.remove();
			
			if(this.list) delete this.list[this.uuid];
	//		 delete this;
		}
	};
	
	
	return NodeButton;
});