<?php // logout.php
//include_once 'header.php';
require_once($_SERVER['DOCUMENT_ROOT'].'/php/settings.php');

session_start();
if (isset($_SESSION['user']))
{
  destroySession();
}

header('Location: '.ROOT_PATH);
/**old client-side redirect**/
// echo<<<_END
// <!DOCTYPE HTML>
// <html lang="en-US">
//     <head>
//         <meta charset="UTF-8">
//         <meta http-equiv="refresh" content="1;url=./">
//         <script type="text/javascript">
//             window.location.href = "./"
//         </script>
//         <title>Page Redirection</title>
//     </head>
//     <body>
//         <!-- Note: don't tell people to `click` the link, just tell them that it is a link. -->
//         If you are not redirected automatically, follow the <a href="./">link to example</a>
//     </body>
// </html>
// _END;

function destroySession()
{
  $_SESSION=array();
  if (session_id() != "" || isset($_COOKIE[session_name()]))
  setcookie(session_name(), '', time()-2592000, ROOT_PATH);
  session_destroy();
}