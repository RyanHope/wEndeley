enyo.kind({
			
	kind: 'Popup2',
	name: 'Preferences',
	scrim: true,
	modal: true,
	autoClose: false,
	dismissWithClick: false,
	width: "50%",
	
	published: {
		prefs: null
	},
	
	components: [
		{
			layoutKind: "HFlexLayout",
			pack: "center", 
			components: [
				{content: 'Preferences'}
			]
		},
		{
			kind: "RowGroup", caption: 'Library Path', components: [
				{
					kind: 'Input',
					name:'libraryPath',
					autoCapitalize: 'lowercase',
					autoWordComplete: false,
					autocorrect: false,
					spellcheck: false
				}
  			]
		},
  		{
  			layoutKind: "HFlexLayout",
  			pack: "center",
  			components: [
  				{kind: 'Spacer'},
      			{
      				kind: "Button",
      				caption: "Close",
      				flex: 1,
      				onclick: "closePrefs"
  				},
  				{kind: 'Spacer'}
  			]
		}
	],
	
	rendered: function() {
		var path = this.prefs.get('libraryPath')
		this.$.libraryPath.setValue(path?path:'/media/internal/Mendeley')
	},
	
	closePrefs: function(inSender, inEvent) {
		this.prefs.set('libraryPath', this.$.libraryPath.value)
		this.close()
	},

})