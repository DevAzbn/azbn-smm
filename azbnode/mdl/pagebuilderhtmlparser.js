module.exports = {
	regexp : {
		base : new RegExp(/\[snp+\s+tpl="([^"=]+)"+([^\]]+)+\]/ig),
		by_inject : '{__inject}',
		by_param : new RegExp(/([^"=\s]+="[^"]+")/ig),
		by_value : new RegExp(/([^"=\s]+)([^"=]+)/ig),
	},
	cfg : {},
	
	name : 'AzbNodePageBuilderHtmlParser',
	tag : 'AzbNodePageBuilderHtmlParser',
	
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
		return this.cfg.path.html_root + '/' + file + this.cfg.ext;
	},
	
	getSnippetCode : function(file, inject, prm_str) {
		var code = {
			html : '',
			less : [],
			js : [],
		};
		prm_str = prm_str || '';
		var file_handle = this.azbn.mdl('fs').openSync(this.getFileName(file), 'r', 0644);
		code.html = this.azbn.mdl('fs').readSync(file_handle, 10240, null, 'utf8')[0];
		this.azbn.mdl('fs').close(file_handle);
		code.html = code.html.replace(this.regexp.base, this.basereplacer);
		
		if(inject) {
			code.html = code.html.replace(module.exports.regexp.by_inject, inject);
		}
		
		module.exports.azbn.echo('Load ' + file, module.exports.tag);
		
		return code;
	},
	
	basereplacer : function(str, p1, p2, offset, s) {
		var code = module.exports.getSnippetCode(p1);
		var prm_str = p2.match(module.exports.regexp.by_param);
		for(var i in prm_str) {
			var s = prm_str[i];
			var prm = s.match(module.exports.regexp.by_value);
			code.html = code.html.replace(new RegExp("{" + prm[0] + "}", "ig"), prm[1]);
		}
		return code.html;
	},
	
};