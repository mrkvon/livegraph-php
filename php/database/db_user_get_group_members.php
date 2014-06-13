<?php
/*
 * input:
   output:
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
    if(isset($data->id)){
      $db = new Everyman\Neo4j\Client();
      $id=$data->id;
      
      $return_object=get_group_members($db,$userstr,$id);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function get_group_members($db,$user,$id){
  $return_object=array('error'=>0,'data'=>array('users'=>array(),'groups'=>array(),'parent'=>array('id'=>$id)));
  $string_get_group_members="MATCH (u:User{username:{username}})<-[m:MEMBER]-(group:UserGroup{id:{id}})
  WITH group MATCH (group)-[:MEMBER]->(member) RETURN member, labels(member) as labels";
  $params_get_group_members=array('username'=>$user,'id'=>$id);
  $query_get_group_members=new Everyman\Neo4j\Cypher\Query($db, $string_get_group_members, $params_get_group_members);
  $result_get_group_members=$query_get_group_members->getResultSet();
  foreach($result_get_group_members as $row){
    for($i=0, $len=sizeof($row['labels']);$i<$len;$i++){
      if($row['labels'][$i]=='User'){
	$username=$row['member']->getProperty('username');
	$return_object['data']['users'][$username]=array('username'=>$username);
      }
      if($row['labels'][$i]=='UserGroup'){
	$name=$row['member']->getProperty('name');
	$outid=$row['member']->getProperty('id');
	$return_object['data']['groups'][$id]=array('name'=>$name,'id'=>$outid);
      }
    }
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