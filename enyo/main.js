enyo.kind({
	
  	name: "Mendeley.Main",
  	kind: enyo.VFlexBox,
  	
  	prefs: new Prefs(),

	components: [
		{
			kind: "AppMenu",
			components: [
		  		{
		  			caption: "Account",
		  			onclick: "account"
	  			}
			]
		},
  		{
  			kind: "Toolbar",
  			name: 'toolbar',
  			components: [
  				{
  					kind: "TabGroup",
  					flex: 1,
  					name: 'mainButtons',
  					onChange: 'myGroupClick',
  					components: [
		      			{
		      				name: 'btnDashboard',
			      			caption: "Dashboard",
			      			value: 'viewDashboard'
      					},
				      	{
				      		name: 'btnLibrary',
				      		caption: "My Library",
				      		value: 'viewLibrary'
			      		},
				      	{
				      		name: 'btnPapers',
				      		caption: "Papers",
				      		value: 'viewPapers'
			      		},
				      	{
				      		name: 'btnGroups',
				      		caption: "Groups",
				      		value: 'viewGroups'
			      		},
				      	{
				      		name: 'btnPeople',
				      		caption: "People",
				      		value: 'viewPeople'
			      		}
  					]
  				},
  			]
		},
		{kind: "SlidingPane", flex: 1, components: [
			{name: "left", width: "250px", components: [
				{kind: "DividerDrawer", caption: "My Library", components: [
					//{name: 'all-documents', kind: 'DrawerItem', label: "All Documents"},
	          		{kind: 'HFlexBox', components: [
		          		{kind: "Image", style: 'padding-left: 18px; padding-right: 4px;', src: 'images/all-documents.png'},
						{content: "All Documents", style: 'font-size: 80%;'}
	          	  	]},
			  		{kind: 'HFlexBox', components: [
		          		{kind: "Image", style: 'padding-left: 18px; padding-right: 4px;', src: 'images/recently-added.png'},
						{content: "Recently Added", style: 'font-size: 80%;'}
	          	  	]},
		          	{kind: 'HFlexBox', components: [
		          		{kind: "Image", style: 'padding-left: 18px; padding-right: 4px;', src: 'images/favorites.png'},
						{content: "Favorites", style: 'font-size: 80%;'}
	          	  	]},
	          	  	{kind: 'HFlexBox', components: [
		          		{kind: "Image", style: 'padding-left: 18px; padding-right: 4px;', src: 'images/emblem-important.png'},
						{content: "Needs Review", style: 'font-size: 80%;'}
	          	  	]},
	          	  	{kind: 'HFlexBox', components: [
		          		{kind: "Image", style: 'padding-left: 18px; padding-right: 4px;', src: 'images/my-publications.png'},
						{content: "My Publications", style: 'font-size: 80%;'}
	          	  	]},
	          	  	{kind: 'HFlexBox', components: [
		          		{kind: "Image", style: 'padding-left: 18px; padding-right: 4px;', src: 'images/unsorted.png'},
						{content: "Unsorted", style: 'font-size: 80%;'}
	          	  	]},
		          	{content: "Create Folder...", style: 'padding-left: 44px; font-size: 80%;'}
				]},
				{kind: "DividerDrawer", caption: "Groups", components: [
			          {content: "Create Group...", style: 'padding-left: 44px; font-size: 80%;'}
				]},
				{kind: "DividerDrawer", caption: "Trash", components: [
					{kind: 'HFlexBox', components: [
		          		{kind: "Image", style: 'padding-left: 18px; padding-right: 4px;', src: 'images/user-trash.png'},
						{content: "All Deleted Documents", style: 'font-size: 80%;'}
	          	  	]},
				]}
			]},
	  		{name: "right", flex: 1, components: [
	  			{
					kind: "Scrim",
					layoutKind: "VFlexLayout",
					align: "center", pack: "center",
					components: [
						{kind: "SpinnerLarge", name: 'mainSpinner'}
					]
				},
	  			{
					kind: "Pane",
					flex: 1,
					name: 'viewPane',
					components: [
						{
							kind: 'List2',
							name: 'viewLibrary',
							data: [],
							flex:1,
							height: '100%',
							onSetupRow: 'setupRow',
							components: [
								{name: "divider", captureState: false, kind: "Divider", showing: false, caption: "Sometime"},
								{name: 'paper', kind: 'Item', style: 'font-size: 65%;', allowHtml: true}
			    			]
						},
						{name: 'viewDashboard',flex:1},
						{name: 'viewPapers',flex:1},
						{name: 'viewGroups',flex:1},
						{name: 'viewPeope',flex:1},
					]
				},
				{
					kind: 'Toolbar',
					name: 'bottom-bar',
					components: [
						{
							kind: 'GrabButton'
						},
						{
							name: "refresh",
							kind: "ToolButton", 
							icon: "images/icon-refresh.png",
							onclick: 'refreshView'
						}
					]
				}
	  		]}
		]}
	],
	
	getDivider: function(inMessage, inIndex) {
		var prevYear = this.$.viewLibrary.fetch(inIndex - 1).year
		var nextYear = this.$.viewLibrary.fetch(inIndex + 1).year
		if (inIndex==0 && !inMessage.year) {
			this.$.divider.setShowing(true)
        	this.$.divider.setCaption('????')
        	this.$.divider.canGenerate = true
            this.$.paper.domStyles["border-top"] = "none"
		} else if (prevYear != inMessage.year) {
			this.$.divider.setShowing(true)
        	this.$.divider.setCaption(inMessage.year)
        	this.$.divider.canGenerate = true
            this.$.paper.domStyles["border-top"] = "none"
    	} else {
    		this.$.divider.canGenerate = false
    	}
    	if (nextYear != inMessage.year) {
    		this.$.paper.domStyles["border-bottom"] = "none"
    	}
	},
	
	setupRow: function(inSender, info, inIndex) {
		this.getDivider(info, inIndex)
		var authors = info.authors.join(', ')
		var year = info.year ? '. ('+info.year+')' : ''
		var title = info.title ? '. '+info.title : ''
		var journal = info.publication_outlet ? '. <i>'+info.publication_outlet+'</i>' : ''
		var volume = info.volume ? ', '+info.volume : ''
		var issue = info.issue ? '('+info.issue+')' : ''
		var pages = info.pages ? ', '+info.pages+'.' : '.'
		this.$.paper.setContent(authors+year+title+journal+volume+issue+pages)
	},
	
	initComponents: function() {
		this.inherited(arguments)
		this.createComponent({
			kind: "Mendeley.Client",
			name: 'client',
			prefs: this.prefs,
			onOAuthReady: 'handleOAuthReady',
			onFailure: 'failure'
		})
	},

	myGroupClick: function(inSender, e) {
  		this.warn("Current selection: " + inSender.getValue())
  		this.$.viewPane.selectViewByName(inSender.getValue());
	},
	
	sortByAuthor: function(a ,b) {
		if (!a.authors && !b.authors)
			return 0
		else if (!a.authors && b.authors)
			return 1
		else if (a.authors && !b.authors)
			return -1
		else (a.authors && b.authors)
			if (a.authors > b.authors)
				return 1
			else if (a.authors < b.authors)
				return -1
			else
				return 0
	},
	
	sortByYear: function(a, b) {
		if (!a.year && !b.year)
			return this.sortByAuthor(a, b)
		else if (!a.year && b.year)
			return -1
		else if (a.year && !b.year)
			return 1
		else (a.year && b.year)
			if (a.year > b.year)
				return -1
			else if (a.year < b.year)
				return 1
			else
				return this.sortByAuthor(a, b)
	},
	
	document: function(data) {
		this.$.viewLibrary.data.push(enyo.json.parse(data.text))
		if (this.$.viewLibrary.data.length==105) {
			this.$.viewLibrary.data.sort(enyo.bind(this, 'sortByYear'))
			this.$.mainSpinner.hide()
			this.$.scrim.hide()
			this.$.viewLibrary.refresh()
		}
	},
	
	library: function(data) {
		this.$.viewLibrary.data = []
		var ids = enyo.json.parse(data.text).document_ids
		for (i in ids)
			this.$.client.getDocument(ids[i], enyo.bind(this,'document'), enyo.bind(this,'failure'))
	},
	
	getLibrary: function() {
		this.$.scrim.show()
		this.$.mainSpinner.show()
		this.$.mainButtons.setValue('viewLibrary')
		this.$.client.getLibrary(enyo.bind(this,'library'), enyo.bind(this,'failure'))
	},
	
	refreshView: function(inSender, inEvent) {
		this.getLibrary()
	},
	
	failure: function(inMessage) {
		this.error(enyo.json.parse(inMessage.text).error)
		this.$.mainSpinner.hide()
		this.$.scrim.hide()
	},	
	
	account: function() {
    	this.$.client.account()
	},
	
	handleOAuthReady: function(inSender, hasAccount) {
		if (hasAccount)
			this.getLibrary()
		else
			this.account()
	}
	
})