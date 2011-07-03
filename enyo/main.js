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
						{name: 'paper', kind: 'Item', style: 'font-size: 65%;'}
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
	
	setupRow: function(inSender, inMessage, inIndex) {
		this.$.paper.setContent(inMessage);
	},
	
	initComponents: function() {
		this.inherited(arguments)
		this.createComponent({
			kind: "Mendeley.Client",
			name: 'client',
			prefs: this.prefs,
			onOAuthReady: 'handleOAuthReady'
		})
	},

	myGroupClick: function(inSender, e) {
  		this.warn("Current selection: " + inSender.getValue())
  		this.$.viewPane.selectViewByName(inSender.getValue());
	},
	
	document: function(data) {
		this.$.viewLibrary.data.push(data.text)
		if (this.$.viewLibrary.data.length==106) {
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
	
	failure: function(data) {
		this.error(data)
	},	
	
	account: function() {
    	this.$.client.account()
	},
	
	handleOAuthReady: function(hasAccount) {
		if (hasAccount)
			this.getLibrary()
		else
			this.account()
	}
	
})