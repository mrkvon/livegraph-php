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
	//print_r($_POST['data']);
	if (isset($_POST['data'])){
		//echo('ok');
		$data=SanitizeString($_POST['data']); //data should be a json object {name:"",content:"",properties:{property:value,...}}
		
		$data2=json_decode($data);
		
		//**** connecting to database
		
		$db = new Everyman\Neo4j\Client();
		//$db->getTransport()->useHttps()->setAuth('username', 'password');
		
		
		
		
		//**** returning object
		$return_object=array('nodes'=>array(),'links'=>array());
		
		if(isset($data2->nodes)){
			for($i=0,$len=sizeof($data2->nodes);$i<$len;$i++){
				$saved_node=new_node($db,$userstr,$data2->nodes[$i]);
				if(sizeof($saved_node)){
					$return_object['nodes'][]=$saved_node;
				}
			}
		}
		
		if(isset($data2->links)){
			for($i=0,$len=sizeof($data2->links);$i<$len;$i++){
				$saved_link=new_link($db,$userstr,$data2->links[$i]);
				if(sizeof($saved_link)){
					$return_object['links'][]=$saved_link;
				}
			}
		}
		
		//**** return object data
		
		echo json_encode($return_object);
		unset($db);
	}
}

function new_node($db, $user,$node){
	$return_object=array();

	if(isset($node->name)&&isset($node->content)){
		//**** save node into database
		//**** parameters
		
		$params_create_node=array('username'=>$user,'name'=>$node->name,"content"=>$node->content,'uuid'=>guidv4());
		$string_create_node='MATCH (u:User) WHERE u.username={username}
		CREATE u-[:RIGHTS{have:\'o\', give:\'o\'}]->(n:DataNode {name : {name}, content : {content},uuid:{uuid}})
		RETURN n.uuid AS uuid, n.name as name, n.content as content';
		
		//**** execute query
		$query_create_node=new Everyman\Neo4j\Cypher\Query($db, $string_create_node, $params_create_node);

		$result_create_node=$query_create_node->getResultSet();
		//$node=$result[0]['n'];

		//echo $node_id.'asdf';
		//**** save id into returning object
		if(sizeof($result_create_node)){
			$return_object=array('uuid'=>$result_create_node[0]['uuid'],
			'name'=>$result_create_node[0]['name'],
			'content'=>$result_create_node[0]['content']);
		}
	}
	return $return_object;
}

function new_link($db, $user, $link){
	$return_object=array();

	if(isset($link->src)&&isset($link->tg)&&isset($link->src->uuid)&&isset($link->tg->uuid)){
		//**** save link into database
		//**** parameters
		
		$params_create_link=array('username'=>$user,"src_uuid"=>$link->src->uuid,"tg_uuid"=>$link->tg->uuid,'uuid'=>guidv4());
		$string_create_link=match_ug('ug','username').'MATCH (ug)-[rights:RIGHTS]->(src:DataNode{uuid:{src_uuid}})
		WHERE (rights.have=\'o\' OR rights.have=\'w\')
		WITH src MATCH (ug)-[rights:RIGHTS]->(tg:DataNode{uuid:{tg_uuid}})
		WHERE (rights.have=\'o\' OR rights.have=\'w\' OR rights.have=\'r\')
		CREATE UNIQUE (src)-[link:LINK_TO]->(tg)
		WITH src,tg,link
		WHERE not (has(link.uuid))
		SET link.uuid={uuid}
		RETURN link, src, tg';
		
		//**** execute query
		$query_create_link=new Everyman\Neo4j\Cypher\Query($db, $string_create_link, $params_create_link);

		$result_create_link=$query_create_link->getResultSet();
		//$link=$result[0]['n'];

		//echo $node_id.'asdf';
		//**** save id into returning object
		if(sizeof($result_create_link)){
			$return_src=array('uuid'=>$result_create_link[0]['src']->getProperty('uuid'),
			'name'=>$result_create_link[0]['src']->getProperty('name'));
			
			$return_tg=array('uuid'=>$result_create_link[0]['tg']->getProperty('uuid'),
			'name'=>$result_create_link[0]['tg']->getProperty('name'));
		
			$return_object=array('uuid'=>$result_create_link[0]['link']->getProperty('uuid'),'src'=>$return_src,'tg'=>$return_tg);
			
		}
	}
	return $return_object;
}

function guidv4(){
	$data = openssl_random_pseudo_bytes(16);
	
	$data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0010
	$data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
	
	return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

// function check_atom_existence($id,$db)
// {
//	 $params=array('uuid'=>$id);
//	 $query_check_node='MATCH n:data_node WHERE n.uuid! ={uuid} return count(n) as n';
//		 
//	 //**** execute query
//	 $query=new Everyman\Neo4j\Cypher\Query($db, $query_check_node, $params);
//	 $result=$query->getResultSet();
//	 
//	 return $result[0]['n']?true:false;
// }

function sanitizeString($var){
	$var = strip_tags($var);
	//$var = htmlentities($var);
	//$var = stripslashes($var);
	//$var= mysql_real_escape_string($var);
	return $var;
}