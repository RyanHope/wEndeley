enyo.kind({
	
	name: 'Mendeley.Plugin',
	kind: enyo.Control,
		
	events: {
		onPluginReady:'',
		onPushDocument:'',
		onSetLibrarySize:''
	},

	initComponents: function() {
		this.warn('Creating plugin')
		this.createComponent({
			name: 'plugin',
			kind: enyo.Hybrid,
			executable: 'plugin/mendeley',
			onPluginReady: 'pluginReady',
			onPluginConnected: 'pluginConnected',
			onPluginDisconnected: 'pluginDisconnected',
		})
	},
		
  	pluginReady: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ Mendeley Plugin Ready ~~~~~')
  		this.$.plugin.addCallback('pushDocument', enyo.bind(this, 'doPushDocument'), true)
  		this.$.plugin.addCallback('setLibrarySize', enyo.bind(this, 'doSetLibrarySize'))
  		this.doPluginReady()
  	},
  	pluginConnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ Mendeley Plugin Connected ~~~~~')
  	},
  	pluginDisconnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ Mendeley Plugin Disconnected ~~~~~')
  	},
  	
  	init: function(request_token_uri, authorize_token_uri, access_token_uri, req_c_key, req_c_secret, res_t_key, res_t_secret) {
		return enyo.json.parse(this.$.plugin.callPluginMethod('init', request_token_uri, authorize_token_uri, access_token_uri, req_c_key, req_c_secret, res_t_key, res_t_secret))
	},
	
	authorize: function(verifier) {
		return enyo.json.parse(this.$.plugin.callPluginMethod('authorize', verifier))
	},
	
	getLibrary: function() {
		return this.$.plugin.callPluginMethod('getLibrary')
	},

	mkdirs: function(path, mode) {
   		return this.$.plugin.callPluginMethod('mkdirs', path, mode)
  	},
  	
  	fetchFile: function(id, hash, path) {
   		return this.$.plugin.callPluginMethod('fetchFile', id, hash, path)
  	},
  	
  	deleteDocument: function(id) {
   		return this.$.plugin.callPluginMethod('deleteDocument', id)
  	},
  	
})