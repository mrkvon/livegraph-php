<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');

class page{

  
  /**head is basic data necessary for creating page head*/
  /**title:page title, css: array of stylesheets*/
  private $head=array('title'=>'','css'=>array());
  private $body='';
  /**scripts are [{link:"",properties{name:value}}] **/
  private $js=array();
  private $loggedin=false;
  private $username='';


  function __construct($loggedin,$username=''){
    $this->loggedin=$loggedin;
    if($loggedin) $this->username=$username;
    return $this;
  }
  
  /**add content to function body, $content is string**/
  public function add($content){
    $this->body.=$content;
    return $this;
  }
  
  public function title($title){
    $this->head['title']=$title;
    return $this;
  }
  
  public function css($link){
    $this->head['css'][]=$link;
    return $this;
  }
  
  public function js($link,$properties=array()){
    $script=array('link'=>$link,'properties'=>array());
    foreach($properties as $name=>$value){
      $script['properties'][$name]=$value;
    }
    $this->js[]=$script;
    return $this;
  }
  
  
  public function write(){
  
    function html_header($loggedin,$username){
      $return='';
      $return.='<div id="topbar">';
      $return.='<div id="topbar-wrapper">';
      $return.='<div id="topbar-logo"><a href="'.ROOT_PATH.'" style="font-weight:bold"><div style="display:inline-block; padding:none;"><img src="'.ROOT_PATH.'img/livegraph_icon.png" alt="LiveGraph logo" style="width:24px;height:24px;margin:5px 3px 5px 3px;position:relative;top:-10px;" /></div><div style="position:absolute;display:inline-block;">LiveGraph</div></a></div>';
      $return.='<div id="topbar-links-right">';
      if($loggedin){
	$return.='<a href="'.ROOT_PATH.'user.php">'.htmlentities($username).'</a><a href="'.ROOT_PATH.'">settings</a>';
      }
      else{
	$return.='<a href="'.ROOT_PATH.'signup/">signup</a><a href="'.ROOT_PATH.'login/">login</a>';
      }
      $return.='<a href="'.ROOT_PATH.'about">about</a>';
      $return.='</div>';
      $return.='</div>';
      $return.='</div>';
      
      return $return;
    }
  
  
  
  
  
    /*********write basic*/
    echo<<<_END
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
_END;
    /*********output head*************/
    echo<<<_END
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
_END;
    echo '<title>LiveGraph::'.$this->head['title'].'</title>';
    echo '<link rel="icon" type="image/png" href="'.ROOT_PATH.'img/livegraph_icon.png" />';
    echo '<link rel="stylesheet" type="text/css" href="'.ROOT_PATH.'css/reset.css" />';
    echo '<link rel="stylesheet" type="text/css" href="'.ROOT_PATH.'css/topbar.css" />';

    foreach($this->head['css'] as $csslink){
      echo '<link rel="stylesheet" type="text/css" href="'.$csslink.'" />';
    }
    echo "</head>";
    /**********output body************/
    echo '<body style="background:#fff;"><div id="main_wrapper" style="height:100%;width:100%;position:absolute;">';
		
    /************output header*********/
    
    echo html_header($this->loggedin, $this->username);
    

    
    /**end output header*********************/
    echo $this->body;

    echo '</div>';

    /**scripts adding**/
    
    foreach($this->js as $script)
    {
      echo '<script src="'.$script['link'].'" ';
      //data-main="js/App" 
      foreach($script['properties'] as $name=>$value){
	echo $name.'="'.$value.'" ';
      }
      
      echo '></script>';
    }
    
    echo '</body>';
    /**********finish*******/
    echo('</html>');
    
    

  }
}



/*
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


*/
