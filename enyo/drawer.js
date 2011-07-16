enyo.kind({
	name: 'MendeleyDrawer',
	kind: 'BasicDrawer',
	
	published: {
		data: {},
	},
	
	updateControls: function() {
		this.$.client.destroyControls()
		var keys = Object.keys(this.data)
		for (i in keys) {
			var className = 'drawer-item'
			if (i==0) className = className + ' first'
			if (i==keys.length-1) className = className + ' last'
			this.$.client.createComponent({
				kind: 'DrawerItem',
				name: keys[i],
				label: this.data[keys[i]].label,
				icon: this.data[keys[i]].icon,
				count: this.data[keys[i]].count,
				disabled: this.data[keys[i]].disabled,
				className: className,
				onclick: this.doClick
			})
		}
		this.render()
	}
	
})

enyo.kind({
	name: 'MendeleyDividerDrawer',
	kind: 'DividerDrawer',
	
	published: {
		data: {},
		caption: ''
	},
	
	events: {
		onClick: ''
	},
	
	chrome: [
		{name: "caption", kind: "enyo.Divider", caption: this.caption, onclick: "toggleOpen", components: [
            {name: "openButton", kind: "enyo.SwitchedButton", className: "enyo-collapsible-arrow"}
    	]},
    	{name: "client", kind: "MendeleyDrawer", onOpenChanged: "doOpenChanged", onOpenAnimationComplete: "doOpenAnimationComplete"}
	],
	
	updateControls: function() {
		this.$.client.data = this.data
		this.$.client.updateControls()
	},
	
	initComponents: function() {
		this.inherited(arguments)
		this.updateControls()
	}

})