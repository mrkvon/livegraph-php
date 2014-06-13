<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');

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
    $data=json_decode(SanitizeString($_POST['data']));
    
    $username=$data->username;
    
    $return_object=array("users"=>array(),"groups"=>array());
    //{users:{username:{},username:{},...},groups:{name:{},name:{},...}}
    
    $db = new Everyman\Neo4j\Client();
    $string_get_user_info="MATCH (user:User) WHERE user.username={username} RETURN user";
    $params_get_user_info=array('username'=>$username);
    $query_get_user_info=new Everyman\Neo4j\Cypher\Query($db, $string_get_user_info, $params_get_user_info);
    $result_get_user_info=$query_get_user_info->getResultSet();
  //   print_r($result_get_user_info);
    foreach($result_get_user_info as $row)
    {
      $usernameout=$row['user']->getProperty('username');
      $return_object["users"][$usernameout]=array('username'=>$usernameout);
    }
    unset($db);
    echo json_encode($return_object);
  }
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}