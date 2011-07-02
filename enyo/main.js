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
		      		caption: "Dashboard",
		      		flex: 1,
		      		value: 'dashboard',
	      			toggling: true
      			},
		      	{
		      		caption: "My Library",
		      		flex: 1,
		      		value: 'library',
		      		toggling: true
	      		},
		      	{
		      		caption: "Papers",
		      		flex: 1,
		      		value: 'papers',
		      		toggling: true
	      		},
		      	{
		      		caption: "Groups",
		      		flex: 1,
		      		value: 'groups',
		      		toggling: true
	      		},
		      	{
		      		caption: "People",
		      		flex: 1,
		      		value: 'people',
		      		toggling: true
	      		}
  			]
		},
  		{
  			name: 'statusText',
  			flex: 1,
  			className: 'logo-large'
		}
	],
	
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
  		this.$.statusText.setContent("Current selection: " + inSender.getValue())
	},
	
	library: function(data) {
		this.$.statusText.setContent(enyo.json.stringify(data))
	},	
	
	getLibrary: function() {
		this.$.client.getLibrary(enyo.bind(this,'library'), enyo.bind(this,'failure'))
	},
	
	failure: function(data) {
		this.error(data)
	},	
	
	account: function() {
    	this.$.client.account()
	},
	
	handleOAuthReady: function(hasAccount) {
		this.warn("has accounbt: "+hasAccount)
		if (hasAccount)
			this.getLibrary()
		else
			this.account()
	}
	
})