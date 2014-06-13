<?php
header('Content-type: application/xhtml+xml');
echo<<<_END
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head profile="http://www.w3.org/2005/10/profile">
<link rel="icon" type="image/png" href="/img/livegraph_logo.png" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>livegraph.org</title>
<link rel="stylesheet" type="text/css" href="/css/reset.css" />
<link rel="stylesheet" type="text/css" href="/about/index.css" />
</head>
<body>
<div id="wrapper">
<div id="page">
<div id="social">
	<div id="twitter"><a id="twitter_img" href="https://twitter.com/LiveGraphOrg"><img src="https://abs.twimg.com/a/1378701295/images/resources/twitter-bird-white-on-blue.png" alt="twitter link" width="30" height="30" /></a></div>
	<div id="rss"><a href="/about/rss"><img src="/img/rss-icon.png" alt="rss icon" width="30" height="30" /></a></div>
</div>
<div>
<h1>LiveGraph: Share your ideas</h1>
<p>How do ideas look like?<br />
How does knowledge look like?<br />
What happens when we connect all the pieces together?<br />
Ideas standing alone can be quite powerful. But what happens when they connect?<br />
LiveGraph wants to know.</p>
<hr />
<p>
<a href="/">Unstable version</a>. Application is in active development. Any feedback will be appreciated.
Appologies to users of <a href="http://caniuse.com/svg">old web browsers</a>. Application relies on SVG.
</p>
<p>
<a target="_blank" href="lg_manual/">Text manual</a> will come.
<a target="_blank" href="/graph/nodes/3e9da76c-f9f8-45c9-92d8-fb0667c5541e/">Graph manual</a> is here (poor attempt).
</p>
<hr />
<p>
<a target="_blank" href="http://michalsalajka.com">contact</a>.
</p>
<hr />
<p>screenshots from development (the data is discrete mathematics in Czech)</p>
<img src="http://i.imgur.com/AMGvd8p.png" alt="screenshot" height="300px" width="automatic" />
</div>
</div>
</div>
</body>
</html>
_END;
