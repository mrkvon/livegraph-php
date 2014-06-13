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
  if (isset($_POST['data'])){
    $data=SanitizeString($_POST['data']); //data should be a json object {username:"",flag:"ALL"}
    
    $data2=json_decode($data);
    
    //**** connecting to database
    
    $db = new Everyman\Neo4j\Client();
    
    //**** returning object: will return required users' data.
    $return_object=array();
    
    
    if(isset($data2->id,$data2->uuid)){
    
      $group_id=$data2->id;
      $uuid=$data2->uuid;
      $rights=get_group_rights($db,$group_id,$userstr,$uuid);
      $return_object=$rights;
    }
    
    
    //**** return object data
    //echo ('done');
    echo json_encode($return_object);
    unset($db);
  }
}

function get_group_rights($db, $group_id,$my_username,$node_uuid){

  function rights_to_number($right){
    return ($right=='o')?3:(($right=='w')?2:(($right=='r')?1:0));
  }
  function number_to_rights($num){
    return ($num==3)?'o':(($num==2)?'w':(($num==1)?'r':'n'));
  }


  $return_object=array('error'=>0,'data'=>array());
  $params_get_my_rights=array('user_me'=>$my_username,'uuid'=>$node_uuid);
  $string_get_my_rights=match_ug('ug','user_me').'MATCH (ug)-[r:RIGHTS]->(:DataNode{uuid:{uuid}}) RETURN r.have, r.give';
  $query_get_my_rights=new Everyman\Neo4j\Cypher\Query($db, $string_get_my_rights, $params_get_my_rights);
  $result_get_my_rights=$query_get_my_rights->getResultSet();

  
  $user_me=array('have'=>'n','give'=>'n','username'=>$my_username);
  
  foreach($result_get_my_rights as $row){
    $hav=$row['r.have'];
    $giv=$row['r.give'];
    $user_me['have']=rights_to_number($hav)>rights_to_number($user_me['have'])?$hav:$user_me['have'];
    $user_me['give']=rights_to_number($giv)>rights_to_number($user_me['give'])?$giv:$user_me['give'];
  }
  
  
  
  $params_get_group_rights=array('group_id'=>$group_id,'uuid'=>$node_uuid);
  $string_get_group_rights='MATCH (group:UserGroup{id:{group_id}}) WITH group
  MATCH (n:DataNode{uuid:{uuid}}) OPTIONAL MATCH (group)-[r:RIGHTS]->(n:DataNode) RETURN group.id, labels(group),r.have,r.give';
  $query_get_group_rights=new Everyman\Neo4j\Cypher\Query($db, $string_get_group_rights, $params_get_group_rights);
  $result_get_group_rights=$query_get_group_rights->getResultSet();
  
  $group_grant=array('id'=>"",'have'=>"",'give'=>"");
  
  foreach($result_get_group_rights as $row){
    $group_grant['id']=$row['group.id'];
    $group_grant['have']=$row['r.have']?$row['r.have']:"n";
    $group_grant['give']=$row['r.give']?$row['r.give']:"n";
  }

  //**** save id into returning object
  $return_object['data']=array('user_me'=>$user_me,'group_grant'=>$group_grant,'uuid'=>$node_uuid);
  return $return_object;
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}