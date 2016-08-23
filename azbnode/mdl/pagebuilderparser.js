module.exports = {
	regexp : {
		//base : new RegExp(/\[snp+\s+tpl="([^"]+)"+\s+class="([^"]+)"+\s+html="([^"]+)"+\s+\]/ig),
		base : new RegExp(/\[snp+\s+tpl="([^"=]+)"+([^\]]+)+\]/ig),
		//by_param : new RegExp(/\s+(\w="\w")+\s/ig),
		//by_value : new RegExp(/\s+([^=]+)="([^"]+)"/ig),
		by_param : new RegExp(/([^"=\s]+="[^"]+")/ig),
		by_value : new RegExp(/([^"=\s]+)([^"=]+)/ig),
	},
	cfg : {},
	
	name : 'AzbNodePageBuilderParser',
	tag : 'AzbNodePageBuilderParser',
	
	setCfg : function(azbn, cfg) {
		this.azbn = azbn;
		this.cfg = cfg;
		return this;
	},
	
	code : {
		less : [],
		js : [],
	},
	
	getFileName : function(file) {
		return this.cfg.path.app + '/' + file + this.cfg.ext;
	},
	
	getJSFileName : function(file) {
		return this.cfg.path.app + '/' + file + '/.js';
	},
	
	getLESSFileName : function(file) {
		return this.cfg.path.app + '/' + file + '/.less';
	},
	
	getSnippetCode : function(file, prm_str) {
		var code = {
			html : '',
			less : [],
			js : [],
		};
		prm_str = prm_str || '';
		var file_handle = this.azbn.mdl('fs').openSync(this.getFileName(file), 'r', 0644);
		code.html = this.azbn.mdl('fs').readSync(file_handle, 10240, null, 'utf8')[0];
		code.html = code.html.replace(this.regexp.base, this.basereplacer);
		
		if(!this.cfg.not_load_other) {
			var file_handle = this.azbn.mdl('fs').openSync(this.getLESSFileName(file), 'r', 0644);
			this.code.less.push(this.azbn.mdl('fs').readSync(file_handle, 10240, null, 'utf8')[0]);
			
			var file_handle = this.azbn.mdl('fs').openSync(this.getJSFileName(file), 'r', 0644);
			this.code.js.push(this.azbn.mdl('fs').readSync(file_handle, 10240, null, 'utf8')[0]);
		}
		
		module.exports.azbn.echo('Load ' + file, module.exports.tag);
		
		return code;
	},
	
	basereplacer : function(str, p1, p2, offset, s) {
		var code = module.exports.getSnippetCode(p1);
		var prm_str = p2.match(module.exports.regexp.by_param);
		//module.exports.azbn.echo(prm_str, module.exports.tag);
		for(var i in prm_str) {
			var s = prm_str[i];
			var prm = s.match(module.exports.regexp.by_value);
			//module.exports.azbn.echo(prm[0] + ' = ' + prm[1], module.exports.tag);
			code.html = code.html.replace(new RegExp("{" + prm[0] + "}", "ig"), prm[1]);
		}
		return code.html;
	},
	
};