<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once $_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/lightopenid/openid.php';
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/page.php');

session_start();

header("Content-type: application/xhtml+xml");

$content='
<div id="wrapper">
<div id="header">
<a href="'.ROOT_PATH.'">main page</a>
</div>
<div id="signup_window">
<h1>
Sign Up!
</h1>
  <form method="post" action="'.ROOT_PATH.'adduser.php">
    <div><input type="text" name="username" id="username" value="" placeholder="Username" /></div>
    <div><input type="password" name="password" id="password" title="password" value="" placeholder="Password" /></div>
    <div><input type="password" name="password_retype" id="password_retype" title="retype password" value="" placeholder="Re-enter Password" /></div>
    <div><input type="text" name="email" id="email" title="email" value="" placeholder="Email" /></div>
    <div>
    <div>
    <div id="captcha_wrapper"><a id="captcha_reload" href=""><img id="captcha" src="/libs/php/securimage/securimage_show.php" alt="CAPTCHA Image" /></a>
    </div>
    </div>
    </div>
    <div>
    <input type="text" name="captcha_code" value="" title="captcha" placeholder="Type Text Above" />
    </div>
    <div>
    <input id="submit" name="submit" type="submit" value="Sign Up!" />
    </div>
  </form>
  
  <div>
  there will be an option to sign up with OpenID/fb
  
  <!--form action="" method="post">
    <input type="hidden" name="openid_identifier" value="https://www.google.com/accounts/o8/id" />
    <input type="submit" value="google" />
  </form>
  <form action="" method="post">
    <input type="hidden" name="openid_identifier" />
    <input type="submit" value="yahoo" />
  </form-->
  </div>
  
  
</div>
</div>';

$page=new page(false,'');

$page->add($content)->title('Sign Up')->css(ROOT_PATH.'css/signup.css')->js(ROOT_PATH.'js/signup.js')->write();

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


/*
  } elseif($openid->mode == 'cancel') {
    echo 'User has canceled authentication!';
  } else {

    if($openid->validate()){
      
      $oid=$openid->identity;
      $username=$openid->identity;
      
      require_once('add_openid_user.php');
      $user_is_created=add_openid_user($username,$oid);

      if($user_is_created){
	echo 'signed up successfully';
      }
      else{
	echo 'not signed up. <a href="signup.php">try again.</a><br />';
      }
      echo "<br /><a href='./'>main page</a>";
    }
  }
} catch(ErrorException $e) {
  echo $e->getMessage();
}
//*/