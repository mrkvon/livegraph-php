define(['./Search/SearchModule','./Graph/GraphModule','./People/PeopleModule','./Selection/Selection','jquery'],function(Search,Graph,People,Selection,$){
	
	
	/**
	 * this is a layer for plugging in all the modules.
	 * 
	 * it should take care of the basic view and switching between modules (in View for example.)
	 * basic view + navigation.
	 * 
	 * it should also load the modules.
	 * There could be some default way of loading + loading the modules to different places of the webpage.
	 * 
	 * or... input will contain settings: {search:mainDom, graph:default,people:'off'}
	 * 
	 * 
	 * class Master
	 * 
	 * 
	 * 
	 **/
	
	function Template(htmlDom){
		
		var settings={
			'sizeRightside':'300px',
			switchOn:{'background-color':'#fff'},
			switchOff:{'background-color':'#aaa'}
		};
		
		
		
		var wrapper=$(document.createElement('div'))
		.css({position:'absolute','pointer-events':'none',height:'100%',width:'100%',overflow:'hidden','background-color':'#efc'}).appendTo(htmlDom);
		var background=$(document.createElement('div'))
		.css({position:'absolute','pointer-events':'visible',height:'100%',width:'100%',overflow:'hidden'}).appendTo(wrapper);
		
		/**********************************************************/
		
		var rightside=$(document.createElement('div')).addClass("master-rightside")
		.css({position:'absolute',top:'0px',bottom:'0px',right:'0px',height:'100%',width:settings.sizeRightside,/*'background-color':'rgba(255,100,255,0.3)'*/})
		.appendTo(wrapper);
		
		var rightsideHide=$(document.createElement('div'))
		.addClass('master-rightside-hide')
		.css({'pointer-events':'visible',position:'absolute',top:'0px',right:settings.sizeRightside,height:'30px',width:'30px','background-color':'#fff',border:'1px solid gray'})
		.text('>').css({'text-align':'center'})
		.appendTo(wrapper);
		
		
		var rightsideShow=$(document.createElement('div'))
		.addClass('master-rightside-hide')
		.css({'pointer-events':'visible',position:'absolute',top:'0px',right:'0px',height:'30px',width:'30px','background-color':'#fff',border:'1px solid gray',display:'none'})
		.text('<').css({'text-align':'center'})
		.appendTo(wrapper);
		
		rightsideHide.on('click',function(){
			rightside.css({display:'none'});
			rightsideHide.css({display:'none'});
			rightsideShow.css({display:''});
			
			$(switchSearch).css({display:'none'});
			$(switchSelect).css({display:'none'});
		});
		
		rightsideShow.on('click',function(){
			rightside.css({display:''});
			rightsideShow.css({display:'none'});
			rightsideHide.css({display:''});
			
			$(switchSearch).css({display:''});
			$(switchSelect).css({display:''});
		});
		
		var switchSearch=$(document.createElement('div'))
		.addClass('master-switch-search')
		.css({'pointer-events':'visible',position:'absolute',top:'30px',right:settings.sizeRightside,height:'30px',width:'30px',border:'3px solid gray'})
		.css(settings.switchOn)
		.text('sr').css({'text-align':'center'})
		.appendTo(wrapper);
		
		var switchSelect=$(document.createElement('div'))
		.addClass('master-switch-select')
		.css({'pointer-events':'visible',position:'absolute',top:'60px',right:settings.sizeRightside,height:'30px',width:'30px',border:'3px solid gray'})
		.css(settings.switchOff)
		.text('sl').css({'text-align':'center'})
		.appendTo(wrapper);
		
		var searchdom=$(document.createElement('div'))
		.css({'display':'',position:'absolute',height:'100%',width:'100%','pointer-events':'none'})
		.appendTo(rightside);
		
		var selectdom=$(document.createElement('div'))
		.css({'display':'none',position:'absolute',height:'100%',width:'100%'})
		.appendTo(rightside);
		
		switchSearch.on('click',function(){
			console.log('switch');
			searchdom.css({'display':''});
			selectdom.css({'display':'none'});
			$(this).css(settings.switchOn);
			switchSelect.css(settings.switchOff);
		});
		
		switchSelect.on('click',function(){
			console.log('switch');
			selectdom.css({'display':''});
			searchdom.css({'display':'none'});
			$(this).css(settings.switchOn);
			switchSearch.css(settings.switchOff);
		});
		
		return{
			graph:background,
			search:searchdom,
			people:wrapper,
			select:selectdom,
			settings:settings,
			buttons:{select:switchSelect,search:switchSearch}
		};
	}
	
	
	function Master(htmlDom,databaseUrl){//htmlDom is all-application wrapper in DOM, databaseUrl is url of database
		this.dom=Template(htmlDom);
		
		this.database=(databaseUrl[databaseUrl.length-1]=='/')?databaseUrl:databaseUrl+'/';
		this.people=new People($(this.dom.people),this,$('#topbar'));//(place to add icon, place to add application)
		this.graph=new Graph(this.dom.graph,this);
		this.search=new Search(this.dom.search,this);
		this.selection=new Selection(this.dom.select,this);
		
		(function(This){

		})(this);
	}
	
	Master.prototype={
		constructor:Master,
		on:function(message){
			/**
			 * what is this function for?????
			 * probably changing the master buttons in general... or master appearance... etc.
			 * 
			 **/
			if(message=='search'){
				this.dom.search.css({'display':''});
				this.dom.select.css({'display':'none'});
				this.dom.buttons.search.css(this.dom.settings.switchOn);
				this.dom.buttons.select.css(this.dom.settings.switchOff);
			}
			else if(message=='selection'){
				this.dom.select.css({'display':''});
				this.dom.search.css({'display':'none'});
				this.dom.buttons.select.css(this.dom.settings.switchOn);
				this.dom.buttons.search.css(this.dom.settings.switchOff);
			}
		},
		updateHistory:function(bPush){	/**bPush: boolean true=>pushState(), false=>replaceState()**/
			var bPush=bPush||false;
			/**collect data to put to graph history
			 * baseUrl/graph/nodes/uuid--uuid--uuid--uuid--.../links/uuid--uuid--uuid--uuid--.../
			 * 
			 **/
			var nodes=this.graph.view.graph.nodes;
			var links=this.graph.view.graph.links;
			var nodeUuids=[];
			var linkUuids=[];
			
			for(var uuid in nodes){
				nodeUuids.push(uuid);
			}
			for(var uuid in links){
				linkUuids.push(uuid);
			}
			
			var url='/';
			url+='graph/';
			url+=nodeUuids.length>0?'nodes/'+nodeUuids.join('--')+'/':'';
			url+=linkUuids.length>0?'links/'+linkUuids.join('--')+'/':'';
			if(bPush){
				window.history.pushState({graph:{nodes:nodeUuids,links:linkUuids}},'title',url);
			}
			else{
				window.history.replaceState({graph:{nodes:nodeUuids,links:linkUuids}},'title',url);
			}
			
		}
	}
	
	
	
	
	return Master;
});