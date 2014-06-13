<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
session_start();
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/page.php');
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/db.php');


/**setting session**/
if(isset($_SESSION["user"])){
  $user=$_SESSION["user"];
  $loggedin=true;
  $userstr=$user;
}
else{
  $loggedin=false;
  $userstr="guest";
}

/**processing data and creating page**/
if($loggedin){
/**either the data were posted or not**/
  if(isset($_POST['password-old'],$_POST['password-new1'],$_POST['password-new2'],$_POST['submit'])&&$_POST['submit']=='change-pass'){
    /**if the data is post, process them**/
    
    $p_password_old=$_POST['password-old'];
    $p_password_new1=$_POST['password-new1'];
    $p_password_new2=$_POST['password-new2'];
    
    /**test if username exists and matches password**/
    
    $db = new Everyman\Neo4j\Client();
    $user_node=get_user($db,$userstr);
    
    /**if old password matches database and both new passwords are the same**/
    $bgood_old_pass=$user_node->getProperty('password')==process_password($p_password_old);
    $bgood_new_pass=$p_password_new1==$p_password_new2 && valid_password($p_password_new1);
    
    if($bgood_old_pass&&$bgood_new_pass){
      /**set password to new one**/
      $batch = $db->startBatch();
	$user_node->setProperty('password',process_password($p_password_new1))->save();
      $success=$db->commitBatch();
      $passha=$user_node->getProperty('password');
      $content_changed='<div>
<div style="position: relative; margin: 20px;">
<h2 style="font-weight: bold; font-size:1.5em;" >User: $userstr</h2>
<h2 style="font-weight: bold; font-size:1.5em;" >Your password was successfully changed.</h2>
<div>Thank you for using LiveGraph.</div>
<div><a href="'.ROOT_PATH.'">Home.</a></div>
</div>
</div>';
    
      $page=new page($loggedin,$userstr);
      $page->add($content_changed)->title('Password changed.')->css(ROOT_PATH.'css/edit_user.css')->write();
      unset($page,$content_changed);
      
      
    }else{
      /**what should happen when old password is wrong? maybe log user out? maybe after 3 tries in one day ask for captcha?**/
      /** TODO put info about unsuccessful try to change pass to database**/
      
      
      $content_not_changed='<div><div style="position: relative; margin: 20px;">';
      $content_not_changed.='<h2 style="font-weight: bold; font-size:1.5em;" >Password change was not successful.</h2>'
      .'<div>'.htmlentities('Your password remains the same. You typed wrong old password or new passwords didn\'t match. Or password must have at least 5 characters.').'</div>';
      if(!$bgood_old_pass){
	/**log the user out and give info about it**/
	destroySession();
	$loggedin=false;
	$userstr='guest';
	
	$content_not_changed.='<div>You were logged out for security reasons.</div>'
	.'<div><a href="'.ROOT_PATH.'login">Log back in.</a> <a href="'.ROOT_PATH.'">Home.</a></div>';
      }
      else{
	$content_not_changed.='<div><a href="'.ROOT_PATH.'">Home.</a></div>';
      }
      $content_not_changed.='</div></div>';
    
      $page_no=new page($loggedin,$userstr);
      $page_no->add($content_not_changed)->title('Password not changed.')->css(ROOT_PATH.'css/edit_user.css')->write();
      unset($page_no,$content_not_changed);
    }
    unset($db);
  }
  else{
  /**if not posted data, page with form should be shown**/
  
  $content='
<div>
  <div style="position: relative; margin: 20px;">
  <h2 style="font-weight: bold; font-size:1.5em;" >user: $userstr</h2>
  <h2 style="font-weight: bold; font-size:1.5em;" >Change password.</h2>
  <div></div>
  <form method="post" action="" >
  <table style="width:100%;">
  <tbody>
    <tr><td>Type Your Old Password</td><td><input type="password" name="password-old" id="password-old" title="password" value="" placeholder="old password" /></td></tr>
    <tr><td>Type Your New Password</td><td><input type="password" name="password-new1" id="password-new1" title="password" value="" placeholder="new password" /></td></tr>
    <tr><td>Type Your New Password Again</td><td><input type="password" name="password-new2" id="password-new2" title="password" value="" placeholder="new password" /></td></tr>
    <tr><td></td><td><button id="submit" name="submit" type="submit" value="change-pass" style="background-color:yellow;">Change my password.</button></td></tr>
    <tr><td></td><td><a class="button-link" href="'.ROOT_PATH.'"><button type="button" style="background-color:green;">Leave to homepage.</button></a></td></tr>
  </tbody>
  </table>
  </form>
  </div>
</div>';
    
    $page=new page($loggedin,$userstr);
    $page->add($content)->title('Change password: '.$userstr)->css(ROOT_PATH.'css/edit_user.css')->write();
  }
}
else{
  /**not logged in?**/
  /**show page with link to home or login or signup**/
  $content_pass_not_logged='
<div style="position: relative; margin: 20px;">
<h2 style="font-weight: bold; font-size:1.5em;" >You are not logged in.</h2>
<h2 style="font-weight: bold; font-size:1.5em;" >There is nothing to be changed.</h2>
<div>Please log in or sign up to view this functionality.</div>
<div><a href="'.ROOT_PATH.'login">Log in.</a> <a href="'.ROOT_PATH.'signup">Sign up.</a> <a href="'.ROOT_PATH.'">Home.</a></div>
</div>
</div>';
    
  $page=new page($loggedin,$userstr);
  $page->add($content_pass_not_logged)->title('Change Password')->css(ROOT_PATH.'css/edit_user.css')->write();
}

function destroySession(){
  $_SESSION=array();
  if (session_id() != "" || isset($_COOKIE[session_name()]))
  setcookie(session_name(), '', time()-2592000, ROOT_PATH);
  session_destroy();
}