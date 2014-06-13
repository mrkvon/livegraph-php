define(['./Model/GraphModel','./View/GraphView','./Controller/GraphController'],function(Model,View,Controller){
	
	"use strict";
	//this is not used yet and not finished. made from PeopleModule.js
	function GraphModule(htmlDom,master){
		this.master=master;
		
//		 View.init(htmlDom);
		this.model=new Model(this.master,this);
		this.controller=new Controller(this.master,this);
		this.view=new View(htmlDom,this.master,this);
		
		//what to do after loading of this module? (use url to create graph)
		this.controller.listen({main:'graph',sub:'load'},{url:window.location.pathname});
	}
	
	return GraphModule;
});
	