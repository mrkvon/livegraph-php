<?php

require_once('libs/php/htmlpurifier-4.5.0/library/HTMLPurifier.auto.php');
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
  if (isset($_POST['data'])){
    $data=SanitizeString($_POST['data']); //data should be a json object {"edge":[{"x":0,"y":0,"name":"","content":""}],
					  //"link":[{"idsrc":"","idtg":""}]}
    $data2=json_decode($data,true);
    
    $return=array('nodes'=>array(),'links'=>array());
    
    $db = new Everyman\Neo4j\Client();
    
    for($i=0,$len=sizeof($data2['nodes']);$i<$len;$i++){
      $return['nodes'][]=db_update_node($data2['nodes'][$i],$userstr,$db);
    }
    unset($db);
    echo json_encode($return);
  }
}



function db_update_node($node,$user,$db){//link is an object like this:('uuid'=>"")
  
  //$db->getTransport()->useHttps()->setAuth('username', 'password');
  //**** returning object
  $return_object=array();
  //**** save link into database
  //**** parameters
  
  $string_update=match_ug("ug","username")."MATCH (ug)-[rights:RIGHTS]->(n:DataNode{uuid:{uuid}})
  WHERE (rights.have='o' OR rights.have='w') SET n.name={name},n.content={content} RETURN n";
  
  $params_update=array("uuid"=>$node['uuid'],"name"=>$node['name'],"content"=>$node['content'],"username"=>$user);
  $query_update=new Everyman\Neo4j\Cypher\Query($db, $string_update, $params_update);

  $result_update=$query_update->getResultSet();
  //$link=$result[0]['n'];

  //echo $link_id.'asdf';
  //**** save id into returning object
  if(sizeof($result_update)){
    $return_object=array('uuid'=>$result_update[0]['n']->getProperty('uuid'),
    'name'=>$result_update[0]['n']->getProperty('name'),
    'content'=>$result_update[0]['n']->getProperty('content'),
    'x'=>$result_update[0]['n']->getProperty('x'),
    'y'=>$result_update[0]['n']->getProperty('y'));
  }
  else{
    //nothing
  }
  
  return $return_object;
}

function sanitizeString($var)
{
//   $config = HTMLPurifier_Config::createDefault();
//   //$config->set('HTML.Allowed', 'p,b,a[href],i,br');
//   //$config->set('AutoFormat.AutoParagraph', true);
//   $purifier = new HTMLPurifier($config);
//   $var = $purifier->purify($var);
  //$var = strip_tags($var,"<br>");
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}