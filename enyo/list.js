enyo.kind({
	name: 'List2',
	kind: enyo.FlyweightList,
	
	published: {
		data: [],
	},
	pageSize: 50,
	
	setupRow: function(inSender, inIndex) {
		var record = this.fetch(inIndex);
		if (record) {
			this.doSetupRow(record, inIndex);
			return true;
		}
	},
	fetch: function(inRow) {
		if (this.data[inRow])
			return this.data[inRow];
		else
			return false;
	},
	rowToPage: function(inRowIndex) {
		return Math.floor(inRowIndex / this.pageSize);
	},
	
	reset: function() {
		var pageTop = this.rowToPage(this.top);
	},
	rewind: function() {
		enyo.FlyweightList.prototype.punt.call(this);
		this.refresh();
	},
	punt: function() {
		this.inherited(arguments);
		this.reset();
	},
	setSelected: function(inRowIndex) {
		if (this.selected != null) {
			this.data[this.selected.index]._selected = false	
		}
		this.selected = {id:this.data[inRowIndex]._id,index:inRowIndex}
		this.data[inRowIndex]._selected = true
	}
});
