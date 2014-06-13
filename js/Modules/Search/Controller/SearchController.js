define([],function(){
	
	function Controller(module){
		this.module=module;
		this.master=module.master;
	}
	
	Controller.prototype={
		constructor:Controller,
		processSubmit:function(submitObject){
			this.module.model.search({search:submitObject.string});
		}
	}
	
// 	function processSubmit(submitObject){
// 		SearchModel.search({search:submitObject.string});
// 	}
	
// 	function linksClicked(uuid){
// 		SearchModel.getLinksOfNode({uuid:uuid});
// 	}
// 	
// 	function hyperlinksClicked(uuid){
// 		SearchModel.getHyperlinksOfNode({uuid:uuid});
// 	}
	
	return Controller;//{
		//processSubmit:processSubmit/*,
// 		linksClicked:linksClicked,
// 		hyperlinksClicked:hyperlinksClicked*/
// 	};
});