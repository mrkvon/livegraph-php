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
      
      $return_object=search_tag($db,$search_string,$userstr);
      
      unset($db);
      echo json_encode($return_object);
    }
  }
}

function search_tag($db,$search_string){
  $return_object=array();
  $regex='(?is).*'.preg_quote($search_string).'.*';
  $string_search_tag="MATCH (tag:Tag) WHERE (tag.name=~ {regex}) OPTIONAL MATCH (tag)-[tl:TAG]->()
    RETURN tag, COUNT(tl) ORDER BY COUNT(tl) DESC LIMIT 10";
  $params_search_tag=array('regex'=>$regex);
  $query_search_tag=new Everyman\Neo4j\Cypher\Query($db, $string_search_tag, $params_search_tag);
  $result_search_tag=$query_search_tag->getResultSet();
  foreach($result_search_tag as $row){
    $tagname=$row['tag']->getProperty('name');
    $tagdescription=$row['tag']->getProperty('description');
    
    $return_object[$tagname]=array('name'=>$tagname,'description'=>$tagdescription);
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