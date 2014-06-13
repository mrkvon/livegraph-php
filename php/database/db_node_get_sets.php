<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once('./func/match_ug.php');

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

if($loggedin||$userstr=="guest"){
  if(isset($_POST['data'])){
    $data=json_decode(SanitizeString($_POST['data'])); //data should be a json object {uuid:""}
    if(isset($data->uuid)){
      $db = new Everyman\Neo4j\Client();
      
      $uuid=$data->uuid;
      
      $return_object=get_sets($db,$uuid,$userstr);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}



function get_sets($db,$uuid_of_node,$user){
  $return_object=null;
  $string_get_sets=match_ug("ug","username")
  ."MATCH (ug)-[r:RIGHTS]->(element:DataNode{uuid:{node_uuid}})
      WHERE (r.have='o' OR r.have='w' OR r.have='r') WITH element
      MATCH (set)-[l:ELEMENT]->(element)
      RETURN set, l, element";
  $params_get_sets=array('username'=>$user, 'node_uuid'=>$uuid_of_node);
  $query_get_sets=new Everyman\Neo4j\Cypher\Query($db, $string_get_sets, $params_get_sets);
  $result_get_sets=$query_get_sets->getResultSet();

  if (sizeof($result_get_sets)) {
    $res2=$result_get_sets[0];
    $return_object['element']=array( "uuid"=>$res2['element']->getProperty('uuid'),"name"=>$res2['element']->getProperty('name'));
  }

  foreach($result_get_sets as $row)  {
    $set=array( "uuid"=>$row['set']->getProperty('uuid'),"name"=>$row['set']->getProperty('name'));
    $return_object['sets'][$set['uuid']]=$set;
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