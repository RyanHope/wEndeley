enyo.kind({
	name: 'DrawerItem',
	kind: 'Item',
	layoutKind: 'HFlexLayout',
	align: 'center',
	tapHighlight: true,
	
	published: {
		label: '',
		disabled: false
	},
	
	components: [
		{name: 'icon', className: 'icon'},
		{name: 'text', flex: 1, style: 'font-size: 90%;'},
	],
	
	rendered: function() {
		this.$.icon.addClass(this.icon)
		this.$.text.setContent(this.label)
	},
	
})