enyo.kind({
	
	kind: "Menu",
	name: 'DocMenu',
	
	published: {
		rowIndex: -1
	},
	
	events: {
		onTap: ''
	},
	
	components: [
		{caption: "Open File", name: 'openFile', onclick: 'handleDocMenu', disabled: false},
	  	{caption: "Add to Favorites", name: 'addFav', onclick: 'handleDocMenu', disabled: true},
	  	{caption: "Mark as Read", name: 'markRead', onclick: 'handleDocMenu', disabled: true},
	  	{caption: "Copy Citation", name: 'copyCitation', onclick: 'handleDocMenu', disabled: true},
	  	{caption: "Send by Email", name: 'sendByEmail', onclick: 'handleDocMenu', disabled: true}
	],
	
	handleDocMenu: function(inSender, inMessage) {
		this.doTap(inSender.name)
	}
	
})