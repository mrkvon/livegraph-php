<?php
/*
 * input:
   output:
 */
 
 //this function should create (:Group)-[:JOIN]->(:User) relationship between group of given id and this_user ($userstr)
 
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once('./func/join_group.php');

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
      
      $return_object=join_group($db,$userstr,$id);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}