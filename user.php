<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/page.php');
session_start();

//require_once("login.php");

header("Content-type: application/xhtml+xml");

if(isset($_SESSION["user"]))
{
  $user=$_SESSION["user"];
  $loggedin=true;
  $userstr=$user;
}
else
{
  $loggedin=false;
  $userstr="guest";
}

if($loggedin)
{
  $username='';
  $email='';
  
  $db = new Everyman\Neo4j\Client();
  $string_get_user_info="MATCH (user:User{username:{username}}) RETURN user";
  $params_get_user_info=array('username'=>$userstr);
  $query_get_user_info=new Everyman\Neo4j\Cypher\Query($db, $string_get_user_info, $params_get_user_info);
  $result_get_user_info=$query_get_user_info->getResultSet();
//   print_r($result_get_user_info);
  foreach($result_get_user_info as $row)
  {
    $username=$row['user']->getProperty('username');
    $email=$row['user']->getProperty('email');
    $joined=$row['user']->getProperty('created');
    $info=$row['user']->getProperty('info');
  }
  unset($db);
}

$content='';
// echo<<<_END
// 
// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
// <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
// <head>
// <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
// <title>livegraph::0.0.3::$userstr</title>
// <link rel="stylesheet" type="text/css" href="css/reset.css" />
// </head>
// <body>
/*_END*/;
if($loggedin){
$content.='
<a href="'.ROOT_PATH.'logout.php">Log Out</a>
<div>username: $username</div>
<div>email: $email</div>
<div>joined: $joined</div>
<div>info: $info</div>
<div><a href="'.ROOT_PATH.'edit_user.php">edit user info</a></div>
<div><a href="'.ROOT_PATH.'delete_user.php">delete user</a></div>
<div><a href="'.ROOT_PATH.'change_password.php">change password</a></div>
<div>TODO: delete user (after giving password), edit user data, allow giving more information, show membership in groups, change password</div>
<a href="'.ROOT_PATH.'">Home</a>

';
}
else {
  $content.="you are not logged in.";
}

$page=new page($loggedin,$userstr);

$page->add($content)->title('user: '.$userstr)->write();
