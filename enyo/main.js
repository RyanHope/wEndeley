enyo.kind({
	
  	name: "Mendeley.Main",
  	kind: enyo.VFlexBox,
  	
  	oauth: null,
  	
  	prefs: new Prefs(),

	components: [
		{name: "consumerSecret", kind: "WebService", method: "GET", handleAs: "text",
   			onSuccess: "importConsumerSecret",
   			onFailure: "failure"
		},
		{kind: "AppMenu", components: [
	  		{caption: "Account", onclick: "account"},
		]},
		{kind: "Mendeley.Popup", name: 'newAccount', caption: 'Add Account', scrim: true, modal: true, autoClose: false, dismissWithClick: false, components: [
			{kind: '', components: [{content: 'Account'}]},
			{kind: "RowGroup", components: [
      			{kind: "Button", caption: "Log In and Get PIN", className: "myButton", onclick: "login"},
      			{kind: "Input", name: 'pin', hint: "Enter PIN", onchange: "inputChange"}
          	]},
          	{layoutKind: "HFlexLayout", pack: "center", components: [
            	{kind: "Button", caption: "Save", flex: 1, onclick: "confirmClick", className: 'enyo-button-affirmative'},
              	{kind: "Button", caption: "Cancel", flex: 1, onclick: "cancelClick"}
          	]}
      	]},
  		{kind: "Toolbar", name: 'toolbar', components: [
	      	{caption: "Dashboard", flex: 1, value: 'dashboard', toggling: true},
	      	{caption: "My Library", flex: 1, value: 'library', toggling: true},
	      	{caption: "Papers", flex: 1, value: 'papers', toggling: true},
	      	{caption: "Groups", flex: 1, value: 'groups', toggling: true},
	      	{caption: "People", flex: 1, value: 'people', toggling: true}
  		]},
  		{name: 'statusText', flex: 1}
	],
	
	initOAuth: function(secret) {
		this.warn(secret)
    	this.oauth = OAuth({
	        consumerKey: '991f431a0922ecc7c79d531b504c42df04e0e11a8',
	        consumerSecret: secret,
	        requestTokenUrl: 'http://www.mendeley.com/oauth/request_token',
	        accessTokenUrl: 'http://www.mendeley.com/oauth/access_token',
	        authorizationUrl: 'http://www.mendeley.com/oauth/authorize'
	    })
	    
	    var tokens = this.prefs.get('tokens')
	    if (tokens) {
		    this.oauth.setAccessToken([tokens.oauth_token,tokens.oauth_token_secret])
			this.getLibrary()
		} else {
			this.account()
		}
	},
	
	importConsumerSecret: function(inSender, inResponse) {
		this.initOAuth(inResponse)
	},
	
	initComponents: function() {
		this.inherited(arguments)
		this.$.consumerSecret.setUrl(enyo.fetchAppRootPath() + "mendeley.pk1");
		this.$.consumerSecret.call();
	},
	
	login: function(insender, e) {
    	this.oauth.fetchRequestToken(enyo.bind(this,'request'),enyo.bind(this,'failure'))
	},
	
	confirmClick: function(insender, e) {
		this.oauth.setVerifier(this.$.pin.getValue())
		this.oauth.fetchAccessToken(enyo.bind(this,'access'),enyo.bind(this,'failure'))
	},
	
	cancelClick: function(insender, e) {
		this.$.newAccount.close()
	},

	myGroupClick: function(inSender, e) {
  		this.$.statusText.setContent("Current selection: " + inSender.getValue())
	},

	access: function(data) {
		this.$.newAccount.close()
		var tokens = this.oauth.parseTokenRequest(data.text)
		this.warn(tokens)
		this.prefs.set('tokens', tokens)
		this.oauth.get('http://api.mendeley.com/oapi/library',enyo.bind(this,'library'),enyo.bind(this,'failure'))
	},

	request: function(url) {
		var windowObjectReference = window.open(url, 'authorise')
	},
	
	library: function(data) {
		this.$.statusText.setContent(enyo.json.stringify(data))
	},	
	
	getLibrary: function() {
		this.oauth.get('http://api.mendeley.com/oapi/library',enyo.bind(this,'library'),enyo.bind(this,'failure'))
	},
	
	failure: function(data) {
		this.error(data)
	},	
	
	account: function() {
    	this.$.newAccount.openAtTopCenter()
	}
	
})