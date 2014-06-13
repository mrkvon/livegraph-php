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

  $data=json_decode($data);

  $db = new Everyman\Neo4j\Client();
  $return_object=array('set'=>array(),'elements'=>array());

  $node_uuid=$data->uuid;

  if(!sizeof($data->elements)){
    $string_get_elements=match_ug('ug','username').'MATCH (ug)-[r:RIGHTS]->(n:DataNode{uuid:{uuid}})
    WHERE (r.have=\'o\' OR r.have=\'w\' OR r.have=\'r\') WITH n AS set
    MATCH (set)-[l:ELEMENT]->(element) RETURN set, l, element';
    $params_get_elements=array('uuid'=>$node_uuid,'username'=>$userstr);
    $query_get_elements=new Everyman\Neo4j\Cypher\Query($db, $string_get_elements, $params_get_elements);

    $result_get_elements=$query_get_elements->getResultSet();

    
    //output json should look like {set:{uuid:, name:},elements:{uuid...:{uuid:,name:,x:,y:},uuid:{},uuid:{}}};

    if (sizeof($result_get_elements)) {
      $res2=$result_get_elements[0];
      $return_object['set']=array( "uuid"=>$res2['set']->getProperty('uuid'),"name"=>$res2['set']->getProperty('name'));
    }

    foreach($result_get_elements as $res)
    {
      $element=array( "uuid"=>$res['element']->getProperty('uuid'),"name"=>$res['element']->getProperty('name'));
      $return_object['elements'][$element['uuid']]=$element;
    }
  }
  else{
    for($i=0,$len=sizeof($data->elements);$i<$len;$i++){
      $string_get_element='MATCH (u:User{username:{username}})-[r:RIGHTS]->(set:DataNode{uuid:{set_uuid}})
      WHERE (r.have=\'o\' OR r.have=\'w\' OR r.have=\'r\') WITH set
      MATCH (set)-[l:ELEMENT]->(element{uuid:{element_uuid}})
      RETURN set, l, element
      UNION
      MATCH (u:User{username:{username}})<-[:MEMBER]-(:UserGroup)-[r:RIGHTS]->(set:DataNode{uuid:{set_uuid}})
      WHERE (r.have=\'o\' OR r.have=\'w\' OR r.have=\'r\') WITH set
      MATCH (set)-[l:ELEMENT]->(element{uuid:{element_uuid}})
      RETURN set, l, element';
      $params_get_element=array('set_uuid'=>$node_uuid,'element_uuid'=>$data->elements[$i]->uuid,'username'=>$userstr);
      $query_get_element=new Everyman\Neo4j\Cypher\Query($db, $string_get_element, $params_get_element);

      $result_get_element=$query_get_element->getResultSet();

      
      //output json should look like {set:{uuid:, name:},elements:{uuid...:{uuid:,name:,x:,y:},uuid:{},uuid:{}}};

      if (sizeof($result_get_element)) {
	$res2=$result_get_element[0];
	$return_object['set']=array( "uuid"=>$res2['set']->getProperty('uuid'),"name"=>$res2['set']->getProperty('name'));
      }

      foreach($result_get_element as $res)
      {
	$element=array( "uuid"=>$res['element']->getProperty('uuid'),"name"=>$res['element']->getProperty('name'));
	$return_object['elements'][$element['uuid']]=$element;
      }
    }
  }





  echo (json_encode($return_object));
}