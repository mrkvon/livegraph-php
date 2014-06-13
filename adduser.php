<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');

require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
require_once(ROOT_PATH.'libs/php/securimage/securimage.php');
session_start();

$username='';
$pass='';
$repass='';
$email='';
$captcha=false;

if(isset($_POST['username'])&&isset($_POST['password'])&&isset($_POST['password_retype'])&&isset($_POST['email'])&&isset($_POST['captcha_code']))
{
  $username=strtolower(sanitizeString($_POST['username']));
  $pass=sanitizeString($_POST['password']);
  $repass=sanitizeString($_POST['password_retype']);
  $email=sanitizeString($_POST['email']);

  $securimage = new Securimage();
  $captcha=$securimage->check(sanitizeString($_POST['captcha_code']));
}

if (isset($_SESSION['user'])) destroySession();

$username_length=strlen($username)>=3?true:false; //username should be at least 3 characters long
$username_characters=preg_match('/[a-zA-Z0-9._-]/',$username)?true:false; //username should consist only of a-z A-Z 0-9 _ -.
$username_unique=false; //username must be unique
$password_match=$pass==$repass?true:false; //passwords have to be the same
$password_length=strlen($pass)>=5?true:false; //password should be at least 5 characters long
$valid_email=(preg_match('/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b/',$email)/*OR$email===''*/)?true:false; //email should be valid
//username_unique check
$db = new Everyman\Neo4j\Client();

$query_check_username="MATCH (person:User{username:{user}}) RETURN count(person) AS count";
$params_check_username=array("user"=>$username);
$query=new Everyman\Neo4j\Cypher\Query($db, $query_check_username, $params_check_username);
$result=$query->getResultSet();
foreach($result as $r)
{
  $number_of_users=$r['count'];
}
if($number_of_users==0){$username_unique=true;}




if($captcha&&$username_length&&$username_characters&&$username_unique&&$password_match&&$password_length&&$valid_email)
{
  echo 'signed up successfully';
  
  $date=date('m/d/Y h:i:s a');
  
  $sanitized_pass=sha1(SALT1.$pass.SALT2);
  $query_check_username="MATCH (group:UserGroup{id:'_all'}) CREATE (group)-[:MEMBER{admin:0}]->(n:User{username:{username},password:{password},email:{email},created:{date}}) RETURN count(n) AS count";
  $params_check_username=array('username'=>$username,'password'=>$sanitized_pass,'email'=>$email, 'date'=>$date);
  $query=new Everyman\Neo4j\Cypher\Query($db, $query_check_username, $params_check_username);
  $result=$query->getResultSet();
  foreach($result as $row)
  {
    //print_r($row);
  }
}
else
{
  echo 'not signed up. <a href="'.ROOT_PATH.'signup">try again.</a><br />';
  if(!$captcha){echo 'wrong captcha<br />';}
  if(!$username_length){echo 'username must have at least 3 characters<br />';}
  if(!$username_characters){echo 'invalid username [a-zA-Z0-9._-]<br />';}
  if(!$username_unique){echo 'username already exists<br />';}
  if(!$password_match){echo 'password doesnt match<br />';}
  if(!$password_length){echo 'password must be at least 5 characters long<br />';}
  if(!$valid_email){echo 'invalid email';}
}
unset($db);

echo '<br /><a href="'.ROOT_PATH.'">main page</a>';


function sanitizeString($var)
{
$var = strip_tags($var);
$var = htmlentities($var);
$var = stripslashes($var);
return $var;
}

function destroySession()
{
$_SESSION=array();
if (session_id() != "" || isset($_COOKIE[session_name()]))
setcookie(session_name(), '', time()-2592000, ROOT_PATH);
session_destroy();
}