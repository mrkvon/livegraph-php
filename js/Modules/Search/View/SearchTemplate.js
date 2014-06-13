define([],function(){
  function createResult(type,name,content,uuid){
    //what shall be returned?
    
    //todo: add classes, define them in settings
    var result=$(document.createElement('div')).addClass('search_result')
    .css({'max-height':'40px','overflow':'hidden'});
    
    var resultTools=$(document.createElement('div')).appendTo(result);
    
    var resultData=$(document.createElement('div')).appendTo(result);
    
    var resultDataName=$(document.createElement('div')).appendTo(resultData).addClass('search_result_name');
    
    var typeSpan=$(document.createElement('span')).appendTo(resultDataName);
    typeSpan.append(document.createTextNode(type)).addClass('search_result_name_type');
    resultDataName.append(document.createTextNode('::'));
    var nameSpan=$(document.createElement('span')).appendTo(resultDataName);
    nameSpan.append(document.createTextNode(name)).addClass('search_result_name_name');
    
    var resultDataContent=$(document.createElement('div')).appendTo(resultData).append(document.createTextNode(content));
    //resultDataContent.textContent=content;
    
    
    var resultToolsShow=/*resultTools.appendChild*/$(document.createElement('button')).append(document.createTextNode('show'));
    //resultToolsShow.textContent='show';
    
    (function(result){
      result.on('mouseover',function(){
	result.css({'max-height':'100px'});
      });
      result.on('mouseout',function(){
	result.css({'max-height':'40px'});
      });
    })(result);

    return {
      mainDiv:result,
      buttons:{
	show:resultToolsShow
      }
    };
  }
  
  
  return {
    createResult:createResult
  };
});