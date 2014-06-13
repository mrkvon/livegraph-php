<?php
/*
 * input:
   output:
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

if($loggedin||$userstr=='guest'){
  if(isset($_POST['data'])){
    $data=json_decode(SanitizeString($_POST['data'])); 
    if(isset($data->uuid)){
      $db = new Everyman\Neo4j\Client();

      $uuid=$data->uuid;
      
      $return_object=get_tags_of_node($db,$uuid,$userstr);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function get_tags_of_node($db,$uuid_of_node,$user){
  $return_object=array();
  $string_get_tags_of_node=match_ug("ug","username")."MATCH (ug)-[rights:RIGHTS]->(node:DataNode{uuid:{node_uuid}})
    WHERE (rights.have='o' OR rights.have='w' OR rights.have='r') WITH node MATCH (tag:Tag)-[:TAG]->(node)
    RETURN tag, node";
  $params_get_tags_of_node=array('username'=>$user,'node_uuid'=>$uuid_of_node);
  $query_get_tags_of_node=new Everyman\Neo4j\Cypher\Query($db, $string_get_tags_of_node, $params_get_tags_of_node);
  $result_get_tags_of_node=$query_get_tags_of_node->getResultSet();
  if(isset($result_get_tags_of_node[0])){
    $return_object['node']=array('uuid'=>$result_get_tags_of_node[0]['node']->getProperty('uuid'));
    $return_object['tags']=array();
  }
  foreach($result_get_tags_of_node as $row){
    //return:{node:{uuid:uuid},tags:{name:{tag_object},name:{tag_object},...}}
    //tag_object:{name:name, description:description}
    if($row['tag']){
      $outname = $row['tag']->getProperty('name');
      $outdescription=$row['tag']->getProperty('description');
      $outdate = $row['tag']->getProperty('created');
      $outcreator = $row['tag']->getProperty('creator');
      $tag=array('name'=>$outname,'description'=>$outdescription,'created'=>$outdate,'creator'=>$outcreator);
      $return_object['tags'][$outname]=$tag;
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
