<?php
/*
 * input:{name:...,description:...} output:...{name:name,description:description,...}
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
    if(isset($data->name,$data->description)){
      $db = new Everyman\Neo4j\Client();
      
      $name=$data->name;
      $desc=$data->description;
      
      $created_tag=create_tag($db,$name,$desc,$userstr);
      $return_object=$created_tag?array($created_tag['name']=>$created_tag):array();
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function check_tag_existence($db,$name,$user){
  $string_check_tag="MATCH (tag:Tag{name:{name}}) RETURN COUNT(tag)";
  $params_check_tag=array('name'=>$name);
  $query_check_tag=new Everyman\Neo4j\Cypher\Query($db, $string_check_tag, $params_check_tag);
  $result_check_tag=$query_check_tag->getResultSet();
  return $result_check_tag[0]['COUNT(tag)']?true:false;
}

function create_tag($db,$name,$description,$user){
  $return_object=array();
  if(!check_tag_existence($db,$name,$user)){
    $date=date('m/d/Y h:i:s a');
    $string_create_tag="CREATE (tag:Tag{name:{name},description:{description},creator:{username},created:{date}})
    return COUNT(tag),tag";
    $params_create_tag=array('name'=>$name,'username'=>$user,'date'=>$date, 'description'=>$description);
    $query_create_tag=new Everyman\Neo4j\Cypher\Query($db, $string_create_tag, $params_create_tag);
    $result_create_tag=$query_create_tag->getResultSet();
    foreach($result_create_tag as $row){
      $outname = $row['tag']->getProperty('name');
      $outdescription = $row['tag']->getProperty('description');
      $return_object=array('name'=>$outname,'description'=>$outdescription);
    }
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