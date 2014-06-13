<?php
//require './libs/php/lightopenid/openid.php';
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/page.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');


session_start();

header("Content-type: application/xhtml+xml");

$error = $user = $pass = "";
$logged=false;
if (isset($_POST['form_login_username'])){
	$user = $_POST['form_login_username'];
	$pass = $_POST['form_login_password'];
	
	if ($user == "" || $pass == ""){
	//echo 'empty';//not all fields were entered
	}
	else{
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
		header('Location: ');
	}
	else
	{
	$_SESSION['user'] = $user;

	header('Location: '.ROOT_PATH);
	}
//echo $user.' '.$pass;
}
else{
	$content='
  <div id="wrapper">
  <a href="'.ROOT_PATH.'" style="color:white">home</a>
  <div>
  <form method="post" action="">
    <input id="menu_user_login_username" name="form_login_username" type="text" placeholder="Username" />
    <input id="menu_user_login_password" name="form_login_password" type="password" placeholder="password" />
    <input type="submit" value="Log in!" />
  </form>
  </div>
  
  <div>
  there will be option to log in with OpenID/fb here.
  
  <!--form action="" method="post">
    <input type="hidden" name="openid_identifier" value="https://www.google.com/accounts/o8/id" />
    <input type="submit" value="google"/>
  </form>
  <form action="" method="post">
    <input type="hidden" name="openid_identifier" />
    <input type="submit" value="yahoo"/>
  </form-->
  </div>
</div>';

	$page=new page(false,'');

	$page->add($content)->title('Login')->css('/css/signup.css')->write();
}
// try {
//   # Change 'localhost' to your domain name.
//   $openid = new LightOpenID('livegraph');
//   if(!$openid->mode) {
//     if(isset($_POST['openid_identifier'])) {
//       $openid->identity = $_POST['openid_identifier'];
//       # The following two lines request email, full name, and a nickname
//       # from the provider. Remove them if you don't need that data.
//       //             $openid->required = array('contact/email');
//       //             $openid->optional = array('namePerson', 'namePerson/friendly');
//       header('Location: ' . $openid->authUrl());
//     }
// echo<<<_asdf


// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
// <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
// <head>
// <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
// <title>livegraph::0.0.3::Sign Up</title>
// <link rel="stylesheet" type="text/css" href="css/reset.css" />
// <link rel="stylesheet" type="text/css" href="css/signup.css" />
// </head>
// <body>
// <div id="wrapper">
//   <a href="./" style="color:white">home</a>
//   <div>
//   <form method="post" action="login_direct.php">
//     <input id="menu_user_login_username" name="form_login_username" type="text" placeholder="Username" />
//     <input id="menu_user_login_password" name="form_login_password" type="password" placeholder="password" />
//     <input type="submit" value="Log in!" />
//   </form>
//   </div>
//   
//   <div>
//   there will be option to log in with OpenID/fb here.
//   
//   <!--form action="" method="post">
//     <input type="hidden" name="openid_identifier" value="https://www.google.com/accounts/o8/id" />
//     <input type="submit" value="google"/>
//   </form>
//   <form action="" method="post">
//     <input type="hidden" name="openid_identifier" />
//     <input type="submit" value="yahoo"/>
//   </form-->
//   </div>
// </div>
// </body>
// </html>
// _asdf;
  /*} elseif($openid->mode == 'cancel') {
    echo 'User has canceled authentication!';
  } else {

    if($openid->validate()){
      
      $oid=$openid->identity;
      
      require_once('phar://libs/php/neo4jphp.phar');
      
      $db = new Everyman\Neo4j\Client();
      
      $query_login="MATCH (person:User{openid:{openid}}) RETURN count(person) AS count";
      
      $params=array("openid"=>$oid);
      $query=new Everyman\Neo4j\Cypher\Query($db, $query_login, $params);

      $result=$query->getResultSet();
      
      //print_r($result);
      
      foreach($result as $r)
      {
	$sohowisit=$r['count'];
      }
      unset($db);








// 	echo $openid->identity;

      if($sohowisit==1){
	$_SESSION['user']=$openid->identity;
	$_SESSION['alias']="OpenID_user";
	$logged=true;
      }
      else{
	$_SESSION['alias']="guest";
      }
      
// 	print_r($openid->getAttributes());
// 	print_r($_SESSION);
echo<<<_END
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
        If you are not redirected automatically, follow the <a href='./'>link to example</a>
    </body>
</html>
_END;
    }
  }
} catch(ErrorException $e) {
  echo $e->getMessage();
}
//*/