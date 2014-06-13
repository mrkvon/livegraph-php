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

if($loggedin||$userstr=='guest')
{
  if (isset($_POST['data']))
  {
    $data=SanitizeString($_POST['data']); //data should be a json object {uuid:""}
    
    $data2=json_decode($data);
    
    if(isset($data2->uuid))
    {
    //**** return object data
      
      echo json_encode(db_read_node($data2,$userstr));
    }
  }
}




function db_read_node($node,$user){//node is an object like this:('uuid'=>"")
  $db = new Everyman\Neo4j\Client();
  //$db->getTransport()->useHttps()->setAuth('username', 'password');
  //**** returning object
  $return_object=null;
  
  //**** save node into database
  //**** parameters
  
  $params_read_node=array('username'=>$user,'uuid'=>$node->uuid);
  
  $string_read_node=match_ug("ug","username")."MATCH (ug)-[l:RIGHTS]->(n:DataNode{uuid:{uuid}}) WHERE (l.have='o' OR l.have='w' OR l.have='r')
  RETURN n.uuid, n.name, n.content, n, l.have";
  
  //**** execute query
  $query_read_node=new Everyman\Neo4j\Cypher\Query($db, $string_read_node, $params_read_node);

  $result=$query_read_node->getResultSet();
  //$node=$result[0]['n'];

  //echo $node_id.'asdf';
  //**** save id into returning object
  if(sizeof($result)){
    $return_object=array('uuid'=>$result[0]['n.uuid'], 'name'=>$result[0]['n.name'],'content'=>$result[0]['n.content'],'properties'=>$result[0]['n']->getProperties(),'rights'=>$result[0]['l.have']);
  }
  else{
    //nothing
  }
  return $return_object;
  
  unset($db);
}



function sanitizeString($var)
{
  $var = strip_tags($var);
  //$var = htmlentities($var);
  //$var = stripslashes($var);
  //$var= mysql_real_escape_string($var);
  return $var;
}
