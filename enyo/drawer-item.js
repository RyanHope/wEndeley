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
		{name: 'icon', className: 'icon'},//style: 'background-image: url(images/all-documents.png); background-position: left center; background-repeat: no-repeat;'
		{name: 'text', flex: 1, style: 'padding-left:22px; font-size: 90%;'},
	],
	
	rendered: function() {
		this.$.icon.addClass(this.icon);
		this.$.text.setContent(this.label);
	},
	
});