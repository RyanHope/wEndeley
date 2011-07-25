enyo.kind({
	
  	name: "Mendeley.Main",
  	kind: enyo.HFlexBox,
  	className: 'main',
  	
  	prefs: new Prefs(),
  	
  	myLibrary: [],
  	myLibKeys: {},
  	  	
  	rightPaneLastViewed: 'detailsView',

	components: [
		{   kind: "DbService", dbKind: "us.ryanhope.mendeley.item:1", onFailure: "dbFailure",
			components: [
				{   name: "createKind",		method: "putKind",	onSuccess: "dbPutKindSuccess" },
				{	name: "removeKind",		method: "delKind", 	onSuccess: "dbDelKindSuccess" },
				{   name: "getDbDocs",  	method: "find",    	onSuccess: "dbGetSuccess" },
				{   name: "mergeDbDocs",  	method: "merge",	onSuccess: "dbMergeSuccess", onFailure: "dbMergeFailure" },
				{   name: "delDbDocs",  	method: "del",     	onSuccess: "dbDelSuccess" },
				{   name: "delALL",   		method: "find",    	onSuccess: "dbDelAllSuccess" },
				{   name: "getMyLib",	  	method: "find",    	onSuccess: "dbMyLibSuccess" },
			] 
		},
		{ name: 'appManager', kind: 'PalmService',
	      service: 'palm://com.palm.applicationManager', method: 'open'},
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
		  		{caption: "Clear Database", onclick: "cleardb"}
			]
		},
		{kind: "SlidingPane", name: 'views', flex: 1, showing: true, components: [
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
					{kind: "MendeleyDividerDrawer", caption: "My Library", name: 'mainList', className: 'main-list'},
					//{kind: "MendeleyDividerDrawer", caption: "Groups", name: 'groups', className: 'main-list'},
					/*{kind: "DividerDrawer", caption: "Trash", className: 'main-list', components: [
						{name: 'trash',  kind: 'DrawerItem', className: 'drawer-item first last', label: 'All Deleted Documents', icon: 'trash', disabled: true}
					]},*/
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
					kind: 'DbList',
					name: 'viewLibrary',
					flex:1,
					desc: true,
					height: '100%',
					onQuery: "listQuery",
					onSetupRow: 'setupRow',
					components: [
						{name: "divider", captureState: false, kind: "Divider", showing: false, caption: "Sometime"},
						{name: 'paper', kind: 'DocumentItem', onConfirm: "deleteItem", onclick: 'listItemClick', onmousehold: 'listItemHold'}
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
						{kind: "ListSelector", name: 'sorter', value: 1, onChange: "itemChanged", items: [
							{caption: "Sort by Year Descending", value: 1},
					        {caption: "Sort by Year Ascending", value: 2},
					        {caption: "Sort by Publication Outlet Descending", value: 3},
					        {caption: "Sort by Publication Outlet Ascending", value: 4}
					    ]},
					    {kind: "Spacer"}
					]
				}
	  		]},
	  		{name: "right", width: "27%", dismissible: true, showing: false, components: [
	  			/*{
					kind: 'Toolbar',
					name: 'right-bar-top',
					className: 'enyo-toolbar-light',
					components: [
						{kind: "RadioGroup", name: 'rightGroup', onclick: "myGroupClick", components: [
			        		{caption: "Details", value: "detailsView"},
			        		{caption: "Notes", value: "notesView"},
				      	]}
					]
				},*/
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
						//{kind: 'Button', disabled: true, content: 'Add Field'}
					]
				}
	  		]}
		]}
	],
	
	listQuery: function(inSender, inQuery) {
		var sort = this.prefs.get('sort')
		if (sort == 1 || sort == 2)
			inQuery.orderBy = "year"
		else if (sort == 3 || sort == 4)
			inQuery.orderBy = "publication_outlet"
		this.warn(inQuery)
		return this.$.getDbDocs.call({query: inQuery})
	},
	
	queryFail: function(inSender, inResponse) {
		this.error('query fail')
	},
	
	favClick: function(inSender, inEvent) {
		if (this.myLibrary[inSender.rowIndex]._isFavorite)
			this.myLibrary[inSender.rowIndex]._isFavorite = false
		else
			this.myLibrary[inSender.rowIndex]._isFavorite = true
		this.$.viewLibrary.data = this.myLibrary
		this.$.viewLibrary.refresh()
	},
	
	itemChanged: function(inSender, inValue) {
		if (inValue==1 || inValue==3)
			this.$.viewLibrary.setDesc(true)
		else if (inValue==2 || inValue==4)
			this.$.viewLibrary.setDesc(false)
		this.prefs.set('sort', inValue)
		this.$.viewLibrary.reset()
		this.$.viewLibrary.punt()
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
		for (var key in paper) {
			if (key == 'files')
				this.$.details.data.push([key,enyo.json.stringify(paper[key])])
			else
				this.$.details.data.push([key,paper[key]])
		}
		//this.$.rightGroup.setValue(this.rightPaneLastViewed)
		this.$.right.setShowing(true)
		this.$.details.refresh()
	},
	
	handleDocMenuTap: function(inSender, command) {
		var doc = this.$.viewLibrary.fetch(inSender.rowIndex)
		if (doc && doc._localFile) {
			if (command == 'openFile') {
				this.$.appManager.call( {                                    
		                'id': "com.quickoffice.ar",    
		                params: {                             
		                    target: doc._localFile
		                }                                               
		            }                                             
		        )
	        } else if (command == 'sendByEmail') {
	        	this.$.appManager.call( {                                    
		                'id': "com.palm.app.email",    
		                params: {
		                	summary: 'Here is a great paper!',
		                	text: 'I think you should read this paper. See attached.',
		                	attachments: [{
		                		fullPath: doc._localFile,
		                		mimeType: 'application/pdf'
		                	}]
		                }                                               
		            }                                             
		        )
	        }
        }
	},
	
	docMenuClosed: function(inSender, inEvent) {
		this.$.viewLibrary.refresh()
	},

	listItemHold: function(inSender, inEvent) {
		this.$.docMenu.setRowIndex(inEvent.rowIndex)
		this.$.docMenu.openAtEvent(inEvent)
		if (this.$.viewLibrary.data[inSender.rowIndex]._localFile) {
			this.$.docMenu.$.openFile.setDisabled(false)
			this.$.docMenu.$.sendByEmail.setDisabled(false)
		} else {
			this.$.docMenu.$.openFile.setDisabled(true)
			this.$.docMenu.$.sendByEmail.setDisabled(true)
		}
	},
	
	listItemClick: function(inSender, inEvent) {
		if (!this.$.docMenu.showing)
			this.showDetails(inSender.rowIndex)
	},
	
	getYearDivider: function(inMessage, inIndex) {
		var prev = this.$.viewLibrary.fetch(inIndex - 1)
		var next = this.$.viewLibrary.fetch(inIndex + 1)
		if (inIndex==0 && !inMessage.year) {
			this.$.divider.setShowing(true)
        	this.$.divider.setCaption('????')
        	this.$.divider.canGenerate = true
            this.$.paper.domStyles["border-top"] = "none"
		} else if (!prev || prev.year != inMessage.year) {
			this.$.divider.setShowing(true)
        	this.$.divider.setCaption(inMessage.year)
        	this.$.divider.canGenerate = true
            this.$.paper.domStyles["border-top"] = "none"
    	} else {
    		this.$.divider.canGenerate = false
    	}
    	if (!next || next.year != inMessage.year) {
    		this.$.paper.domStyles["border-bottom"] = "none"
    	}
	},
	
	getPubDivider: function(inMessage, inIndex) {
		var prev = this.$.viewLibrary.fetch(inIndex - 1)
		var next = this.$.viewLibrary.fetch(inIndex + 1)
		if (inIndex==0 && !inMessage.publication_outlet) {
			this.$.divider.setShowing(true)
        	this.$.divider.setCaption('????')
        	this.$.divider.canGenerate = true
            this.$.paper.domStyles["border-top"] = "none"
		} else if (!prev || prev.publication_outlet != inMessage.publication_outlet) {
			this.$.divider.setShowing(true)
        	this.$.divider.setCaption(inMessage.publication_outlet)
        	this.$.divider.canGenerate = true
            this.$.paper.domStyles["border-top"] = "none"
    	} else {
    		this.$.divider.canGenerate = false
    	}
    	if (!next || next.publication_outlet != inMessage.publication_outlet) {
    		this.$.paper.domStyles["border-bottom"] = "none"
    	}
	},
	
	setupRow: function(inSender, info, inIndex) {
		
		var sort = this.prefs.get('sort')
		if (sort == 1 || sort == 2)
			this.getYearDivider(info, inIndex)
		else if (sort == 3 || sort == 4)
			this.getPubDivider(info, inIndex)
		
		this.$.paper.rowIndex = inIndex

		if (info.title)
			this.$.paper.$.title.setContent(info.title)
		if (info.authors) {
			var authors = []
			for (var i in info.authors)
				authors.push(info.authors[i].surname+', '+info.authors[i].forename)
			this.$.paper.$.authors.setContent(authors.join('; '))
		}
		if (info.publication_outlet)
			this.$.paper.$.pubOutlet.setContent(info.publication_outlet)
		/*if (info.year) {
			this.$.paper.$.year.setContent('('+info.year+')')
			this.$.paper.$.year.addClass('smallLeftPad')
		}*/
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
		/*if (info.dateAccessed==null)
			this.$.paper.$.read.addClass('readNo')
		else
			this.$.paper.$.read.addClass('readYes')
		
		if (info._isFavorite) {
			this.$.paper.$.fav.removeClass('favNo')
			this.$.paper.$.fav.addClass('favYes')
		} else {
			this.$.paper.$.fav.removeClass('favYes')
			this.$.paper.$.fav.addClass('favNo')
		}*/

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
	
	getDocumentDetails: function(id) {
		this.$.plugin.getDocument(enyo.bind(this, 'details'), id)
	},
	
	showLibrary: function() {
		this.$.views.setShowing(true)
		this.$.viewLibrary.setShowing(true)
		this.$.viewLibrary.refresh()
	},

	refreshView: function(inSender, inEvent) {
		//this.$.initText.setContent('Fetching Document Details...')
		//this.$.views.setShowing(false)
		//this.$.init.show()
		this.myLibrary = []
		this.myLibKeys = {}
		//this.updateLibView(false)
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
	
	cleardb: function() {
		this.$.delALL.call()
	},

	login: function(insender, e) {
		var windowObjectReference = window.open(this.$.newAccount.url, 'authorise')
	},
	
	confirmClick: function(insender, e) {
		this.$.newAccount.close()
		var response = this.$.plugin.authorize(this.$.pin.getValue(),this.$.newAccount.key,this.$.newAccount.secret)
		this.warn(response)
		if (response.retVal == 0) {
			if (response.accessTokens) {
				this.prefs.set('tokens', response.accessTokens)
				this.accountReady()
			} 
		} else {
			this.$.initSpinner.setShowing(false)
			this.$.initText.setContent('OAuth Verification Failed')
		}
	},
	
	cancelClick: function(insender, e) {
		this.$.newAccount.close()
		var tokens = this.prefs.get('tokens')
		if (tokens[0] && tokens[1]) {
			this.$.views.setShowing(true)
			this.$.init.setShowing(false)
		} else {
			this.$.initSpinner.setShowing(false)
			this.$.initText.setContent('No Configured Mendeley Account')
		}			
	},
	
	account: function() {
		var response = this.$.plugin.request()
		this.warn(response)
		if (response.retVal == 0 && response.url && response.key && response.secret)
			this.setupAccount(response.url, response.key, response.secret)
	},
	
	setupAccount: function(url,key,secret) {
		this.$.initText.setContent('Adding Mendeley Account...')
		this.$.initSpinner.setShowing(true)
		this.$.newAccount.setUrl(url)
		this.$.newAccount.setKey(key)
		this.$.newAccount.setSecret(secret)		
		this.$.newAccount.openAtTopCenter()
		this.$.pin.setValue('')
	},
	
	accountReady: function() {
		this.$.init.hide()
		//this.updateLibView(true)
		this.$.getMyLib.call()
		/*if (this.prefs.get('firstLaunch')) {
			this.warn('First Launch')
			this.prefs.set('firstLaunch', false)
			this.refreshView()
		} else if (this.prefs.get('syncOnLaunch')) {
			this.refreshView()
		} else {
			this.$.init.hide()
			this.showLibrary()
			this.updateLibView(true)
		}*/
	},	
	
	pluginReady: function(inSender) {
		this.createComponent({
			kind: 'Preferences',
			name: 'preferences',
			prefs: this.prefs
		})
		
		this.$.plugin.mkdirs(this.prefs.get('libraryPath'),777)
		
		this.myLibrary = this.prefs.get('library')
		this.myLibKeys = this.prefs.get('libraryKeys')
		this.$.viewLibrary.data = this.myLibrary
		
		var tokens = this.prefs.get('tokens')
		var response =  this.$.plugin.init(
			'http://www.mendeley.com/oauth/request_token',
			'http://www.mendeley.com/oauth/authorize',
			'http://www.mendeley.com/oauth/access_token',
			'991f431a0922ecc7c79d531b504c42df04e0e11a8',
			'805116556db48be9d91d2ac49b879aaa',
			tokens[0],
			tokens[1]
		)
		
		if (response.retVal == 0) {
			if (response.authorized) {
				this.accountReady()
			} else {
				var response = this.$.plugin.request()
				this.warn(response)
				if (response.retVal == 0 && response.url && response.key && response.secret)
					this.setupAccount(response.url, response.key, response.secret)
			}
		}

	},
	
	setLibrarySize: function(inSender, data) {
		this.libraryTotalResults = data
		this.warn(data)
	},

	updateLibView: function() {
		this.$.mainList.updateControls()
		/*this.$.groups.data = {}
		var groups = this.$.plugin.getGroups().response
		for (i in groups) {
			this.$.groups.data[groups[i].id] = {label: groups[i].name, count: groups[i].size, icon: 'group-folder'}
			this.warn(groups[i])
		}
		this.$.groups.data['create-group'] = {label: 'Create Group...'}
		this.$.groups.updateControls()*/
	},
	
  	filenameForReference : function(data, index) {

		var title = "[untitled]";
		if (data.title) {
	  		title = data.title.replace(/ /g,'_')
			if (title[title.length-1]=='.')
	    		title = title.substring(0, title.length-1)
		}

		var auth = ""
		if (data.authors && (data.authors.length > 0) && data.authors[0].surname) {
		  	var surname = data.authors[0].surname
		  	auth = surname
		}

		var year = ""
		if (data.year)
		  	year = data.year
  
		var path = ''
		if (index)
			path = auth + year + '-' + index + '__' + title
		else
			path = auth + year + '__' + title

		if (path.length>250)
		  path = path.substring(0,250)

		path = path.replace(/\W/g, "")

		path = this.prefs.get('libraryPath') + '/' + path + '.pdf'

    	return path
  	},

	pushDocument: function(inSender, data) {
    	var data = enyo.json.parse(data)
    	if (data.files && data.files.length>0) {
    		for (var i in data.files) {
    			var path = ''
    			if (data.files.length==1)
    				path = data['_localFile'] = this.filenameForReference(data, 0)
    			else
    				path = data['_localFile'] = this.filenameForReference(data, i+1)
				var checkResponse = this.$.plugin.checkFile(data.id, data.files[i].file_hash, path)
				if (checkResponse.retVal == 0)
        			this.$.plugin.fetchFile(data.id, data.files[i].file_hash, path)
    		}
    	}
		//this.myLibrary.push(data)
		this.$.mergeDbDocs.call({
			props: data,
			query: {
				"from": "us.ryanhope.mendeley.item:1",
				"where": [
					{"prop":"@type","op":"=","val":"libraryDoc"},
					{"prop":"id","op":"=","val":data.id},
				]
			}
		})
		//var info = 'Fetching Document ' + this.myLibrary.length + ' of ' + this.libraryTotalResults
		//this.$.initText.setContent(info)
		/*if (this.myLibrary.length==this.libraryTotalResults) {
			this.myLibrary.sort(enyo.bind(this, 'sortByYear'))
			for (i in this.myLibrary)
				this.myLibKeys[this.myLibrary.id] = i
			this.prefs.set('library',this.myLibrary)
			this.prefs.set('libraryKeys',this.myLibKeys)
			this.$.viewLibrary.data = this.myLibrary
			this.$.init.hide()
			this.showLibrary()
			this.updateLibView(true)
		}*/
	},
	deleteItem: function(inSender, inIndex) {
    	var response = this.$.plugin.deleteDocument(this.myLibrary[inIndex].id)
    	this.warn(response)
    	delete this.myLibKeys[this.myLibrary[inIndex].id]
   		this.myLibrary.splice(inIndex,1)
   		this.updateLibView()
	},
	
	dbPutKindSuccess: function(inSender, inResponse, inRequest) {
		//this.log("DB KIND CREATED - SUCCESS")
		//this.log(inSender)
		//this.log(inResponse)
		//this.$.getDbDocs.call()
	},
	dbDelKindSuccess: function(inSender, inResponse, inRequest) {
		//this.log("DB KIND DELETED - SUCCESS")
		//this.log(inSender)
		//this.log(inResponse)
	},
	dbFailure: function(inSender, inResponse, inRequest) {
		//this.log("DB ERROR - FAILURE")
		//this.log(inSender)
		//this.log(inResponse)
	},
	dbMyLibSuccess: function(inSender, inResponse, inRequest) {
		this.$.mainList.data.allDocuments.count = inResponse.results.length
		this.updateLibView() 
	},
	dbGetSuccess: function(inSender, inResponse, inRequest) {
		//this.log("DB GET - SUCCESS")
		//this.log(inSender)
		//this.log(inResponse)
		this.$.viewLibrary.queryResponse(inResponse, inRequest)
		//this.error(inResponse.results.length)
	},
	dbMergeSuccess: function(inSender, inResponse, inRequest) {
		//this.log("DB MERGE - SUCCESS")
		//this.log(inResponse)
		if (inResponse.count==0) {
			this.$.mergeDbDocs.call({'objects': [this.formatKind('libraryDoc', inRequest.params.props)]})
		} else {
			this.$.viewLibrary.reset()
			this.$.getMyLib.call()
		}
	},
	dbMergeFailure: function(inSender, inResponse, inRequest) {
		//this.warn("DB MERGE - FAIL")
		//this.log(inSender)
		//this.log(inResponse)
		//this.log(inRequest.params.props)
		//this.$.mergeDbDocs.call({'objects': [this.formatKind('libraryDoc', inRequest.params.props)]})
	},
	dbDelSuccess: function(inSender, inResponse, inRequest) {
		//this.log("DB DEL - SUCCESS")
		//this.log(inSender)
		//this.log(inResponse)
	},
	dbDelAllSuccess: function(inSender, inResponse, inRequest) {
		for (var i in inResponse.results) {
			this.error(inResponse.results[i]._id)
			this.$.delDbDocs.call({ids: [inResponse.results[i]._id], purge: true})
		}
		this.$.viewLibrary.reset()
	},	
	create: function() {
		/*
		 * Types:
		 *   libraryDoc - A document in the main library
		 *   folderDoc  - A document in a library folder
		 *   groupDoc   - A document in a library group
		 *   folder     - A folder
		 *   group      - A group
		 */
		this.inherited(arguments)
		this.$.createKind.call({
			owner: "us.ryanhope.mendeley",
			id: "us.ryanhope.mendeley.item:1",
			indexes: [
				{"name": "default", props: [{"name":"@type"},{"name":"id"}]},
				{"name": "byYear", props: [{"name":"year"},{"name":"publication_outlet"},{"name":"@type"},{"name":"id"}]},
				{"name": "byPubOutlet", props: [{"name":"publication_outlet"},{"name":"year"},{"name":"@type"},{"name":"id"}]}
			]
		})
	},
	initComponents: function() {
		this.inherited(arguments)
		var sort = this.prefs.get('sort')
		this.$.sorter.setValue(sort)
		this.itemChanged(null, sort)
		this.$.mainList.data = {
			allDocuments: {label: 'All Documents', icon: 'all-documents', count: 0},
			createFolder: {label: 'Create Folder...'}
		}
		this.updateLibView()
	},
	formatKind: function(type, data) {
		data['_kind'] = this.$.dbService.dbKind
		data['@type'] = type
		return data
	}

})
