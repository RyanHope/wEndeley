enyo.kind({
	name: 'DocumentItem',
	kind: 'SwipeableItem',
	layoutKind: 'HFlexLayout',
	tapHighlight: true,
	
	published: {
		rowIndex: -1,
	},
	
	components: [
		{kind: 'VFlexBox', components: [
			{kind: "Spacer"},
			{name: 'fav', className: 'docIcon'},
			{name: 'read', className: 'docIcon'},
			{name: 'pdf', className: 'docIcon'},
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
	]
	
})