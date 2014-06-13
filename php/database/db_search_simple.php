<?php
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

if($loggedin||$userstr=='guest'){
  $data='nothing';
  if(isset($_POST['data']))
  {
    $data=$_POST['data'];
  }

  $regex='(?is).*'.preg_quote($data).'.*';

  $db = new Everyman\Neo4j\Client();

  // $query_search='MATCH (u:User{username:{username}})-[rights:RIGHTS]->(n:DataNode)'.
  // // ',(u:User{username:{username}})<-[:MEMBER]-(:UserGroup)-[r:RIGHTS]->(n:DataNode)'.
  // ' WHERE (rights.have=\'o\' OR rights.have=\'w\' OR rights.have=\'r\') AND (n.name=~ {regex} OR n.content=~ {regex}) OPTIONAL MATCH (n)<-[r:LINK_TO]-()
  // RETURN n,count(r) ORDER BY COUNT(r) DESC'
  // .' UNION '.
  // 'MATCH (u:User{username:{username}})<-[:MEMBER]-(:UserGroup)-[rights:RIGHTS]->(n:DataNode)'.
  // ' WHERE (rights.have=\'o\' OR rights.have=\'w\' OR rights.have=\'r\') AND (n.name=~ {regex} OR n.content=~ {regex}) OPTIONAL MATCH (n)<-[r:LINK_TO]-()
  // RETURN n,count(r) ORDER BY COUNT(r) DESC'
  // ;

  $query_search=match_ug("ug","username")."MATCH (ug)-[r:RIGHTS]->(n:DataNode) 
  WHERE (r.have='o' OR r.have='w' OR r.have='r') AND (n.name=~ {regex} OR n.content=~ {regex}) OPTIONAL MATCH (n)<-[rr:LINK_TO]-()
  RETURN n, count(rr) ORDER BY count(rr) DESC";

  $params=array('regex'=>$regex,'username'=>$userstr);
  $query=new Everyman\Neo4j\Cypher\Query($db, $query_search, $params);

  $result=$query->getResultSet();

  $output=array();

  foreach($result as $res)
  {
    
    $info=$res['n']->getProperties();
    $output[]=$info;
    //print_r($res['n']->getProperties());
  }

  echo (json_encode($output));
}