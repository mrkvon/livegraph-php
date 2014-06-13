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
    if(isset($data->name,$data->description)){
      $db = new Everyman\Neo4j\Client();
      
      $name=$data->name;
      
      $return_object=destroy_tag($db,$name,$userstr);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function destroy_tag($db,$name,$user){
  $return_object=array();
  $string_destroy_tag="MATCH (tag:Tag{name:{name}})-[r]-() DELETE r,tag";
  //Maybe it could be done like this: destroy the Tag only if you have right to destroy all the relations.
  //Otherwise you can't destroy the tag and you only destroy your uses of Tag.
  $params_destroy_tag=array('name'=>$name);
  $query_destroy_tag=new Everyman\Neo4j\Cypher\Query($db, $string_destroy_tag, $params_destroy_tag);
  $result_destroy_tag=$query_destroy_tag->getResultSet();

  return $return_object;
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}