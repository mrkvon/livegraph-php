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

// header('Content-type: application/json');

if($loggedin){
  if (isset($_POST['data'])){
    $data=SanitizeString($_POST['data']); //data{username,uuid,have,give}
    
    $data2=json_decode($data);
    
//     print_r($data2);
    //**** connecting to database
    
    $db = new Everyman\Neo4j\Client();
    
    //**** returning object: will return required users' data.
    $return_object=array();
    
//     if(true/*isset($data2->flag)&&($data2->flag=='ALL')*/){
//     
      $group_id=$data2->id;
      $uuid=$data2->uuid;
      $have=$data2->have;
      $give=$data2->give;
      grant_rights($db,$group_id,$userstr,$uuid,$have,$give);
//       if(sizeof($rights)){
// 	$return_object=$rights;
//       }
//     }
    
    
    //**** return object data
    //echo ('done');
    echo json_encode($return_object);
    unset($db);
  }
}

function grant_rights($db, $group_id,$user_me,$node_uuid,$have,$give){
  /*TODO:
  first check if the $user exists and if she has some rights to use and give.
  ***check if $userstr has the right to offer these rights
  if he has, look if it is good for $user to have them.
  if it is good for user to have them:
  create this optional link and update rights.
  */

  //check if you can give the rights.
  function rights_to_number($right){
    return ($right=='o')?3:(($right=='w')?2:(($right=='r')?1:0));
  }
  function number_to_rights($num){
    return ($num==3)?'o':(($num==2)?'w':(($num==1)?'r':'n'));
  }
  
  $wanted=array("have"=>rights_to_number($have), "give"=>rights_to_number($give));
  print_r($wanted);

  $params_get_my_rights=array('user_me'=>$user_me,'uuid'=>$node_uuid);
  $string_get_my_rights=match_ug('ug','user_me').'MATCH (ug)-[r:RIGHTS]->(:DataNode{uuid:{uuid}}) RETURN r.have, r.give';
  $query_get_my_rights=new Everyman\Neo4j\Cypher\Query($db, $string_get_my_rights, $params_get_my_rights);
  $result_get_my_rights=$query_get_my_rights->getResultSet();

  
  $user_me=array("have"=>0,"give"=>0);
  
  foreach($result_get_my_rights as $row){
    $hav=rights_to_number($row['r.have']);
    $giv=rights_to_number($row['r.give']);
    $user_me['have']=$hav>$user_me['have']?$hav:$user_me['have'];
    $user_me['give']=$giv>$user_me['give']?$giv:$user_me['give'];
  }
  
  print_r($user_me);
  
  
  $params_get_group_rights=array('group_id'=>$group_id,'uuid'=>$node_uuid);
  $string_get_group_rights='MATCH (group:UserGroup{id:{group_id}}), (n:DataNode{uuid:{uuid}}) OPTIONAL MATCH (group)-[r:RIGHTS]->(n) RETURN group.id, r ,r.have,r.give';
  $query_get_group_rights=new Everyman\Neo4j\Cypher\Query($db, $string_get_group_rights, $params_get_group_rights);
  $result_get_group_rights=$query_get_group_rights->getResultSet();
  
  $group_grant=array();
  
  if(sizeof($result_get_group_rights)){
    $group_grant['have']=!$result_get_group_rights[0]['r']?0:rights_to_number($result_get_group_rights[0]['r.have']);
    $group_grant['give']=!$result_get_group_rights[0]['r']?0:rights_to_number($result_get_group_rights[0]['r.give']);
  }
  print_r($group_grant);
  
  $user_me['give']=$user_me['have'];
  $group_grant['give']=$group_grant['have'];
  
  if($user_me["give"]>=$wanted["have"] && $wanted["have"]>=$group_grant["have"] &&
  $user_me["give"]>=$wanted["give"] && /*$wanted["give"]>=$group_grant["give"] &&*/
  $wanted["have"]>=$wanted["give"] && $wanted["have"]>0){
    //granting rights
    $params_grant=array('group_id'=>$group_id,'uuid'=>$node_uuid,'have'=>number_to_rights($wanted['have']),'give'=>number_to_rights($wanted['give']));
    $string_grant='MATCH (group:UserGroup{id:{group_id}}), (n:DataNode{uuid:{uuid}})
    CREATE UNIQUE (group)-[r:RIGHTS]->(n)
    SET r.have={have}, r.give={give} RETURN r';
    $query_grant=new Everyman\Neo4j\Cypher\Query($db, $string_grant, $params_grant);
    $result_grant=$query_grant->getResultSet();
    
  }
  else{
    echo "we will not grant";
  }

//   //**** save id into returning object
// 
//   return array('user_me'=>$user_me,'user_grant'=>$group_grant,'uuid'=>$node_uuid);
}

function sanitizeString($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}