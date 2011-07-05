enyo.kind({
	name: 'DocumentItem',
	kind: 'Item',
	layoutKind: 'HFlexLayout',
	tapHighlight: false,
	
	published: {
		rowIndex: -1
	},
	
	events: {
		onDocClick: ''
	},
	
	components: [
		{kind: 'VFlexBox', pack: 'middle', components: [
			{name: 'fav', className: 'docIcon favNo'},
			{name: 'read', className: 'docIcon middle'},
			{name: 'pdf', className: 'docIcon'}
		]},
		{kind: 'VFlexBox', pack: 'middle', flex: 1, className: 'docInfo', onclick: 'docClick', components: [
			{name: 'title', style: 'font-size: 90%;	font-weight: bold;'},
			{name: 'authors', style: 'font-size: 80%;'},
			{kind: 'HFlexBox', components: [
				{name: 'pubOutlet', style: 'font-size: 80%; font-style: italic;'},
				{name: 'volume', style: 'font-size: 80%'},
				{name: 'issue', style: 'font-size: 80%'},
				{name: 'pages', style: 'font-size: 80%'},
			]}
		]}
		//{name: 'text', flex: 1, style: '; font-size: 65%;', allowHtml: true},
	],
	
	docClick: function(inSender, inEvent) {
		this.doDocClick(inSender, inEvent)	
	}

})