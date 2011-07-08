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
			kind: "RowGroup", caption: 'General', components: [
				{kind: "HFlexBox", align: "center", components: [
          			{content: "Sync Library On Launch", flex: 1},
          			{kind: "CheckBox", name: 'syncOnLaunch'}
      			]},
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
		this.$.libraryPath.setValue(this.prefs.get('libraryPath'))
		this.$.syncOnLaunch.setChecked(this.prefs.get('syncOnLaunch'))
	},
	
	closePrefs: function(inSender, inEvent) {
		this.prefs.set('libraryPath', this.$.libraryPath.value)
		this.prefs.set('syncOnLaunch', this.$.syncOnLaunch.checked)
		this.close()
	},

})