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
			kind: 'Mendeley.Plugin',
			onPluginReady: 'pluginReady',
			onPushDocument: 'pushDocument',
			onSetLibrarySize: 'setLibrarySize'
		},
		{
			kind: "Popup2",
			name: 'newAccount',
			scrim: true,
			modal: true,
			autoClose: false,
			dismissWithClick: false,
			components: [
				{
					layoutKind: "HFlexLayout",
					pack: "center", 
					components: [
						{content: 'Account'}
					]
				},
				{
					kind: "RowGroup", components: [
      					{
      						kind: "Button",
      						caption: "Log In and Get PIN",
      						onclick: "login"
  						},
      					{
      						kind: "Input",
      						name: 'pin',
      						hint: "Enter PIN",
      						onchange: "inputChange"
  						}
          			]
      			},
          		{
          			layoutKind: "HFlexLayout",
          			pack: "center",
          			components: [
            			{
            				kind: "Button",
            				caption: "Save",
            				flex: 1,
            				onclick: "confirmClick",
            				className: 'enyo-button-affirmative'
        				},
              			{
              				kind: "Button",
              				caption: "Cancel",
              				flex: 1,
              				onclick: "cancelClick"
          				}
          			]
      			}
      		]
  		},
		{kind: "DocMenu", name: 'docMenu', onTap: 'handleDocMenuTap', onClose: 'docMenuClosed'},
		{
			kind: "Scrim",
			showing: true,
			name: 'init',
			layoutKind: "VFlexLayout",
			align: "center", pack: "center",
			components: [
				{className: 'init-logo'},
				{content: 'Initializing...', name: 'initText', className: 'init-text'},
				{kind: 'Spinner', name: 'initSpinner', showing: true},
			]
		},
		{
			kind: "AppMenu",
			components: [
				{caption: "Preferences", onclick: "preferences"},
		  		{caption: "Account", onclick: "account"},
			]
		},
		{kind: "SlidingPane", name: 'views', flex: 1, showing: false, components: [
			{name: "left", width: "27%", fixedWidth: true, components: [
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
						{name: 'allDocuments',  kind: 'DrawerItem', className: 'drawer-item first', label: 'All Documents', icon: 'all-documents', onclick: 'showDocs'},
						{name: 'recentlyAdded',  kind: 'DrawerItem', className: 'drawer-item', label: 'Recently Added', icon: 'recently-added', onclick: 'showDocs'},
						{name: 'favorites',  kind: 'DrawerItem', className: 'drawer-item', label: 'Favorites', icon: 'favorites', onclick: 'showDocs'},
						{name: 'needsReview',  kind: 'DrawerItem', className: 'drawer-item', label: 'Needs Review', icon: 'needs-review', onclick: 'showDocs'},
						{name: 'myPublications',  kind: 'DrawerItem', className: 'drawer-item', label: 'My Publications', icon: 'my-publications', onclick: 'showDocs'},
						{name: 'unsorted',  kind: 'DrawerItem', className: 'drawer-item', label: 'Unsorted', icon: 'unsorted', onclick: 'showDocs'},
						{name: 'createFolder',  kind: 'DrawerItem', className: 'drawer-item last', label: 'Create Folder...', onclick: 'showDocs'}
					]},
					{kind: "DividerDrawer", caption: "Groups", className: 'main-list', components: [
						{name: 'createGroup',  kind: 'DrawerItem', className: 'drawer-item first last', label: 'Create Group...'}
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
	  		{name: "middle", flex: 2, components: [
	  			{
					kind: 'List2',
					name: 'viewLibrary',
					data: [],
					flex:1,
					height: '100%',
					onSetupRow: 'setupRow',
					components: [
						{name: "divider", captureState: false, kind: "Divider", showing: false, caption: "Sometime"},
						{name: 'paper', kind: 'DocumentItem', onclick: 'listItemClick', onmousehold: 'listItemHold'}
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
	  		{name: "right", width: "27%", dismissible: true, showing: false, components: [
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
						{kind: 'GrabButton'},
						{kind: 'Button', content: 'Add Field'}
					]
				}
	  		]}
		]}
	],
	
	favClick: function(inSender, inEvent) {
		if (this.myLibrary[inSender.rowIndex]._isFavorite)
			this.myLibrary[inSender.rowIndex]._isFavorite = false
		else
			this.myLibrary[inSender.rowIndex]._isFavorite = true
		this.$.viewLibrary.data = this.myLibrary
		this.$.viewLibrary.refresh()
	},
	
	readClick: function(inSender, inEvent) {
		this.warn(['Read',inSender,inEvent])
	},
	
	pdfClick: function(inSender, inEvent) {
		this.warn(['Pdf',inSender,inEvent])
	},
	
	showDocs: function(inSender, inEvent) {
		if (inSender.name=='all-documents')
			this.$.middle.setShowing(true)
	},
	
	showDetails: function(row) {
		var paper = this.$.viewLibrary.fetch(row)
		this.$.details.data = []
		for (var key in paper)
			this.$.details.data.push([key,paper[key]])
		this.$.rightGroup.setValue(this.rightPaneLastViewed)
		this.$.right.setShowing(true)
		this.$.details.refresh()
	},
	
	handleDocMenuTap: function(inSender, command) {
		this.warn(command)
	},
	
	docMenuClosed: function(inSender, inEvent) {
		this.$.viewLibrary.refresh()
	},

	listItemHold: function(inSender, inEvent) {
		this.$.docMenu.setRowIndex(inEvent.rowIndex)
		this.$.docMenu.openAtEvent(inEvent)
	},
	
	listItemClick: function(inSender, inEvent) {
		if (!this.$.docMenu.showing)
			this.showDetails(inSender.rowIndex)
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
		
		this.$.paper.rowIndex = inIndex

		if (info.title)
			this.$.paper.$.title.setContent(info.title)
		if (info.authors)
			this.$.paper.$.authors.setContent(info.authors.join('; '))
		if (info.publication_outlet)
			this.$.paper.$.pubOutlet.setContent(info.publication_outlet)
		if (info.volume) {
			this.$.paper.$.volume.setContent(info.volume)
			this.$.paper.$.volume.addClass('smallLeftPad')
		}
		if (info.issue) {
			this.$.paper.$.issue.setContent('('+info.issue+')')
			this.$.paper.$.issue.addClass('smallLeftPad')
		}
		if (info.pages) {
			this.$.paper.$.pages.setContent('p. '+info.pages)
			this.$.paper.$.pages.addClass('smallLeftPad')
		}			
		if (info.dateAccessed==null)
			this.$.paper.$.read.addClass('readNo')
		else
			this.$.paper.$.read.addClass('readYes')
		
		if (info._isFavorite) {
			this.$.paper.$.fav.removeClass('favNo')
			this.$.paper.$.fav.addClass('favYes')
		} else {
			this.$.paper.$.fav.removeClass('favYes')
			this.$.paper.$.fav.addClass('favNo')
		}

		if (info.files && info.files.length>0)
			this.$.paper.$.pdf.addClass('pdfYes')
		else
			this.$.paper.$.pdf.addClass('pdfNo')

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
	
	file: function(hash, data) {
		var filename = data.responseHeaders['Content-Disposition'].split('"')[1]
		var path = this.prefs.get('libraryPath') + '/' + filename
		this.$.plugin.writefile(path, data.text)
		/*var i=0
		var t=Math.floor(data.text.length/1024)
		for (;i<t;i++) {
			this.$.plugin.writefile(path, data.text.substr(i*1024,1024))
			this.warn([i*1024,data.text.length])
		}
		this.warn(data.text.length-i*1024)
		this.$.plugin.writefile(path, data.text.substr(i*1024))*/
	},

	getDocumentDetails: function(id) {
		this.$.plugin.getDocument(enyo.bind(this, 'details'), id)
	},

	refreshView: function(inSender, inEvent) {
		this.$.initText.setContent('Fetching Document Details...')
		this.$.views.setShowing(false)
		this.$.init.show()
		this.myLibrary = []
		this.$.plugin.getLibrary()
	},
	
	failure: function(inMessage) {
		this.error(enyo.json.parse(inMessage.text).error)
		//this.$.mainSpinner.hide()
		this.$.init.hide()
	},
	
	preferences: function() {
		this.$.preferences.openAtTopCenter()	
	},
	
	account: function() {
    	this.$.client.account()
	},

	login: function(insender, e) {
		var windowObjectReference = window.open(this.$.newAccount.url, 'authorise')
	},
	
	confirmClick: function(insender, e) {
		this.$.newAccount.close()
		var response = this.$.plugin.authorize(this.$.pin.getValue())
		if (response.retVal == 0) {
			if (response.accessTokens)
				this.prefs.set('tokens', response.accessTokens)
		}
	},
	
	cancelClick: function(insender, e) {
		this.$.newAccount.close()
	},
	
	pluginReady: function(inSender) {
		this.createComponent({
			kind: 'Preferences',
			name: 'preferences',
			prefs: this.prefs
		})
		var tokens = this.prefs.get('tokens')
		var response = this.$.plugin.init(
			'http://www.mendeley.com/oauth/request_token',
			'http://www.mendeley.com/oauth/authorize',
			'http://www.mendeley.com/oauth/access_token',
			'991f431a0922ecc7c79d531b504c42df04e0e11a8',
			'805116556db48be9d91d2ac49b879aaa',
			tokens[0],
			tokens[1]
		)
		
		if (response.retVal == 0) {
			
			this.warn(this.$.plugin.mkdirs(this.prefs.get('libraryPath'),777))
			
			if (response.authorize) {
				this.warn(response.authorize)
				this.$.newAccount.setUrl(response.authorize)
				this.$.newAccount.openAtTopCenter()
			} else {
				//this.$.init.setShowing(false)
				this.$.views.setShowing(true)
				if (this.prefs.get('syncOnLaunch'))
					this.refreshView()
			}
		}
		//this.warn(this.$.plugin.)
		/*this.createComponent({
			kind: "Mendeley.Client",
			name: 'client',
			onOAuthReady: 'handleOAuthReady',
			onFailure: 'failure',
			prefs: this.prefs
		})*/
	},
	
	setLibrarySize: function(inSender, data) {
		this.libraryTotalResults = data
		this.warn(data)
	},
	
	pushDocument: function(inSender, data) {
		var data = enyo.json.parse(data)
		this.myLibrary.push(data)
		var info = 'Fetching Document ' + this.myLibrary.length + ' of ' + this.libraryTotalResults
		this.$.initText.setContent(info)
		if (this.myLibrary.length==this.libraryTotalResults) {
			this.myLibrary.sort(enyo.bind(this, 'sortByYear'))
			this.$.viewLibrary.data = this.myLibrary
			this.$.init.hide()
			this.$.views.setShowing(true)
			this.$.allDocuments.$.count.setContent(this.myLibrary.length)
			this.$.allDocuments.$.count.setShowing(true)
			this.$.viewLibrary.refresh()
		}
	}

})