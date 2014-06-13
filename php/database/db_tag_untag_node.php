<?php
/*
 * input: {uuid:node_uuid,tag:tag_name},
   output:solve! not ideal! (taglink){tag:{name:name},node:{uuid:uuid}};
 */
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

if($loggedin){
  if(isset($_POST['data'])){
    $data=json_decode(SanitizeString($_POST['data'])); 
    if(isset($data->tag,$data->uuid)){
      $db = new Everyman\Neo4j\Client();
      
      $name=$data->tag;
      $uuid=$data->uuid;
      
      $return_object=untag_node($db,$name,$uuid,$userstr);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function untag_node($db,$name_of_tag,$uuid_of_node,$user){
  $return_object=null;
  $string_untag_node=match_ug('ug','username')."MATCH (ug)-[rights:RIGHTS]->(:DataNode{uuid:{node_uuid}})<-[tag_link:TAG]-(:Tag{name:{name}})
    WHERE (rights.have='o' OR rights.have='w') RETURN DISTINCT tag_link";
  $params_untag_node=array('name'=>$name_of_tag,'username'=>$user,'node_uuid'=>$uuid_of_node);
  $query_untag_node=new Everyman\Neo4j\Cypher\Query($db, $string_untag_node, $params_untag_node);
  $result_untag_node=$query_untag_node->getResultSet();

  //now we need to count number of deleted objects. if number is 1 or more,
  //send about what to delete to application 
  foreach($result_untag_node as $row){
    //{tag:{name:name},node:{uuid:uuid}}
//     print_r($row['tag_link']);
    $row['tag_link']->delete();
    $return_object=array('name'=>$name_of_tag,'node'=>array('uuid'=>$uuid_of_node));
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