<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');
require_once('phar://'.$_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'libs/php/neo4jphp.phar');
session_start();
require_once($_SERVER['DOCUMENT_ROOT'].ROOT_PATH.'php/func/page.php');
//require_once("login.php");

//header("Content-type: application/xhtml+xml");

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
  if(isset($_POST['name'],$_POST['website'],$_POST['location'],$_POST['birthday'],$_POST['email'],$_POST['info'])){
    
    $p_name=$_POST['name'];
    $p_website=$_POST['website'];
    $p_location=$_POST['location'];
    $p_birthday=$_POST['birthday'];
    $p_info=$_POST['info'];
    $p_email=$_POST['email'];
    
    $db = new Everyman\Neo4j\Client();
    $string_set_user_info="MATCH (user:User{username:{username}})
    SET user.name={name}, user.website={website}, user.location={location},
    user.birthday={birthday}, user.email={email}, user.info={info} RETURN user";
    $params_set_user_info=array(
      'username'=>$userstr,
      'name'=>$p_name,
      'website'=>$p_website,
      'location'=>$p_location,
      'birthday'=>$p_birthday,
      'email'=>$p_email,
      'info'=>$p_info
    );
    $query_set_user_info=new Everyman\Neo4j\Cypher\Query($db, $string_set_user_info, $params_set_user_info);
    $result_set_user_info=$query_set_user_info->getResultSet();
    
    unset($db);
    
    /**redirect to user info*****/
    header('Location: '.ROOT_PATH.'user.php');
  }
  else{
  header("Content-type: application/xhtml+xml");
  
  $username="";
  $g_name="";
  $g_website="";
  $g_location="";
  $g_birthday="";
  $g_email="";
  $g_info="";
  
  $db = new Everyman\Neo4j\Client();
  $string_set_user_info="MATCH (user:User{username:{username}}) RETURN user";
  $params_set_user_info=array('username'=>$userstr);
  $query_set_user_info=new Everyman\Neo4j\Cypher\Query($db, $string_set_user_info, $params_set_user_info);
  $result_set_user_info=$query_set_user_info->getResultSet();
  //print_r($result_set_user_info);
  foreach($result_set_user_info as $row){
    $username=$row['user']->getProperty('username');
    $g_name=$row['user']->getProperty('name');
    $g_website=$row['user']->getProperty('website');
    $g_location=$row['user']->getProperty('location');
    $g_birthday=$row['user']->getProperty('birthday');
    $g_email=$row['user']->getProperty('email');
    $g_info=$row['user']->getProperty('info');
  }
  unset($db);
  $username=htmlentities($username);
  $g_email=htmlentities($g_email);
  $g_info=htmlentities($g_info);
  $g_name=htmlentities($g_name);
  $g_website=htmlentities($g_website);
  $g_location=htmlentities($g_location);
  $g_birthday=htmlentities($g_birthday);
  
  $content=<<<_END
<div>
  <div style="position: relative; margin: 20px;">
  <h2 style="font-weight: bold; font-size:1.5em;" >user: $username</h2>
  <form method="post" action="" >
  <table style="width:100%;">
  <tbody>
    <tr><td>Name</td><td><input type="text" name="name" id="name" title="name" value="$g_name" placeholder="Name" /></td></tr>
    <tr><td>Website</td><td><input type="text" name="website" id="website" title="website" value="$g_website" placeholder="Website" /></td></tr>
    <tr><td>Location</td><td><input type="text" name="location" id="location" title="location" value="$g_location" placeholder="Location" /></td></tr>
    <tr><td>Birthday</td><td><input type="text" name="birthday" id="birthday" title="birthday" value="$g_birthday" placeholder="Birthday" /></td></tr>
    <tr><td>Email</td><td><input type="text" name="email" id="email" title="email" value="$g_email" placeholder="Email" /></td></tr>
    <tr><td style="vertical-align:top; padding-top:5px;">About Me</td><td><textarea type="text" name="info" id="info" title="info" value="$g_info" placeholder="Info" style="height: 200px; width: 100%;">$g_info</textarea></td></tr>
    <tr><td></td><td><input id="submit" name="submit" type="submit" value="Save Profile" /></td></tr>
  </tbody>
  </table>
  </form>
  </div>
</div>
_END;
    
    $page=new page($loggedin,$userstr);
    $page->add($content)->title('Edit User: '.$userstr)->css(ROOT_PATH.'css/edit_user.css')->write();
  }
}
