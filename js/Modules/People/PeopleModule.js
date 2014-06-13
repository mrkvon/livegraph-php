define(['./Model/PeopleModel','./View/PeopleView','./Controller/PeopleController'],function(PM,PV,PC){
  
  "use strict";
  
  function PeopleModule(app,master,menu){
		this.master=master;
		
    this.model=new PM(this);
    this.view=new PV(menu,app,this);
    this.controller=new PC(this);
  }
  
  return PeopleModule;
});