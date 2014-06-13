<?php

function join_group($db,$username,$id){
  $return_object=array('error'=>0,'data'=>array());
  $string_join_group="MATCH (group:UserGroup{id:{id}}),(user:User{username:{username}})
  WHERE NOT (group)-[:MEMBER]->(user)
  CREATE UNIQUE (user)<-[j:JOIN]-(group) RETURN count(j)";
  $params_join_group=array('username'=>$username,'id'=>$id);
  $query_join_group=new Everyman\Neo4j\Cypher\Query($db, $string_join_group, $params_join_group);
  $result_join_group=$query_join_group->getResultSet();
  foreach($result_join_group as $row){
    //id:{name:,id:,member_count:,admin:}
    //
    $idout=$id;
    $await=!!$row['count(j)'];
    
    $return_object['data']=array(
      'id'=>$idout,
      'awaiting'=>$await
    );
  }
  return $return_object;
}