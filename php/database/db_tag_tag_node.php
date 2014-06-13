<?php
/*
 * input: {uuid:node_uuid,tag:tag_name},
   output:solve! not ideal! (taglink){tag:{name:name},node:{uuid:uuid},date:date,creator:user};
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
      
      $return_object=tag_node($db,$name,$uuid,$userstr);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function tag_node($db,$name_of_tag,$uuid_of_node,$user){
  $date=date('m/d/Y h:i:s a');
  $return_object=null;
  $string_tag_node=match_ug("ug","username")."MATCH (ug)-[rights:RIGHTS]->(node:DataNode{uuid:{node_uuid}})
    WHERE (rights.have='o' OR rights.have='w') WITH node MATCH (tag:Tag{name:{name}})
    CREATE UNIQUE (tag)-[tag_link:TAG]->(node)
    WITH tag_link,tag,node WHERE NOT(HAS (tag_link.created) OR HAS (tag_link.creator))
    SET tag_link.created={date},tag_link.creator={username}
    RETURN tag, tag_link, node";
  $params_tag_node=array('name'=>$name_of_tag,'username'=>$user,'date'=>$date, 'node_uuid'=>$uuid_of_node);
  $query_tag_node=new Everyman\Neo4j\Cypher\Query($db, $string_tag_node, $params_tag_node);
  $result_tag_node=$query_tag_node->getResultSet();
  foreach($result_tag_node as $row){
    //{tag:{name:name},node:{uuid:uuid},created:created,creator:user};
    $outname = $row['tag']->getProperty('name');
    $outdescription = $row['tag']->getProperty('description');
    $outnode_uuid = $row['node']->getProperty('uuid');
    $outdate = $row['tag_link']->getProperty('created');
    $outcreator = $row['tag_link']->getProperty('creator');
    $return_object=array(
      'name'=>$outname,
      'description'=>$outdescription,
      'node'=>array('uuid'=>$outnode_uuid),
      'created'=>$outdate,
      'creator'=>$outcreator
    );
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