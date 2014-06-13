<?php
session_start();
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/page.php');

header("Content-type: application/xhtml+xml");

if(isset($_SESSION["user"]))
{
  $user=$_SESSION["user"];
  $alias=isset($_SESSION["alias"])?$_SESSION["alias"]:null;
  $loggedin=true;
  $userstr=$user;
}
else
{
  $loggedin=false;
  $userstr="guest";
}

$content='
<div id="app" style="position:absolute;top:34px;bottom: 0px;width: 100%;background-image:url('.ROOT_PATH.'img/background.png);" >
</div>';





$page=new page($loggedin,$userstr);

$page->add($content);
$page->title('main page');
$page->css(ROOT_PATH.'css/graph.css')->/*css('css/search.css')->*/js(ROOT_PATH.'js/libs/require.js',array('data-main'=>ROOT_PATH.'js/App'));


$page->write();
/*echo<<<_END
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>lg.0.0.4::Main Page</title>

<link rel="stylesheet" type="text/css" href="css/reset.css" />
<link rel="stylesheet" type="text/css" href="css/index.css" />
<link rel="stylesheet" type="text/css" href="css/graph.css" />
<link rel="stylesheet" type="text/css" href="css/search.css" />
</head>
<body>
<div id="main_wrapper">

<div id="menu">
<div id="menu_logo">livegraph</div>
<div id="menu_user">
_END;

if($loggedin)
{
echo<<<_END
<div id="menu_user_logged">
<a href="user.php">
_END;
echo $alias?$alias:$userstr;
echo<<<_END
</a> <a href="logout.php">log out</a>
</div>
_END;
}
else
{
echo<<<_END

<div id="menu_user_login">
  <a href="">log in</a>
  <!--form method="post" action="login_direct.php">
    <input id="menu_user_login_username" name="form_login_username" type="text" placeholder="Username" />
    <input id="menu_user_login_password" name="form_login_password" type="password" placeholder="password" />
    <input type="submit" value="Log in!" />
  </form-->
</div>
<div id="menu_user_signup">
  <a href="signup.php">sign up</a>
  <!--form method="post" action="signup.php">
    <input type="submit" value="Sign up!" />
  </form-->
</div>

_END;
}

echo<<<_END
</div>
</div>
_END;

echo<<<_END
<div id="app">
<div><div>
  <div id="graph_placeholder"></div>
  <div id="search_placeholder"></div>
  <!--div id="menu_placeholder"></div-->
</div></div>
</div>
_END;

echo<<<_END
<!--div id="footer">
created 2013 by livegraph team
</div-->
_END;

echo<<<_END
</div>
<script data-main="js/App" src="libs/js/require.js"></script>
</body>
</html>
_END;
*/
