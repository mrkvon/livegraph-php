<?php
function join_delete($db,$this_user,$user,$id){
  $return_object=array('error'=>0,'data'=>array());
  $string_join_delete="MATCH (:User{username:{this_username}})<-[:MEMBER]-(:UserGroup{id:{id}})-[join:JOIN]->(:User{username:{username}})
  RETURN join";
  $params_join_delete=array('username'=>$user,'this_username'=>$this_user,'id'=>$id);
  $query_join_delete=new Everyman\Neo4j\Cypher\Query($db, $string_join_delete, $params_join_delete);
  $result_join_delete=$query_join_delete->getResultSet();
  
  $count=0;
  foreach($result_join_delete as $row){
    if($row['join']){
      $row['join']->delete();
    }
    $count++;
  }
  $return_object['data']=array('username'=>$user,'id'=>$id,'deleted'=>$count);
  return $return_object;
}