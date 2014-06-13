define(['./Model/SearchModel','./View/SearchView','./Controller/SearchController'],function(Model,View,Controller){
  
  "use strict";
  //this is not used yet and not finished. made from PeopleModule.js
  function SearchModule(htmlDom,master){
    this.master=master;
    
    //View.init(htmlDom,this.master,this);
    this.model=new Model(this);
    this.view=new View(htmlDom,this);
    this.controller=new Controller(this);
  }
  
  return SearchModule;
});