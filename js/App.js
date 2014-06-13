(function () {
	var load = requirejs.load;
	requirejs.load = function (context, moduleId, url) {
		//modify url here, then call original load
		return load(context, moduleId, url);
	};

require.config(
	{
		baseUrl: "/js/",
		shim:{
			"mathjax": {
				exports: "MathJax"
			},
			"libs/mathjax":["libs/jquery-1.10.2"],
			"cowboy":["jquery"]
		},
		map:{
			'libs/mathjax':{'mathjax':'MathJax.js?config=TeX-AMS-MML_HTMLorMML'}
		},
		paths:{
			"jquery": "libs/jquery-1.10.2",
			"mathjax":"libs/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
// 			"springy":"/js/libs/springy/springy",
			"cowboy":"libs/jquery.ba-throttle-debounce"
		}
});
	

require([/*'Modules/Search/View/SearchView','Modules/Graph/View/GraphView','Modules/People/PeopleModule',*/'Modules/Master','jquery'],function(/*SearchView,GraphView,PM,*/Master,$){

	new Master($('#app'),'/php/database/');/**class (DOMObject element to connect to, string url_of_database)**/
//	 GraphView.init(document.getElementById('graph_placeholder'));
//	 SearchView.init(document.getElementById('search_placeholder'));
//	 new PM($('#topbar'),$('#app'));//(place to add icon, place to add application)
	

//People.init(document.getElementById('menu_placeholder'));
//	 var users = [new User('Barney'),new User('Cartman'),new User('Sheldon')];
// 
//	 localStorage.users=JSON.stringify(users);
	
//	 Router.startRouting();
	console.log('initialized');
});

}());