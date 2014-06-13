<?php
//require_once 'login.php';
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

// header('Content-type: application/json');

if($loggedin){
  //print_r($_POST['data']);
  if (isset($_POST['data'])){
//     echo('ok');
    $data=SanitizeString($_POST['data']); //data should be a json object {username:"",flag:"ALL"}
    
    $data2=json_decode($data);
    
    //**** connecting to database
    
    $db = new Everyman\Neo4j\Client();
    //$db->getTransport()->useHttps()->setAuth('username', 'password');
    
    
    
    
    //**** returning object: will return required users' data.
    $return_object=array('users'=>array());
    
    //get_all_users is an early mainly testing function without regard to further usage.
    if(isset($data2->flag)&&($data2->flag=='ALL')){
      $users=get_all_users($db,$userstr);
      if(sizeof($users)){
	$return_object['users']=$users;
      }
    }
    
    
    //**** return object data
    //echo ('done');
    echo json_encode($return_object);
    unset($db);
  }
}

function get_all_users($db, $user){
//   echo "in get function";
  $return_object=array();
    //**** save node into database
    //**** parameters
    
    $params_get_all_users=array('username'=>$user);
    $string_get_all_users='MATCH (:UserGroup{id:"_all"})-[:MEMBER]->(n:User) RETURN n.username AS username';
    
    //**** execute query
    $query_get_all_users=new Everyman\Neo4j\Cypher\Query($db, $string_get_all_users, $params_get_all_users);

    $result_get_all_users=$query_get_all_users->getResultSet();
    //$node=$result[0]['n'];
//     print_r($result_get_all_users);
    //echo sizeof($result_get_all_users);
    //**** save id into returning object
    for($i=0,$len=sizeof($result_get_all_users);$i<$len;$i++){
      $return_object[]=array('username'=>$result_get_all_users[$i]['username']);
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