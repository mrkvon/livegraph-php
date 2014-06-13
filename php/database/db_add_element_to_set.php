<?php
//require_once 'login.php';
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once('./func/match_ug.php');

session_start();

if(isset($_SESSION['user'])){
  $user=$_SESSION['user'];
  $loggedin=true;
  $userstr=$user;
}
else{
  $loggedin=false;
  $userstr='guest';
}

header('Content-type: application/json');

if($loggedin){
  //print_r($_POST['data']);
  if (isset($_POST['data'])){
    //echo('ok');
    $data=SanitizeString($_POST['data']); //data should be a json object {???}
    
    $data2=json_decode($data);
    
    //**** connecting to database
    
    $db = new Everyman\Neo4j\Client();
    //$db->getTransport()->useHttps()->setAuth('username', 'password');
    
    
    
    
    //**** returning object
    $return_object=array();
    
    if(isset($data2->set)&&isset($data2->set->uuid)&&isset($data2->element)&&isset($data2->element->uuid)){
      $return_object=add_element_to_set($db,$userstr,$data2->set->uuid,$data2->element->uuid);
    }
    
    
    //**** return object data
    
    echo json_encode($return_object);
    unset($db);
  }
}

function add_element_to_set($db, $user,$set_uuid,$element_uuid){
  $return_object=array();

  $params_add_element=array('username'=>$user,"set_uuid"=>$set_uuid,"element_uuid"=>$element_uuid);
  $string_add_element=match_ug("ug","username").
  'MATCH (ug)-[rights:RIGHTS]->(set:DataNode{uuid:{set_uuid}})
  WHERE (rights.have=\'o\' OR rights.have=\'w\')
  WITH set,ug MATCH (ug)-[rights:RIGHTS]->(element:DataNode{uuid:{element_uuid}})
  WHERE (rights.have=\'o\' OR rights.have=\'w\' OR rights.have=\'r\')
  CREATE UNIQUE (set)-[link:ELEMENT]->(element)
  RETURN link, set, element';
  
  //**** execute query
  $query_add_element=new Everyman\Neo4j\Cypher\Query($db, $string_add_element, $params_add_element);

  $result_add_element=$query_add_element->getResultSet();
  //$link=$result[0]['n'];

  //echo $node_id.'asdf';
  //**** save id into returning object
  if(sizeof($result_add_element)){
    $return_set=array('uuid'=>$result_add_element[0]['set']->getProperty('uuid'),
    'name'=>$result_add_element[0]['set']->getProperty('name'));
    
    $return_element=array('uuid'=>$result_add_element[0]['element']->getProperty('uuid'),
    'name'=>$result_add_element[0]['element']->getProperty('name'));
  
    $return_object=array('set'=>$return_set,'element'=>$return_element);
    
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