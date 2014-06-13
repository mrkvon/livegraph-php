<?php
/*
 * input:
	 output:
 */
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

if($loggedin||$userstr=='guest'){
	if(isset($_POST['data'])){
		$data=json_decode(SanitizeString($_POST['data'])); //data should be a json object {nodes:[uuid,uuid,uuid,...]}
		if(isset($data->nodes)){
			$db = new Everyman\Neo4j\Client();

			$uuids=$data->nodes;
//			echo 'ahoj';
			$return_object=get_links_of_nodes($db,$uuids,$userstr);
			
			unset($db);
			echo json_encode($return_object);
		}
	}
}

function get_links_of_nodes($db,$node_uuids,$user){
	/**
	 * $node_uuids: array of uuid of nodes. we match links between any two of these nodes.
	 * we return array of links
	**/
	$return_object=array();
// 	$string_get_links_of_nodes=match_ug("ug","username")."MATCH (ug)-[rights:RIGHTS]->(node1:DataNode), (node2:DataNode)
// 		WHERE rights.have IN ['o','w','r'] AND node1.uuid IN {node_uuids} AND node2.uuid IN {node_uuids}
// 		WITH node1 AS src, node2 AS tg MATCH (src)-[link:LINK_TO]->(tg)
// 		RETURN src,link,tg";
	$string_get_links_of_nodes=match_ug("ug","username")."MATCH (ug)-[rights:RIGHTS]->(src:DataNode)-[link:LINK_TO]->(tg:DataNode)
		WHERE rights.have IN ['o','w','r'] AND src.uuid IN {node_uuids} AND tg.uuid IN {node_uuids}
		RETURN DISTINCT src,link,tg";
	$params_get_links_of_nodes=array('username'=>$user,'node_uuids'=>$node_uuids);
	$query_get_links_of_nodes=new Everyman\Neo4j\Cypher\Query($db, $string_get_links_of_nodes, $params_get_links_of_nodes);
	$result_get_links_of_nodes=$query_get_links_of_nodes->getResultSet();
	
	$return_object=array();
	
	foreach($result_get_links_of_nodes as $row){
		//return:{node:{uuid:uuid},tags:{name:{tag_object},name:{tag_object},...}}
		//tag_object:{name:name, description:description}
		$link=array('uuid'=>$row['link']->getProperty('uuid'),
			'src'=>array('uuid'=>$row['src']->getProperty('uuid'), 'name'=>$row['src']->getProperty('name')/*, 'x'=>$row['src']->getProperty('x'), 'y'=>$row['src']->getProperty('y')*/),
			'tg'=>array('uuid'=>$row['tg']->getProperty('uuid'), 'name'=>$row['tg']->getProperty('name')/*, 'x'=>$row['tg']->getProperty('x'), 'y'=>$row['tg']->getProperty('y')*/)
		);
		$return_object[]=$link;
	}
	return $return_object;
}

function get_paths_of_nodes($db,$node_uuids,$user,$length=2){
	/**
	 * $node_uuids: array of uuid of nodes. we match links between any two of these nodes.
	 * we return array of links
	**/
	$return_object=array();
	$string=match_ug("ug","username")."MATCH (ug)-[rights:RIGHTS]->(node1:DataNode), (ug)-[rights2:RIGHTS]->(node2:DataNode)
		WHERE rights.have IN ['o','w','r'] AND rights2.have IN ['o','w','r'] AND node1.uuid IN {node_uuids} AND node2.uuid IN {node_uuids}
		WITH node1, node2 MATCH p=(node1)-[link:LINK_TO*1..3]-(node2)
		RETURN DISTINCT p";

	$params=array('username'=>$user,'node_uuids'=>$node_uuids/*,'length'=>$length*/);
	$query=new Everyman\Neo4j\Cypher\Query($db, $string, $params);
	$result=$query->getResultSet();
	
	$return_object=array();
	
	foreach($result as $row){
		$path=$row['p'];
		echo "\n\n";
		foreach ($path as $rel) {
			echo $rel->getProperty('uuid');
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
