<?php
/*
 * input: output:...
 */
 
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');

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
    if(isset($data->name,$data->id)){
      
      $name=$data->name;
      $id=strtolower($data->id);
      //validate name and id (id: only a-z0-9-_)
      $id_characters=preg_match('/\A^[a-z0-9][a-z0-9._-]{2,}\z/',$id)?true:false; //username should consist only of a-z A-Z 0-9 _ -.
      $id_length=sizeof($id)>=3?true:false;
      
      
      $return_object=array();
      
      
      if($id_characters){
	$db = new Everyman\Neo4j\Client();
	$return_object=create_group($db,$userstr,$name,$id);
	unset($db);
      }
      else{
	$return_object=array('error'=>1,'message'=>'id must match /\A^[a-z0-9][a-z0-9._-]{2,}\z/ (start with alphanumerical, consist only of alphanumerical,_,-,., have at least 3 characters)');
      }
      
      echo json_encode($return_object);
    }
  }
}

function check_group_existence($db,$user,$id){
  $string_check_group="MATCH (group:UserGroup{id:{id}}) RETURN COUNT(group)";
  $params_check_group=array('id'=>$id);
  $query_check_group=new Everyman\Neo4j\Cypher\Query($db, $string_check_group, $params_check_group);
  $result_check_group=$query_check_group->getResultSet();
  return $result_check_group[0]['COUNT(group)']?true:false;
}

function create_group($db,$user,$name,$id){
  $return_object=array('error'=>0);
  if(!check_group_existence($db,$user,$id)){
    
    $date=date('m/d/Y h:i:s a');
    
    $string_create_group="MATCH (user:User{username:{username}})
    CREATE (user)<-[membership:MEMBER{admin:1,created:{date},creator:{username}}]-(group:UserGroup{name:{name},id:{id},created:{date},creator:{username}})
    RETURN group,membership";
    $params_create_group=array('name'=>$name,'username'=>$user,'date'=>$date, 'id'=>$id);
    $query_create_group=new Everyman\Neo4j\Cypher\Query($db, $string_create_group, $params_create_group);
    $result_create_group=$query_create_group->getResultSet();
    $count=0;
    foreach($result_create_group as $row){
      $group=$row['group'];
      $admin=!!$row['membership']->getProperty('admin');//we want to know whether the user is admin.
      $return_object['data']=array('name'=>$group->getProperty('name'),'id'=>$group->getProperty('id'),'admin'=>$admin);
      $count++;
    }
    if($count==0){
      $return_object['error']=1;
      $return_object['message']="no group created";
    }
  }
  else{
    $return_object['error']=2;
    $return_object['message']="group already exists";
  }
  return $return_object;
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}