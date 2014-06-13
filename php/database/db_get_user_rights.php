<?php
//require_once 'login.php';
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once('./func/match_ug.php');

/*input: $_POST['data']={"username":username}, we want to get rights*/

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
  if (isset($_POST['data'])){
    $data=SanitizeString($_POST['data']); //data should be a json object {username:"",flag:"ALL"}
    
    $data2=json_decode($data);
    
    //**** connecting to database
    
    $db = new Everyman\Neo4j\Client();
    
    //**** returning object: will return required users' data.
    $return_object=array();
    
    
    if(true/*isset($data2->flag)&&($data2->flag=='ALL')*/){
    
      $user_give=$data2->username;
      $uuid=$data2->uuid;
      $rights=get_user_rights($db,$user_give,$userstr,$uuid);
      if(sizeof($rights)){
	$return_object=$rights;
      }
    }
    
    
    //**** return object data
    //echo ('done');
    echo json_encode($return_object);
    unset($db);
  }
}

function get_user_rights($db, $user,$userstr,$node_uuid){
  
  function rights_to_number($right){
    return ($right=='o')?3:(($right=='w')?2:(($right=='r')?1:0));
  }
  function number_to_rights($num){
    return ($num==3)?'o':(($num==2)?'w':(($num==1)?'r':'n'));
  }
  
  $params_get_my_rights=array('user_me'=>$userstr,'uuid'=>$node_uuid);
  $string_get_my_rights=match_ug('ug','user_me').'MATCH (ug)-[r:RIGHTS]->(:DataNode{uuid:{uuid}}) RETURN r.have, r.give';
  $query_get_my_rights=new Everyman\Neo4j\Cypher\Query($db, $string_get_my_rights, $params_get_my_rights);
  $result_get_my_rights=$query_get_my_rights->getResultSet();

  
  $user_me=array('have'=>'n','give'=>'n','username'=>$userstr);
  
  foreach($result_get_my_rights as $row){
    $hav=$row['r.have'];
    $giv=$row['r.give'];
    $user_me['have']=rights_to_number($hav)>rights_to_number($user_me['have'])?$hav:$user_me['have'];
    $user_me['give']=rights_to_number($giv)>rights_to_number($user_me['give'])?$giv:$user_me['give'];
  }
  
  
  
  $params_get_user_rights=array('user_grant'=>$user,'uuid'=>$node_uuid);
  $string_get_user_rights='MATCH (n:DataNode{uuid:{uuid}}) OPTIONAL MATCH (u:User{username:{user_grant}})-[r:RIGHTS]->(n:DataNode) RETURN labels(u),r.have,r.give';
  $query_get_user_rights=new Everyman\Neo4j\Cypher\Query($db, $string_get_user_rights, $params_get_user_rights);
  $result_get_user_rights=$query_get_user_rights->getResultSet();
  
  $user_grant=array('username'=>"",'have'=>"",'give'=>"");
  
  for($i=0,$len=sizeof($result_get_user_rights);$i<$len;$i++){
    $user_grant['username']=$user;
    $user_grant['have']=$result_get_user_rights[$i]['r.have']?$result_get_user_rights[$i]['r.have']:"n";
    $user_grant['give']=$result_get_user_rights[$i]['r.give']?$result_get_user_rights[$i]['r.give']:"n";
  }

  //**** save id into returning object

  return array('user_me'=>$user_me,'user_grant'=>$user_grant,'uuid'=>$node_uuid);
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}