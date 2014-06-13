<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');

require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');

function add_openid_user($username,$openid){
  $db = new Everyman\Neo4j\Client();
  
  $query_check_username="MATCH (person:User{username:{user}}) RETURN count(person) AS count";
  $params_check_username=array("user"=>$username);
  $query=new Everyman\Neo4j\Cypher\Query($db, $query_check_username, $params_check_username);
  $result=$query->getResultSet();
  foreach($result as $r){
    $number_of_users=$r['count'];
  }

  $username_unique=($number_of_users==0)?true:false;
  
  $query_check_openid="MATCH (person:User{openid:{openid}}) RETURN count(person) AS count";
  $params_check_openid=array("openid"=>$openid);
  $query=new Everyman\Neo4j\Cypher\Query($db, $query_check_openid, $params_check_openid);
  $result=$query->getResultSet();
  foreach($result as $r){
    $number_of_openid=$r['count'];
  }

  $openid_unique=($number_of_openid==0)?true:false;




  if($username_unique&&$openid_unique){
    $query_check_username="MATCH (group:UserGroup{id:'_all'}) CREATE (group)-[:MEMBER{admin:0}]->(n:User{username:{username},openid:{openid}}) RETURN count(n) AS count";
    $params_check_username=array('username'=>$username,'openid'=>$openid);
    $query=new Everyman\Neo4j\Cypher\Query($db, $query_check_username, $params_check_username);
    $result=$query->getResultSet();
    $count=sizeof($result);
    return $count==1?true:false;
  }
  else{
    return false;
  }
}



