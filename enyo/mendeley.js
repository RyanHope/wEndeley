enyo.kind({
	
	name: 'Mendeley.Client',
	kind: enyo.Control,
	
	oauth: null,
	
	published: {
		prefs: null
	},
	
	events: {
		onOAuthReady: '',
		onFailure: ''
	},
		
	components: [
		{
			name: "consumerSecret",
			kind: "WebService",
			method: "GET",
			handleAs: "text",
   			onSuccess: "importConsumerSecret",
   			onFailure: "failure"
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
  		}
	],
	
	initComponents: function() {
		this.inherited(arguments)
		this.$.consumerSecret.setUrl(enyo.fetchAppRootPath() + "mendeley.pk1");
		this.$.consumerSecret.call();
	},
	
	failure: function(inMessage) {
		this.doFailure(inMessage)
	},
	
	initOAuth: function(secret) {
    	this.oauth = OAuth({
	        consumerKey: '991f431a0922ecc7c79d531b504c42df04e0e11a8',
	        consumerSecret: secret,
	        requestTokenUrl: 'http://www.mendeley.com/oauth/request_token',
	        accessTokenUrl: 'http://www.mendeley.com/oauth/access_token',
	        authorizationUrl: 'http://www.mendeley.com/oauth/authorize'
	    })
	    
	    var tokens = this.prefs.get('tokens')
	    if (tokens==null) {
			this.doOAuthReady(false)
		} else {
			this.oauth.setAccessToken([tokens.oauth_token,tokens.oauth_token_secret])
			this.doOAuthReady(true)
		}
	},
	
	importConsumerSecret: function(inSender, inResponse) {
		this.initOAuth(inResponse)
	},
	
	access: function(data) {
		this.$.newAccount.close()
		var tokens = this.oauth.parseTokenRequest(data.text)
		this.warn(tokens)
		this.prefs.set('tokens', tokens)
		this.doOAuthReady(true)
	},

	request: function(url) {
		var windowObjectReference = window.open(url, 'authorise')
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

	account: function() {
    	this.$.newAccount.openAtTopCenter()
	},
	
	getLibrary: function(success, failure, page) {
		this.oauth.get('http://api.mendeley.com/oapi/library?page='+page, success, failure)
	},
	
	getDocument: function(id, success, failure) {
		this.oauth.get('http://api.mendeley.com/oapi/library/documents/'+id, success, failure)
	},
	
	getFile: function(id, hash, success, failure) {
		this.oauth.get('http://api.mendeley.com/oapi/library/documents/'+id+'/file/'+hash, success, failure)
	}
	
})