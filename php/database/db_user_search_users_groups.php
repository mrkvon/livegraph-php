<?php
/*
 * input:{name:...} ??? output:...{name:...}
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
    if(isset($data->text)){
      $db = new Everyman\Neo4j\Client();
      
      $search_string=$data->text;
      
      $users=search_users($db,$search_string);
      $groups=search_groups($db,$search_string);
      
      $return_object=array('error'=>0,'data'=>array());
      
      if($users['error']==0 && $groups['error']==0){
	$return_object['data']['users']=$users['data']['users'];
	$return_object['data']['groups']=$groups['data']['groups'];
      }
      else{
	$return_object['error']=1;
      }
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function search_users($db,$search_string){
  $return_object=array('error'=>0,'data'=>array('users'=>array()));
  $regex='(?is).*'.preg_quote($search_string).'.*';
  $string_search_user="MATCH (user:User) WHERE (user.username=~ {regex}) RETURN user, user.username ORDER BY user.username ASC LIMIT 10";
  $params_search_user=array('regex'=>$regex);
  $query_search_user=new Everyman\Neo4j\Cypher\Query($db, $string_search_user, $params_search_user);
  $result_search_user=$query_search_user->getResultSet();
  foreach($result_search_user as $row){
    $username=$row['user']->getProperty('username');
    
    $return_object['data']['users'][$username]=array('username'=>$username);
  }
  return $return_object;
}

function search_groups($db,$search_string){
  $return_object=array('error'=>0,'data'=>array('groups'=>array()));
  $regex='(?is).*'.preg_quote($search_string).'.*';
  $string_search_groups="MATCH (group:UserGroup) WHERE ((group.name=~ {regex}) OR (group.id=~ {regex})) RETURN group, group.name ORDER BY group.name ASC LIMIT 10";
  $params_search_groups=array('regex'=>$regex);
  $query_search_groups=new Everyman\Neo4j\Cypher\Query($db, $string_search_groups, $params_search_groups);
  $result_search_groups=$query_search_groups->getResultSet();
  foreach($result_search_groups as $row){
    $groupname=$row['group']->getProperty('name');
    $groupid=$row['group']->getProperty('id');
    
    $return_object['data']['groups'][$groupid]=array('name'=>$groupname,'id'=>$groupid);
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