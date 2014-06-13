<?php
/*
 * input: output:...
 */
 
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once './func/join_delete.php';


session_start();

if(isset($_SESSION['user'])){
  $user=$_SESSION['user'];
  $loggedin=true;
  $userstr=$user;
}else{
  $loggedin=false;
  $userstr='guest';
}

header('Content-type: application/json');

if($loggedin){
  if(isset($_POST['data'])){
    $data=json_decode(SanitizeString($_POST['data'])); 
    if(isset($data->username,$data->id)){
      
      
      
      /*
	username (if user), group id (if group), group to which to add (id)
      */
      
      $username=$data->username;
      $id=$data->id;
      
      
      $return_object=array();
      
      
      $db = new Everyman\Neo4j\Client();
      
      
      
      $return_object=add_user_to_group($db,$userstr,$username,$id);
      

      
      unset($db);
      
      echo json_encode($return_object);
    }
  }
}

function user_is_member($db,$user,$id){
  
  $string_user_is_member="MATCH (:User{username:{username}})<-[membership:MEMBER]-(:UserGroup{id:{id}})
  RETURN count(membership)";
  $params_user_is_member=array('username'=>$user, 'id'=>$id);
  $query_user_is_member=new Everyman\Neo4j\Cypher\Query($db, $string_user_is_member, $params_user_is_member);
  $result_user_is_member=$query_user_is_member->getResultSet();
  $is_member=$result_user_is_member[0]['count(membership)'];
  
  return $is_member>0?true:false;
}

function group_is_member($db,$id_member,$id_group){
  
  $string_group_is_member="MATCH (:UserGroup{id:{id_member}})<-[membership:MEMBER]-(:UserGroup{id:{id}})
  RETURN count(membership)";
  $params_group_is_member=array('id_member'=>$id_member, 'id'=>$id_group);
  $query_group_is_member=new Everyman\Neo4j\Cypher\Query($db, $string_group_is_member, $params_group_is_member);
  $result_group_is_member=$query_group_is_member->getResultSet();
  $is_member=$result_group_is_member[0]['count(membership)'];
  
  return $is_member>0?true:false;
}

function add_user_to_group($db,$this_user,$added_user,$id){
  $delete_join=join_delete($db,$this_user,$added_user,$id);
  
  
  $return_object=array('error'=>0, 'data'=>array('parent'=>array(),'users'=>array()));
  if(!user_is_member($db,$added_user,$id)){
    
    $date=date('m/d/Y h:i:s a');
    
    $string_add_user_to_group="MATCH (user:User{username:{this_user}})<-[:MEMBER]-(group:UserGroup{id:{id}}), (added_user:User{username:{added_user}})
    WHERE NOT (added_user)<-[:MEMBER]-(group)
    CREATE (added_user)<-[membership:MEMBER{admin:false,created:{date},creator:{this_user}}]-(group)
    RETURN added_user,group,membership";
    $params_add_user_to_group=array('this_user'=>$this_user,'added_user'=>$added_user,'date'=>$date, 'id'=>$id);
    $query_add_user_to_group=new Everyman\Neo4j\Cypher\Query($db, $string_add_user_to_group, $params_add_user_to_group);
    $result_add_user_to_group=$query_add_user_to_group->getResultSet();
    
    if($result_add_user_to_group[0]){
      $return_object['data']['parent']=array('username'=>$result_add_user_to_group[0]['group']->getProperty('id'));
    }

    $count=0;
    foreach($result_add_user_to_group as $row){
      $outusername=$row['added_user']->getProperty('username');
      $return_object['data']['users'][$outusername]=array('username'=>$outusername);
      $count++;
    }
    if($count==0){
      $return_object['error']=1;
      $return_object['message']="no group created";
    }
  }
  else{
    $return_object['error']=2;
    $return_object['message']="user is already a member";
  }
  return $return_object;
}

function add_group_to_group($db,$user,$name,$id){
  $return_object=array('error'=>0);
//   if(!check_group_existence($db,$user,$id)){
//     
//     $date=date('m/d/Y h:i:s a');
//     
//     $string_add_group_to_group="MATCH (user:User{username:{username}})
//     CREATE (user)<-[membership:MEMBER{admin:1,created:{date},creator:{username}}]-(group:UserGroup{name:{name},id:{id},created:{date},creator:{username}})
//     RETURN group,membership";
//     $params_add_group_to_group=array('name'=>$name,'username'=>$user,'date'=>$date, 'id'=>$id);
//     $query_add_group_to_group=new Everyman\Neo4j\Cypher\Query($db, $string_add_group_to_group, $params_add_group_to_group);
//     $result_add_group_to_group=$query_add_group_to_group->getResultSet();
//     $count=0;
//     foreach($result_add_group_to_group as $row){
//       $group=$row['group'];
//       $admin=!!$row['membership']->getProperty('admin');//we want to know whether the user is admin.
//       $return_object['data']=array('name'=>$group->getProperty('name'),'id'=>$group->getProperty('id'),'admin'=>$admin);
//       $count++;
//     }
//     if($count==0){
//       $return_object['error']=1;
//       $return_object['message']="no group created";
//     }
//   }
//   else{
//     $return_object['error']=2;
//     $return_object['message']="group already exists";
//   }
  return $return_object;
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}