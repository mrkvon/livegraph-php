<?php // login.php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');

require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
session_start();

// header('Content-type: application/json');

$error = $user = $pass = "";
$logged=false;
if (isset($_POST['form_login_username']))
{
$user = sanitizeString($_POST['form_login_username']);
$pass = sanitizeString($_POST['form_login_password']);
//echo $user.' '.$pass;
}
if ($user == "" || $pass == "")
{
//echo 'empty';//not all fields were entered
}
else
{
  $sanitized_pass=sha1(SALT1.$pass.SALT2);
  //echo 'access';
  $db = new Everyman\Neo4j\Client();
  
  $query_login="MATCH (person:User{username:{user},password:{pass}}) RETURN count(person) AS count";
  
  $params=array("user"=>$user,"pass"=>$sanitized_pass);
  $query=new Everyman\Neo4j\Cypher\Query($db, $query_login, $params);

  $result=$query->getResultSet();
  
  //print_r($result);
  
  foreach($result as $r)
  {
    $sohowisit=$r['count'];
  }
  if($sohowisit==1){$logged=true;}
  unset($db);
}
if (!$logged)
{
//not logged in
header("Location: ");

}
else
{
$_SESSION['user'] = $user;

header('Location: '.ROOT_PATH);
}

// echo<<<_END
// <!DOCTYPE HTML>
// <html lang="en-US">
//     <head>
//         <meta charset="UTF-8">
//         <meta http-equiv="refresh" content="1;url=index.php">
//         <script type="text/javascript">
//             window.location.href = "index.php"
//         </script>
//         <title>Page Redirection</title>
//     </head>
//     <body>
//         <!-- Note: don't tell people to `click` the link, just tell them that it is a link. -->
//         If you are not redirected automatically, follow the <a href='index.php'>link to example</a>
//     </body>
// </html>
// _END;

/**old client-side redirect**/
/*echo<<<_END
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="1;url=./">
        <script type="text/javascript">
            window.location.href = "./"
        </script>
        <title>Page Redirection</title>
    </head>
    <body>
        <!-- Note: don't tell people to `click` the link, just tell them that it is a link. -->
        If you are not redirected automatically, follow the <a href='./'>link to example</a>
    </body>
</html>
_END;
*/

function sanitizeString($var)
{
$var = strip_tags($var);
$var = htmlentities($var);
$var = stripslashes($var);
return $var;
}