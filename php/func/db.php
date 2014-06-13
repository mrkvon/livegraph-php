<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');

function get_user($db,$username){
  $string_get_user="MATCH (user:User{username:{username}}) RETURN user";
  $params_get_user=array('username'=>$username);
  $query_get_user=new Everyman\Neo4j\Cypher\Query($db, $string_get_user, $params_get_user);
  $result_get_user=$query_get_user->getResultSet();
  
  if(sizeof($result_get_user)==1){
    return $result_get_user[0]['user'];
  }
  else throw new Exception('unique user not found');
}

function process_password($pass){/**returns hashed string for database**/
  usleep(500000);
  return sha1(SALT1.$pass.SALT2);
}

function valid_password($pass){/**returns boolean is the password valid?**/
  return strlen($pass)>=5;
}