enyo.kind({
	
	name: 'Mendeley.Plugin',
	kind: enyo.Control,
		
	events: {
		onPluginReady:''
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
  		this.doPluginReady()
  	},
  	pluginConnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ Mendeley Plugin Connected ~~~~~')
  	},
  	pluginDisconnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ Mendeley Plugin Disconnected ~~~~~')
  	},
  	
  	mkdirs: function(path, mode) {
  		return this.$.plugin.callPluginMethod('mkdirs', path, mode)
  	},
  	
  	sha1file: function(path) {
  		return this.$.plugin.callPluginMethod('sha1file', path)
  	},
  	
  	statfile: function(path) {
  		return this.$.plugin.callPluginMethod('statfile', path)
  	}
  	
})