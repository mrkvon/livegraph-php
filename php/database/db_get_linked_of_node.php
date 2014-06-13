<?php
/*
 *this file is very similar to db_get_links_of_node
*/
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

  $node_uuid=json_decode($data)->uuid;

  $db = new Everyman\Neo4j\Client();

  $query_string=match_ug("ug","username")."MATCH (ug)-[rights:RIGHTS]->(n:DataNode{uuid:{uuid}})
  WHERE (rights.have='o' OR rights.have='w' OR rights.have='r')
  WITH n AS tg MATCH (src)-[l:LINK_TO]->(tg) RETURN src, l, tg";
  $params=array('uuid'=>$node_uuid,'username'=>$userstr);
  $query=new Everyman\Neo4j\Cypher\Query($db, $query_string, $params);

  $result=$query->getResultSet();

  $output=array('links'=>array());
  //output json should look like {links:{uuid:{uuid:uuid,src:{uuid:uuid, x:x, y:y, name:name},tg:{uuid:uuid, x:x,y:y,name:name}}},{},{}}


  foreach($result as $res)
  {
    $link=array();
    $link['uuid']=$res['l']->getProperty('uuid');
    $link['src']=array('uuid'=>$res['src']->getProperty('uuid'),'name'=>$res['src']->getProperty('name'));
    $link['tg']=array('uuid'=>$res['tg']->getProperty('uuid'),'name'=>$res['tg']->getProperty('name'));
    $output['links'][$link['uuid']]=$link;
  }

  echo (json_encode($output));
}