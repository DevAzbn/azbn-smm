//var assert = require('assert');

module.exports = {
	
	tests : {
		
	},
	
	__point : function(obj) {
		if(typeof this.tests[obj.name] != 'undefined') {
			this.tests[obj.name].count++;
		} else {
			this.tests[obj.name] = {
				count : 1,
				history : {
					
				},
			}
		}
	},
	
	doTest : function(obj) {
		this.__point(obj);
		
		var result = obj.code();
		obj.action(result == obj.need, obj.need, result);
	},
	
	doTestStrict : function(obj) {
		this.__point(obj);
		
		var result = obj.code();
		obj.action(result === obj.need, obj.need, result);
	},
	
};