module.exports = function(ctx) {
	console.log('intent plugin hook execute...')
	var fs = ctx.requireCordovaModule('fs'),
		deferral = ctx.requireCordovaModule('q').defer();

	//使应用可处理分享
	var filepath = 'platforms/android/AndroidManifest.xml';
	fs.readFile(filepath, function(err, data) {
		if (err) {
			deferral.reject(err);
		} else {
			var con = data.toString();
			if (ctx.hook == 'before_plugin_install' || ctx.hook == 'before_build') {
				if (con.indexOf('android.intent.action.SEND') == -1 && con.indexOf('android.intent.action.SEND_MULTIPLE') == -1 ) {
					var insert =
						"            <intent-filter>\n" +
						"                <action android:name='android.intent.action.SEND' />\n" +
						"                <action android:name='android.intent.action.SEND_MULTIPLE'/>\n" +
						"                <category android:name='android.intent.category.DEFAULT' />\n" +
						"               <data android:mimeType='*/*' />\n" +
						"            </intent-filter>\n";
					con = con.replace(/(<category\s+android:name="android\.intent\.category\.LAUNCHER"\s*\/>\s*<\/intent-filter>\n)(\s*<\/activity>)/, "$1" + insert + "$2");
					fs.writeFile(filepath, con, { flag: 'w+' }, function(err) {
						if (err) {
							deferral.reject(err);
						} else {
							deferral.resolve();
						}
					});
				} else {
					if(ctx.hook == 'before_plugin_install'){
						deferral.reject(new Error('There is already intent-filter with android.intent.action.SEND or android.intent.action.SEND_MULTIPLE existing.'));
					}else{
						deferral.resolve();
					}
				}
			} else if (ctx.hook == 'before_plugin_uninstall') {
				con = con.replace(/<intent-filter>[\sa-zA-Z:='"./<>_*]*<\/intent-filter>\n?/, '');
				fs.writeFile(filepath, con, { flag: 'w+' }, function(err) {
						if (err) {
							deferral.reject(err);
						} else {
							deferral.resolve();
						}
					});
			} else {
				deferral.resolve();
			}

		}
	});
	return deferral.promise;
}
