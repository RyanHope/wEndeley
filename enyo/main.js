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
  			//className: 'enyo-toolbar-light',
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
				{
					kind: "Scrim",
					layoutKind: "VFlexLayout",
					align: "center", pack: "center",
					components: [
						{kind: "SpinnerLarge", name: 'mainSpinner'}
					]
				}
			]
		},
		{
			kind: 'Toolbar',
			name: 'bottom-bar',
			//className: 'enyo-toolbar-light',
			pack: "end",
			components: [
				{
					kind: 'Button',
					caption: 'Details',
					//showing: false
				},
			]
		}
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
	
	sortByYear: function(a, b) {
		if (!a.year && !b.year)
			return 0
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
				return 0			
	},
	
	document: function(data) {
		this.$.viewLibrary.data.push(enyo.json.parse(data.text))
		if (this.$.viewLibrary.data.length==106) {
			this.$.viewLibrary.data.sort(this.sortByYear)
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