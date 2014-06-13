<?php
/*
 * input:
   output:
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
    if(isset($data->username)){
      $db = new Everyman\Neo4j\Client();
      
      $username=$data->username;
      
      $return_object=get_user_details($db,$userstr,$username);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function get_user_details($db,$this_user,$username){
  $return_object=array('error'=>0,'data'=>array());
  $string_get_user_details="MATCH (user:User{username:{username}}) RETURN user";
  $params_get_user_details=array('username'=>$username/*,'this_user'=>$this_user*/);
  $query_get_user_details=new Everyman\Neo4j\Cypher\Query($db, $string_get_user_details, $params_get_user_details);
  $result_get_user_details=$query_get_user_details->getResultSet();
  foreach($result_get_user_details as $row){
    //username:{username:,joined:,website,info,}
    $outusername=$row['user']->getProperty('username');
    $joined=$row['user']->getProperty('created');
    $website=$row['user']->getProperty('website');
    $info=$row['user']->getProperty('info');
    
    $return_object['data']=array(
      'username'=>$outusername,
      'joined'=>$joined,
      'website'=>$website,
      'info'=>$info
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