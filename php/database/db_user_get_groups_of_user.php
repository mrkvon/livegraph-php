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
  if(true/*isset($_POST['data'])*/){
    //$data=json_decode(SanitizeString($_POST['data']));
    if(true/*isset($data->uuid)*/){
      $db = new Everyman\Neo4j\Client();

//       $uuid=$data->uuid;
      
      $return_object=get_groups($db,$userstr);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function get_groups($db,$user){
  $return_object=array('error'=>0,'data'=>array());
  $string_get_groups="MATCH (u:User{username:{username}})<-[m:MEMBER]-(group:UserGroup) RETURN group,m";
  $params_get_groups=array('username'=>$user);
  $query_get_groups=new Everyman\Neo4j\Cypher\Query($db, $string_get_groups, $params_get_groups);
  $result_get_groups=$query_get_groups->getResultSet();
  foreach($result_get_groups as $row){
    //id:{name:,id:,admin:}
    $admin=!!$row['m']->getProperty('admin');
    $name=$row['group']->getProperty('name');
    $id=$row['group']->getProperty('id');
    
    $return_object['data'][$id]=array('name'=>$name,'id'=>$id,'admin'=>$admin);
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