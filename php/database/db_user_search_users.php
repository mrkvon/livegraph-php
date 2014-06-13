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
    if(isset($data->text)){
      $db = new Everyman\Neo4j\Client();
      
      $search_string=$data->text;
      
      $return_object=search_user($db,$search_string);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function search_user($db,$search_string){
  $return_object=array('error'=>0,'data'=>array('users'=>array()));
  $regex='(?is).*'.preg_quote($search_string).'.*';
  $string_search_user="MATCH (user:User) WHERE (user.username=~ {regex}) RETURN user, user.username ORDER BY user.username ASC LIMIT 10";
  $params_search_user=array('regex'=>$regex);
  $query_search_user=new Everyman\Neo4j\Cypher\Query($db, $string_search_user, $params_search_user);
  $result_search_user=$query_search_user->getResultSet();
  foreach($result_search_user as $row){
    $username=$row['user']->getProperty('username');
    
    $return_object['data']['users'][$username]=array('username'=>$username);
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