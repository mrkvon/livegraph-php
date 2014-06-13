<?php

function match_ug($ug,$username){
  return "MATCH (user:User{username:{".$username."}}),(:User{username:{".$username."}})<-[:MEMBER]-(group:UserGroup) 
  WITH [x in collect(user)+collect(group)|id(x)] as ids
  MATCH (ug) WHERE id(ug) in ids WITH ug AS ".$ug." ";
}