define([],function(){
  
  
  function PeopleController(module){
    this.module=module;
    this.status={};
  }
  
  PeopleController.prototype={
    constructor:PeopleController,
    listen:function(message,data){
      console.log('controller listening');
      console.log('message');
      if(message){
	if(message.main=="groups"){
	  listenGroups(message,data,this.module);
	}
	else if(message.main=="people"){
	  listenPeople(message,data,this.module);
	}
	else{
	  console.log("PeopleController: call not understood");
	}
      }
    }
  }
  
  function listenGroups(message,data,module){
    if(message.sub=="submit_create_form"){//called from People>groups form
      module.model.listen({main:"groups",sub:"create_new_group",callback:message.callback},data);
    }
    else if(message.sub=="get_groups_of_user"){//called from People after start
      module.model.listen({main:"groups",sub:"get_groups_of_user",callback:message.callback},data);
    }
    else if(message.sub=="click_group_info"){
      module.model.listen({main:"groups",sub:"get_group_details",callback:message.callback},data);
    }
    else if(message.sub=="click_show_members"){
      module.model.listen({main:"groups",sub:"get_group_members",callback:message.callback},data);
    }
    else if(message.sub=="keyup_add_member"){
      module.model.listen({main:"groups",sub:"search_users",callback:message.callback},data);
    }
    else if(message.sub=="mouseup_user_hint"){
      module.model.listen({main:"groups",sub:"add_user_to_group",callback:message.callback},data);
    }
  }
  
  function listenPeople(message,data,module){
    if(message.sub=="keyup_search_users_groups"){
      //this is for searching users and groups
      module.model.listen({main:"people",sub:"search_users_groups",callback:message.callback},data);
    }
    else if(message.sub=="click_user_info"){
      module.model.listen({main:"people",sub:"get_user_details",callback:message.callback},data);
    }
    else if(message.sub=="group_detail_mouseup_join"){
      module.model.listen({main:"people",sub:"join_group",callback:message.callback},data);
    }
    else if(message.sub=="joiner_cancel_mouseup"){
      module.model.listen({main:"people",sub:"join_delete_from_group",callback:message.callback},data);
    }
    else if(message.sub=="joiner_add_mouseup"){
      module.model.listen({main:"groups",sub:"add_user_to_group",callback:message.callback},data);
    }
  }
  
  return PeopleController;
});