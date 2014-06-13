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
			/**take first two nodes of data**/
			if(sizeof($data->nodes)>=2){
				$uuids=array($data->nodes[0],$data->nodes[1]);
			}
			else{
				die('aaaaa');
			}
// 			echo 'ahoj';
			$return_object=find_paths($db,$uuids,$userstr);
			
			unset($db);
			echo json_encode($return_object);
		}
	}
}

function find_paths($db,$node_uuids,$user){
	/**
	 * $node_uuids: array of uuid of nodes. we match links between any two of these nodes.
	 * we return array of links
	**/
	
	$string_edges=match_ug("ug","username")."MATCH (ug)-[rights1:RIGHTS]->(edge1:DataNode{uuid:{uuid1}}),
	(ug)-[rights2:RIGHTS]->(edge2:DataNode{uuid:{uuid2}})
		WHERE rights1.have IN ['o','w','r'] AND rights2.have IN ['o','w','r']
		WITH DISTINCT edge1, edge2
		MATCH path=shortestPath(edge1-[:LINK_TO|ELEMENT*..8]-edge2)
		RETURN DISTINCT relationships(path) AS links";
	$params_edges=array('username'=>$user,'uuid1'=>$node_uuids[0],'uuid2'=>$node_uuids[1]);
	$query_edges=new Everyman\Neo4j\Cypher\Query($db, $string_edges, $params_edges);
	$result_edges=$query_edges->getResultSet();
	
	$paths=array();
	
	foreach($result_edges as $row){
	/**return all links of path**/
		
		$links=array();
		foreach($row['links'] as $db_link){
			$src=$db_link->getStartNode();
			$tg=$db_link->getEndNode();
			
			$link=array('uuid'=>$db_link->getProperty('uuid'),'type'=>$db_link->getType(),
				'src'=>array('uuid'=>$src->getProperty('uuid'), 'name'=>$src->getProperty('name')),
				'tg'=>array('uuid'=>$tg->getProperty('uuid'), 'name'=>$tg->getProperty('name')));
			
			$links[]=$link;
		}
		$paths[]=$links;
	}
	return $paths;
}

function sanitizeString($var){
	$var = strip_tags($var);
	//$var = htmlentities($var);
	//$var = stripslashes($var);
	//$var= mysql_real_escape_string($var);
	return $var;
}
