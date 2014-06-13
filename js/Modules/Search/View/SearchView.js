define(['Modules/Search/View/SearchTemplate','mathjax','jquery'],function(SearchTemplate,mathjax,$){
	
	function Template(dom){
		var settings={inputHeight:30}
		
		var searchWrapper=$(document.createElement('div')).addClass("search-wrapper")
		.css({position:'absolute',width:'100%',height:'100%','pointer-events':'none'});
		
		var searchInput=$(document.createElement('div')).appendTo(searchWrapper)
		.addClass("search_wrapper_input")
		.css({'pointer-events':'visible',position:'absolute',/*top:'0px',right:'0px',*/width:'100%',height:(settings.inputHeight)+'px',border:'1px solid rgba(20,20,233,0.5)'});
		
		var searchForm=$(document.createElement('form')).appendTo(searchInput);
		
		var inputWrap=$(document.createElement('div'))
		.css({position:'absolute',top:'0px',left:'0px',right:'50px',height:'100%'})
		.appendTo(searchForm);
		
		var submitWrap=$(document.createElement('div'))
		.css({position:'absolute',top:'0px',width:'50px',right:'0px',height:'100%'})
		.appendTo(searchForm);
		
		var searchFormInput=$(document.createElement('input')).appendTo(inputWrap)
		.attr({'type':'text'})
		.css({'width':'100%','font-size':'15px','height':'100%'/*,float:'left'*/});
		
		var searchFormSubmit=$(document.createElement('input')).appendTo(submitWrap)
		.attr({'type':'submit','value':'Search!'}).css({width:'100%','line-height':'100%',height:'100%'/*,float:'right'*/,color:'white','background-color':'rgba(20,20,233,0.5)'});
		
		var sOWrap=$(document.createElement('div')).appendTo(searchWrapper).addClass('test-class')
		.css({position:'absolute',width:'100%',/*'height':'100%',*/top:settings.inputHeight+'px',/*right:'0px',*//*'margin-top':'45px',
				 'margin-right':'15px',*/'bottom':'0px','pointer-events':'none'});
		//console.log(searchOutputWrap);
		var searchOutput=$(document.createElement('div')).addClass('search_wrapper_output')
		.css({position:'absolute','max-height':'100%',width:'100%','background-color':'rgba(20,20,233,0.2)','pointer-events':'auto',overflow:'auto',float:'right'}).appendTo(sOWrap);
//		console.log(searchOutput.parent().get()[0]);

		
		$(dom).append(searchWrapper);
		
		return {wrapper:searchWrapper,output:searchOutput,form:searchForm,input:searchFormInput};
	}
	
	
	function View(dom,module){
		this.module=module;
		this.master=module.master;
		
		this.dom=Template(dom);
		
		this.resultSet={};
		
		(function(This){
			This.dom.form.on('submit',function(e){
				e.preventDefault();
				require(['Modules/Search/Controller/SearchController'],function(SearchController){
					This.module.controller.processSubmit({string:This.dom.input.val()});
				});
			});
		})(this);
	}
	
	View.prototype={
		constructor:View,
		showResults:function(results){
			
			var searchOutput=this.dom.output;
			var master=this.master;
			var resultSet=this.resultSet;
			
			resultSet={};
			searchOutput.empty();
			
			var list=$(document.createElement('ol')).appendTo(searchOutput);
			//console.log(results);
			for(var i=0, len=results.length;i<len;i++){
				(function(i){
					var li=$(document.createElement('li')).appendTo(list);
					var ol=$(document.createElement('div')).appendTo(li)
					.css({'pointer-events':'auto','background-color':'rgba(255,255,255,0.9)',margin:'3px',border:'1px solid #33d'});

					var result=SearchTemplate.createResult('node',results[i].name,results[i].content,results[i].uuid);
					
					result.mainDiv.on("mouseup",function(){
						master.graph.controller.listen('search_click_show_node',results[i].uuid);
					});
					
					result.mainDiv.appendTo(ol);
					resultSet[results[i].uuid]={result:result.mainDiv,links:result.links,hyperlinks:result.hyperlinks};
				})(i);
			}
			//searchWrapper.append(searchOutput);
			
			/**MathJax-ing the results**/
			setTimeout((function(object){
				//console.log('timeout');
				return function(){
					mathjax.Hub.Queue(["Typeset",MathJax.Hub,object]);
				};
			})(this.dom.output.get()),0);
		}
	}
	
	//var resultSet={};//uuid:{result pointer, links pointer, hyperlinks pointer}
	
	//var searchOutput;
	
	//var master;
	//var module;
	
	
// 	function showResults(results){ //results could be object {}
// 		resultSet={};
// 		
// 		//searchOutput=searchOutput.parentNode.removeChild(searchOutput);
// 		searchOutput.empty();
// 		
// 		var list=$(document.createElement('ol')).appendTo(searchOutput);
// 		//console.log(results);
// 		for(var i=0, len=results.length;i<len;i++){
// 			(function(i){
// 				var li=$(document.createElement('li')).appendTo(list);
// 				var ol=$(document.createElement('div')).appendTo(li)
// 				.css({'pointer-events':'auto','background-color':'rgba(255,255,255,0.9)',margin:'3px',border:'1px solid #33d'});
// 
// 				var result=SearchTemplate.createResult('node',results[i].name,results[i].content,results[i].uuid);
// 				
// 				result.mainDiv.on("mouseup",function(){
// 					master.graph.controller.listen('search_click_show_node',results[i].uuid);
// 				});
// 				
// 				result.mainDiv.appendTo(ol);
// 				resultSet[results[i].uuid]={result:result.mainDiv,links:result.links,hyperlinks:result.hyperlinks};
// 			})(i);
// 		}
// 		//searchWrapper.append(searchOutput);
// 		setTimeout((function(object){
// 			//console.log('timeout');
// 			return function(){
// 				mathjax.Hub.Queue(["Typeset",MathJax.Hub,object]);
// 			};
// 		})(searchOutput.get()),0);
// 		
// 	}
	
//	 function clearResults(){
//		 
//	 }

	return View;/*{
		init:init,
		showResults:showResults
	};*/
});