enyo.kind({
	
  	name: "Mendeley.Main",
  	kind: enyo.HFlexBox,
  	className: 'main',
  	
  	prefs: new Prefs(),
  	
  	libraryTotalResults: 0,
  	myLibrary: [],
  	
  	rightPaneLastViewed: 'detailsView',

	components: [
		{
			kind: "Scrim",
			layoutKind: "VFlexLayout",
			align: "center", pack: "center",
			components: [
				{kind: "SpinnerLarge", name: 'mainSpinner'}
			]
		},
		{
			kind: "AppMenu",
			components: [
		  		{
		  			caption: "Account",
		  			onclick: "account"
	  			}
			]
		},
		{kind: "SlidingPane", name: 'views', flex: 1, components: [
			{name: "left", width: "25%", fixedWidth: true, components: [
				{
					kind: 'Toolbar',
					name: 'left-bar',
					className: 'enyo-toolbar-light',
					components: [
						{kind: 'RoundedSearchInput', hint: $L('Type here to search'), flex: 1}
					]
				},
				{kind: 'FadeScroller', flex:1, components: [
					{kind: "DividerDrawer", caption: "My Library", className: 'main-list', components: [
						{name: 'all-documents',  kind: 'DrawerItem', className: 'drawer-item first', label: 'All Documents', icon: 'all-documents', onclick: 'showDocs'},
						{name: 'recently-added',  kind: 'DrawerItem', className: 'drawer-item', label: 'Recently Added', icon: 'recently-added', onclick: 'showDocs'},
						{name: 'favorites',  kind: 'DrawerItem', className: 'drawer-item', label: 'Favorites', icon: 'favorites', onclick: 'showDocs'},
						{name: 'needs-review',  kind: 'DrawerItem', className: 'drawer-item', label: 'Needs Review', icon: 'needs-review', onclick: 'showDocs'},
						{name: 'my-publications',  kind: 'DrawerItem', className: 'drawer-item', label: 'My Publications', icon: 'my-publications', onclick: 'showDocs'},
						{name: 'unsorted',  kind: 'DrawerItem', className: 'drawer-item', label: 'Unsorted', icon: 'unsorted', onclick: 'showDocs'},
						{name: 'create-folder',  kind: 'DrawerItem', className: 'drawer-item last', label: 'Create Folder...', onclick: 'showDocs'}
					]},
					{kind: "DividerDrawer", caption: "Groups", className: 'main-list', components: [
						{name: 'create-group',  kind: 'DrawerItem', className: 'drawer-item first last', label: 'Create Group...'}
					]},
					{kind: "DividerDrawer", caption: "Trash", className: 'main-list', components: [
						{name: 'trash',  kind: 'DrawerItem', className: 'drawer-item first last', label: 'All Deleted Documents', icon: 'trash'}
					]},
				]},
				{
					kind: 'Toolbar',
					name: 'left-bottom-bar',
					className: 'enyo-toolbar-light',
					components: [
						{
							name: "refresh",
							kind: "ToolButton",
							icon: "images/icon-refresh.png",
							onclick: 'refreshView'
						}
					]
				}
			]},
	  		{name: "middle", flex: 1, dismissible: true, showing: true, components: [
	  			{
					kind: 'List2',
					name: 'viewLibrary',
					data: [],
					flex:1,
					height: '100%',
					onSetupRow: 'setupRow',
					components: [
						{name: "divider", captureState: false, kind: "Divider", showing: false, caption: "Sometime"},
						{name: 'paper', kind: 'Item', onclick: "listItemClick", tapHighlight: false, style: 'font-size: 65%;', allowHtml: true}
	    			]
				},
				{
					kind: 'Toolbar',
					name: 'bottom-bar',
					className: 'enyo-toolbar-light',
					components: [
						{
							kind: 'GrabButton'
						},
						{kind: "Spacer"},
						{kind: "ListSelector", value: 2, onChange: "itemChanged", items: [
							{caption: "Filter by Author's Keyworks", value: 1},
					        {caption: "Filter by Authors", value: 2},
					        {caption: "Filter by My Tags", value: 3},
					        {caption: "Filter by Publications", value: 4},
					    ]},
					    {kind: "Spacer"},
					    {kind: "ListSelector", value: 1, onChange: "itemChanged", items: [
							{caption: "All", value: 1},
					    ]},
					    {kind: "Spacer"}
					]
				}
	  		]},
	  		{name: "right", width: "25%", dismissible: true, showing: false, components: [
	  			{
					kind: 'Toolbar',
					name: 'right-bar-top',
					className: 'enyo-toolbar-light',
					components: [
						{kind: "RadioGroup", name: 'rightGroup', onclick: "myGroupClick", components: [
			        		{caption: "Details", value: "detailsView"},
			        		{caption: "Notes", value: "notesView"},
				      	]}
					]
				},
				{kind: 'Pane', flex: 1, name: 'rightMain', components: [
					{name: 'detailsView', flex: 1, components: [
				      	{kind: 'FadeScroller', style: 'height: 100%;', flex:1, components: [
				      		{
								kind: 'List2',
								name: 'details',
								data: [],
								flex:1,
								height: '100%',
								onSetupRow: 'setupDetailsRow',
								components: [
									{name: "detailDivider", captureState: false, kind: "Divider", showing: false, caption: "Sometime"},
									{name: 'detail', kind: 'Item', className: 'first last', onclick: "detailItemClick", tapHighlight: false, style: 'font-size: 65%;', allowHtml: true}
				    			]
							}
				      	]}
			      	]},
					{name: 'notesView', flex: 1}
				]},
		      	{
					kind: 'Toolbar',
					name: 'bottom-bar-right',
					className: 'enyo-toolbar-light',
					components: [
						{
							kind: 'GrabButton'
						}
					]
				}
	  		]}
		]}
	],
	
	showDocs: function(inSender, inEvent) {
		if (inSender.name=='all-documents')
			this.$.middle.setShowing(true)
	},
	
	listItemClick: function(inSender, inEvent) {
		this.$.viewLibrary.setSelected(inEvent.rowIndex)
		this.$.viewLibrary.refresh()
		var paper = this.$.viewLibrary.fetch(inEvent.rowIndex)
		this.$.details.data = []
		for (var key in paper) {
			if (key[0] != '_')
				this.$.details.data.push([key,paper[key]])
		}
		this.$.rightGroup.setValue(this.rightPaneLastViewed)
		this.$.right.setShowing(true)
		this.$.details.refresh()
	},
	
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
		if (info._selected)
			this.$.paper.addClass('enyo-held')
		else
			this.$.paper.removeClass('enyo-held')
	},
	
	setupDetailsRow: function(inSender, info, inIndex) {
		this.$.detailDivider.setShowing(true)
		this.$.detailDivider.setCaption(info[0])
		this.$.detailDivider.canGenerate = true
		this.$.detail.setContent(info[1])
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
		this.rightPaneLastViewed = inSender.getValue()
  		this.$.rightMain.selectViewByName(this.rightPaneLastViewed)
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
	
	document: function(id, data) {
		var entry = enyo.json.parse(data.text)
		entry._id = id
		if (this.$.viewLibrary.selected != null && this.$.viewLibrary.selected.id == id)
			entry._selected = true
		else
			entry._selected = false
		this.myLibrary.push(entry)
		if (this.myLibrary.length==this.libraryTotalResults) {
			this.myLibrary.sort(enyo.bind(this, 'sortByYear'))
			this.$.viewLibrary.data = this.myLibrary
			this.$.mainSpinner.hide()
			this.$.scrim.hide()
			this.$.viewLibrary.refresh()
		}
	},
	
	library: function(data) {
		var info = enyo.json.parse(data.text)
		this.libraryTotalResults = info.total_results
		var ids = info.document_ids
		for (i in ids)
			this.$.client.getDocument(ids[i], enyo.bind(this,'document',ids[i]), enyo.bind(this,'failure'))
		if (info.current_page < info.total_pages-1)
			this.$.client.getLibrary(enyo.bind(this,'library'), enyo.bind(this,'failure'), info.current_page+1)
	},
	
	getLibrary: function(page) {
		this.$.scrim.show()
		this.$.mainSpinner.show()
		//this.$.mainButtons.setValue('viewLibrary')
		this.$.client.getLibrary(enyo.bind(this,'library'), enyo.bind(this,'failure'), page)
	},
	
	refreshView: function(inSender, inEvent) {
		this.myLibrary = []
		this.getLibrary(0)
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
			this.refreshView()
		else
			this.account()
	}
	
})