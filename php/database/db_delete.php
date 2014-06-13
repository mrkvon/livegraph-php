<?php
//require_once 'login.php';
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once('./func/match_ug.php');

session_start();

if(isset($_SESSION['user']))
{
  $user=$_SESSION['user'];
  $loggedin=true;
  $userstr=$user;
}
else
{
  $loggedin=false;
  $userstr='guest';
}

header('Content-type: application/json');

if($loggedin){
  //print_r($_POST['data']);
  if (isset($_POST['data'])){
    //echo('ok');
    $data=json_decode(sanitize_string($_POST['data']));

    
    //**** connecting to database
    
    $db = new Everyman\Neo4j\Client();
    //$db->getTransport()->useHttps()->setAuth('username', 'password');
    
    
    
    
    //**** returning object
    $return_object=array('nodes'=>array(),'links'=>array());
    
    if(isset($data->nodes)){
      for($i=0,$len=sizeof($data->nodes);$i<$len;$i++){
	$deleted=delete_node($db,$userstr,$data->nodes[$i]);
	
	for($j=0,$length=sizeof($deleted['nodes']);$j<$length;$j++){
	  $return_object['nodes'][]=$deleted['nodes'][$j];
	}
	for($j=0,$length=sizeof($deleted['links']);$j<$length;$j++){
	  $return_object['links'][]=$deleted['links'][$j];
	}
      }
    }
    
    if(isset($data->links)){
      for($i=0,$len=sizeof($data->links);$i<$len;$i++){
	$deleted=delete_link($db,$userstr,$data->links[$i]);
	
	for($j=0,$length=sizeof($deleted['links']);$j<$length;$j++){
	  $return_object['links'][]=$deleted['links'][$j];
	}
      }
    }
    
    
    //**** return object data
    
    echo json_encode($return_object);
    unset($db);
  }
}


function delete_node($db, $user, $node){
  $return_object=array('nodes'=>array(),'links'=>array());

  if(isset($node->uuid))
  {
    //**** save node into database
    //**** parameters
    
    $params=array('username'=>$user,'uuid'=>$node->uuid);
    
//get data which are going to be deleted (query string)
    $string_read=match_ug('ug','username').'MATCH (ug)-[l:RIGHTS{have:\'o\'}]->(n:DataNode{uuid:{uuid}}) OPTIONAL MATCH (n)-[r]-() RETURN r.uuid as rel,n.uuid as node';
//delete data (query string)
    $string_delete=match_ug('ug','username').'MATCH (ug)-[l:RIGHTS{have:\'o\'}]->(n:DataNode{uuid:{uuid}}) OPTIONAL MATCH (n)-[r]-() DELETE l,r,n';
    
    //**** execute query
    $query_read=new Everyman\Neo4j\Cypher\Query($db, $string_read, $params);
    $result_read=$query_read->getResultSet();
    
    $query_delete=new Everyman\Neo4j\Cypher\Query($db, $string_delete, $params);
    $result_delete=$query_delete->getResultSet();
    
    
    for($i=0,$l=sizeof($result_read);$i<$l;$i++)
    {
      $return_object['nodes'][]=array("uuid"=>$result_read[$i]['node']);
    }
    for($i=0,$l=sizeof($result_read);$i<$l;$i++)
    {
      if($result_read[$i]['rel']){
	$return_object['links'][]=array("uuid"=>$result_read[$i]['rel']);
      }
    }
  }
    //**** return object data
    
  return $return_object;
}

function delete_link($db, $user, $link){
  $return_object=array('nodes'=>array(),'links'=>array());
  
  if(isset($link->uuid))
  {
    //**** save node into database
    //**** parameters
    
    $params=array('username'=>$user,'uuid'=>$link->uuid);
    
//get data which are going to be deleted (query string)
    $string_read=match_ug('ug','username').'MATCH (ug)-[rights:RIGHTS]->(:DataNode)-[link:LINK_TO{uuid:{uuid}}]->() WHERE (rights.have=\'o\' OR rights.have=\'w\') RETURN link.uuid AS uuid';
//delete data (query string)
    $string_delete=match_ug('ug','username').'MATCH (ug)-[rights:RIGHTS]->(:DataNode)-[link:LINK_TO{uuid:{uuid}}]->() WHERE (rights.have=\'o\' OR rights.have=\'w\') DELETE link';
    
    //**** execute query
    $query_read=new Everyman\Neo4j\Cypher\Query($db, $string_read, $params);
    $result_read=$query_read->getResultSet();
    
    for($i=0,$l=sizeof($result_read);$i<$l;$i++){
      $return_object['links'][]=array("uuid"=>$result_read[$i]['rel']);
    }
    
    $query_delete=new Everyman\Neo4j\Cypher\Query($db, $string_delete, $params);
    $result_delete=$query_delete->getResultSet();    
  }
  return $return_object;
}


function sanitize_string($var){
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}