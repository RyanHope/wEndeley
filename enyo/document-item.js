enyo.kind({
	name: 'DocumentItem',
	kind: 'Item',
	layoutKind: 'HFlexLayout',
	tapHighlight: false,
	
	published: {
		rowIndex: -1,
	},
	
	events: {
		onDocClick: '',
		onFavClick: '',
		onReadClick: '',
		onPdfClick: ''
	},
	
	components: [
		{kind: 'VFlexBox', components: [
			{kind: "Spacer"},
			{name: 'fav', onclick: 'favClick', className: 'docIcon'},
			{name: 'read', onclick: 'readClick', className: 'docIcon middle'},
			{name: 'pdf', onclick: 'pdfClick', className: 'docIcon'},
			{kind: "Spacer"}
		]},
		{kind: 'VFlexBox', flex: 1, className: 'docInfo', onclick: 'docClick', components: [
			{name: 'title', style: 'font-size: 90%;	font-weight: bold;'},
			{name: 'authors', style: 'font-size: 80%;'},
			{kind: 'HFlexBox', components: [
				{name: 'pubOutlet', style: 'font-size: 80%; font-style: italic;'},
				{name: 'volume', style: 'font-size: 80%'},
				{name: 'issue', style: 'font-size: 80%'},
				{name: 'pages', style: 'font-size: 80%'},
			]}
		]}
	],
	
	favClick: function(inSender, inEvent) {
		this.doFavClick(inSender, inEvent)	
	},
	
	readClick: function(inSender, inEvent) {
		this.doReadClick(inSender, inEvent)	
	},
	
	pdfClick: function(inSender, inEvent) {
		this.doPdfClick(inSender, inEvent)	
	},
	
	docClick: function(inSender, inEvent) {
		this.doDocClick(inSender, inEvent)	
	}

})