<?php
//require_once 'login.php';
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once('./../match_ug.php');


session_start();

if(isset($_SESSION['user']))
{
  $user=$_SESSION['user'];
  $loggedin=true;
  $userstr=$user;
}
else
{
  $loggedin=false;
  $userstr='guest';
}

header('Content-type: application/json');

if($loggedin){
  //print_r($_POST['data']);
  if (isset($_POST['data'])){
    //echo('ok');
    $data=json_decode(sanitize_string($_POST['data']));

    
    //**** connecting to database
    
    $db = new Everyman\Neo4j\Client();
    //$db->getTransport()->useHttps()->setAuth('username', 'password');
    
    //**** returning object
    $return_object=array('set'=>array(),'elements'=>array());
    
    if(isset($data->set,$data->element,$data->set->uuid,$data->element->uuid)){
      $deleted=delete_element($db,$userstr,$data->set->uuid,$data->element->uuid);
      $return_object=$deleted;
    }
    
    
    //**** return object data
    
    echo json_encode($return_object);
    unset($db);
  }
}

function delete_element($db, $user,$set_uuid, $element_uuid){
  $return_object=array('set'=>array(),'elements'=>array());
  
  if(isset($set_uuid)&&isset($element_uuid))
  {
    //**** save node into database
    //**** parameters
    
    $params=array('username'=>$user,'set'=>$set_uuid,'element'=>$element_uuid);
    
//get data which are going to be deleted (query string)
    $string_read=match_ug('ug','username').'MATCH (ug)-[rights:RIGHTS]->(set:DataNode{uuid:{set}})-[elink:ELEMENT]->(element:DataNode{uuid:{element}}) WHERE (rights.have=\'o\' OR rights.have=\'w\') RETURN count(elink)';
//delete data (query string)
    $string_delete=match_ug('ug','username').'MATCH (ug)-[rights:RIGHTS]->(set:DataNode{uuid:{set}})-[elink:ELEMENT]->(element:DataNode{uuid:{element}}) WHERE (rights.have=\'o\' OR rights.have=\'w\') DELETE elink';
    
    //**** execute query
    $query_read=new Everyman\Neo4j\Cypher\Query($db, $string_read, $params);
    $result_read=$query_read->getResultSet();
    
    if(sizeof($result_read[0]['count(elink)'])>0){
      $return_object['set']["uuid"]=$set_uuid;
      $return_object['elements'][$element_uuid]=array('uuid'=>$element_uuid);
    }
    
    $query_delete=new Everyman\Neo4j\Cypher\Query($db, $string_delete, $params);
    $result_delete=$query_delete->getResultSet();    
  }
  return $return_object;
}


function sanitize_string($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}