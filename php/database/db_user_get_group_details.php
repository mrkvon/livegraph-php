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
      
      $return_object=get_group_details($db,$userstr,$id);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function get_group_details($db,$user,$id){
  $return_object=array('error'=>0,'data'=>array());
  $string_get_group_details="MATCH (group:UserGroup{id:{id}}),(user:User{username:{username}})
  OPTIONAL MATCH (group)-[mem:MEMBER]->()
  OPTIONAL MATCH (user)<-[m:MEMBER]-(group)
  OPTIONAL MATCH (user)<-[join:JOIN]-(group)
  OPTIONAL MATCH (user)<-[:MEMBER{admin:1}]-(group)-[:JOIN]->(wuser)
  RETURN group, count(mem),m,join,wuser";
  $params_get_group_details=array('username'=>$user,'id'=>$id);
  $query_get_group_details=new Everyman\Neo4j\Cypher\Query($db, $string_get_group_details, $params_get_group_details);
  $result_get_group_details=$query_get_group_details->getResultSet();
  
  $admin=false;
  
  if($result_get_group_details[0]){
    $row=$result_get_group_details[0];
    //id:{name:,id:,member_count:,admin:}
    //
    $member_count=$row['count(mem)'];
    $idout=$row['group']->getProperty('id');
    $name=$row['group']->getProperty('name');
    $is_member=!!$row['m'];
    if($is_member){
      $joined=$row['m']->getProperty('created');
      $admin=!!$row['m']->getProperty('admin');
    }
    else{
      $awaiting=!!$row['join'];
    }
    
    $return_object['data']=array(
      'name'=>$name,
      'id'=>$idout,
      'member'=>$is_member,
      'member_count'=>$member_count
    );
    if($is_member){
      $return_object['data']['admin']=$admin;
      $return_object['data']['joined']=$joined;
      if($admin){
	$return_object['data']['awaiting']=array();
      }
    }
    else{
      $return_object['data']['awaiting']=$awaiting;
    }
  }
  if($admin){
    foreach($result_get_group_details as $row){
      if($row['wuser']){
	$wusername=$row['wuser']->getProperty('username');
	$return_object['data']['awaiting'][$wusername]=array('username'=>$wusername);
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