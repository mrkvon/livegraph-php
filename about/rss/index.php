<?php
require_once('rss_list.php');
header('Expires: ' . gmdate('D, d M Y H:i:s') . '  GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . '  GMT');
header('Content-Type: text/xml; charset=utf-8');
echo<<<_END
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/css" href="rss.css"?>

<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>livegraph feed</title>
    <link>http://livegraph.org/</link>
    <description>livegraph feed: visual idea sharing application</description>
    <atom:link href="http:/livegraph.org/rss" rel="self" type="application/rss+xml" />

_END;

for($i=0;$i<sizeof($list);$i++){
$title=$list[$i]['title'];
$link=$list[$i]['link'];
$description=$list[$i]['description'];
$guid=$list[$i]['guid'];
echo<<<_END
    <item>
      <title>$title</title>
      <link>$link</link>
      <description>$description</description>
      <guid isPermaLink="false">$guid</guid>
    </item>

_END;
}


echo<<<_END
  </channel>
</rss>
_END;
