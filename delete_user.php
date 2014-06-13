<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
session_start();
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/page.php');
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'/php/func/db.php');
//require_once("login.php");

//header("Content-type: application/xhtml+xml");

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

if($loggedin){
  /**either the data were posted or not**/
  if(isset($_POST['password'],$_POST['submit'])&&$_POST['submit']=='delete'){
    /**if the data is post, process them**/
    $p_password=$_POST['password'];
    
    /**test if username exists and matches password**/
    
    $db = new Everyman\Neo4j\Client();
    $user_node=get_user($db,$userstr);
    
    
    $password_matched=$user_node->getProperty('password')==sha1(SALT1.$p_password.SALT2);
    
    sleep(1);
    
    if($password_matched){
      /**do the user deleting**/
      $batch = $db->startBatch();

      // None of the following operations are sent to the server until...
      $relationships=$user_node->getRelationships();
      foreach($relationships as $rel){
	$rel->delete();
      }
      $user_node->delete();

      $db->commitBatch();
      
      destroySession();
      $loggedin=false;
      $usr_deleted=$userstr;
      $userstr='guest';
      $thx=htmlentities('Thank you, '.$usr_deleted.', that you used LiveGraph. We appologize for the disappointment. Please, come back when you find this app useful. Goodbye.');
      $content_delete='
<div>
<div style="position: relative; margin: 20px;">
<h2 style="font-weight: bold; font-size:1.5em;" >user: $usr_deleted</h2>
<h2 style="font-weight: bold; font-size:1.5em;" >Your account was successfully deleted.</h2>
<div>'.$thx.'</div>
<div><a href="'.ROOT_PATH.'">Home.</a></div>
</div>
</div>';
    
      $page=new page($loggedin,$userstr);
      $page->add($content_delete)->title('User deleted.')->css(ROOT_PATH.'css/edit_user.css')->write();
      
      
      
    }else{
      /**what should happen when username doesn't match the password? maybe after 3 tries in one day ask for captcha?**/
      /** TODO put info about unsuccessful try to delete user to database**/
      destroySession();
      $loggedin=false;
      $userstr='guest';
      $content_nosuccess_delete='
<div>
<div style="position: relative; margin: 20px;">
<h2 style="font-weight: bold; font-size:1.5em;" >Password you typed in was incorrect or other error occured.</h2>
<div>Your account was NOT deleted. We logged you out for security reasons.</div>
<div><a href="'.ROOT_PATH.'login">Log back in.</a> <a href="'.ROOT_PATH.'">Home.</a></div>
</div>
</div>';
    
      $page=new page($loggedin,$userstr);
      $page->add($content_nosuccess_delete)->title('User not deleted.')->css(ROOT_PATH.'css/edit_user.css')->write();
    }
    unset($db);
  }
  else{
  /**if not posted data, page with form should be shown**/
  
  $info=  htmlentities('This action is irreversible. Your account will be deleted. You won\'t be able to restore any of your info. All the mindmaps you own will be left in the database.
  If you want to delete some of them, do that manually before deleting your account. This will be made easier in the future. Please, consider leaving the data which are also owned by others.');
  $content=<<<_END
<div>
  <div style="position: relative; margin: 20px;">
  <h2 style="font-weight: bold; font-size:1.5em;" >user: $userstr</h2>
  <h2 style="font-weight: bold; font-size:1.5em;" >Delete account.</h2>
  <div>$info</div>
  <form method="post" action="" >
  <table style="width:100%;">
  <tbody>
    <tr><td>Type Your Password</td><td><input type="password" name="password" id="password" title="password" value="" placeholder="password" /></td></tr>
    <tr><td></td><td><button id="submit" name="submit" type="submit" value="delete" style="background-color:red;">Delete my account.</button></td></tr>
    <tr><td></td><td><a class="button-link" href="/"><button type="button" style="background-color:green;">Leave to homepage.</button></a></td></tr>
  </tbody>
  </table>
  </form>
  </div>
</div>
_END;
    
    $page=new page($loggedin,$userstr);
    $page->add($content)->title('Delete User: '.$userstr)->css(ROOT_PATH.'css/edit_user.css')->write();
  }
}
else{
  /**not logged in?**/
  /**show page with link to home or login or signup**/
  
  $content_not_logged='
<div>
  <div style="position: relative; margin: 20px;">
  <h2 style="font-weight: bold; font-size:1.5em;" >'.htmlentities("You can't delete your account. You are not logged in.").'</h2>
  <div>
    <a href="'.ROOT_PATH.'login">Log in.</a>
    <a href="'.ROOT_PATH.'signup">Sign up.</a>
    <a href="'.ROOT_PATH.'">Homepage.</a>
  </div>
  </div>
</div>';

  $page_not_logged=new page($loggedin,$userstr);
  $page_not_logged->add($content_not_logged)->title('Delete User: not logged in')->css(ROOT_PATH.'css/edit_user.css')->write();
}

function destroySession(){
  $_SESSION=array();
  if (session_id() != "" || isset($_COOKIE[session_name()]))
  setcookie(session_name(), '', time()-2592000, ROOT_PATH);
  session_destroy();
}