define(['jquery'],function(jquery){
	
	function Model(module){
		this.module=module;
		this.master=module.master;
	}
	
	Model.prototype={
		constructor:Model,
		search:function(object){
			var searchModule=this.module;
			var data='data='+encodeURIComponent(object.search);
			jquery.ajax(this.master.database+'db_search_simple.php',{data:data,type:'POST',async:true,success:function(backpack){
				console.log(backpack);
				searchModule.view.showResults(backpack);
			}});
		}
	}
	
// 	function search(object){
// 		var data='data='+encodeURIComponent(object.search);
// 		jquery.ajax('/db_search_simple.php',{data:data,type:'POST',async:true,success:function(backpack){
// 			 console.log(backpack);
// 			SearchView.showResults(backpack);
// 		}});
// 	}
	
//	 function getLinksOfNode(node){
//		 var data='data='+encodeURIComponent(JSON.stringify({uuid:node.uuid}));
//		 jquery.ajax('/db_get_links_of_node.php',{data:data,type:'POST',async:true,success:function(backpack){
//			 SearchView.links({node:{uuid:node.uuid},graph:backpack});
//		 }});
//	 }
//	 
//	 function getHyperlinksOfNode(node){
//		 var data='data='+encodeURIComponent(JSON.stringify({uuid:node.uuid}));
//		 jquery.ajax('/db_get_hyperlinks_of_node.php',{data:data,type:'POST',async:true,success:function(backpack){
//			 SearchView.hyperlinks({node:{uuid:node.uuid},graph:backpack});
//		 }});
//	 }
	
	return Model;/*{
		search:search,
		getLinksOfNode:getLinksOfNode,
		getHyperlinksOfNode:getHyperlinksOfNode,
	};*/
});