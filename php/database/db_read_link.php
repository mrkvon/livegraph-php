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

if($loggedin||$userstr=='guest')
{
  if (isset($_POST['data']))
  {
    $data=SanitizeString($_POST['data']); //data should be a json object {uuid:""}
    
    $data2=json_decode($data);
    
    if(isset($data2->uuid))
    {
    //**** return object data
      
      echo json_encode(db_read_link($data2,$userstr));
    }
  }
}


function db_read_link($link,$user){//link is an object like this:('uuid'=>"")
  $db = new Everyman\Neo4j\Client();
  //$db->getTransport()->useHttps()->setAuth('username', 'password');
  //**** returning object
  $return_object=array();
  
  //**** save link into database
  //**** parameters
  
  $params_read_link=array('username'=>$user,'uuid'=>$link->uuid,'rights'=>array('o','w','r'));
  
  $string_read_link=match_ug("ug","username")."MATCH (ug)-[r:RIGHTS]->(src:DataNode)-[l:LINK_TO]->(tg:DataNode)
  WHERE r.have IN {rights} AND l.uuid={uuid}
  RETURN src, tg, l, r.have";
  
  //**** execute query
  $query_read_link=new Everyman\Neo4j\Cypher\Query($db, $string_read_link, $params_read_link);

  $result=$query_read_link->getResultSet();
  //$link=$result[0]['n'];

  //echo $link_id.'asdf';
  //**** save id into returning object
  if(sizeof($result)){
    $return_object=array('uuid'=>$result[0]['l']->getProperty('uuid'),
			  'src'=>array('uuid'=>$result[0]['src']->getProperty('uuid'), 'name'=>$result[0]['src']->getProperty('name'), 'x'=>$result[0]['src']->getProperty('x'), 'y'=>$result[0]['src']->getProperty('y')),
			  'tg'=>array('uuid'=>$result[0]['tg']->getProperty('uuid'), 'name'=>$result[0]['tg']->getProperty('name'), 'x'=>$result[0]['tg']->getProperty('x'), 'y'=>$result[0]['tg']->getProperty('y')),
			  'rights'=>$result[0]['r.have']
			  );
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
