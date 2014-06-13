<?php
/*
 * input:
   output:
 */
 
 //this function should delete (:Group)-[:JOIN]->(:User) :JOIN relationship between group of given id and given username ($userstr)
 
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once('./func/join_delete.php');

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
    if(isset($data->id,$data->username)){
      $db = new Everyman\Neo4j\Client();
      
      $id=$data->id;
      $username=$data->username;
      
      $return_object=join_delete($db,$userstr,$username,$id);
      
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