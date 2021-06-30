function ToggleExtInstruments(enable) {
	log("toggling ext instruments");
	iterate(enable);
	log("completed");
}

function iterate(enable) {
	var apiSet = new LiveAPI("live_set");
	var trackCount = apiSet.getcount("tracks");
	for (var i = 0; i < trackCount; ++i) {
		var apiTrack = new LiveAPI(buildPath(i));
		var deviceCount = apiTrack.getcount("devices");
		for (var j = 0; j < deviceCount; ++j) {
			var apiDevice = new LiveAPI(buildPath(i, j));
			var deviceType = apiDevice.get("type");
			if (deviceType != 1) continue; // 1 = instrument

			var deviceClassName = apiDevice.get("class_name");
			if (deviceClassName != "ProxyInstrumentDevice") continue;

			var parameterCount = apiDevice.getcount("parameters");
			for (var k = 0; k < parameterCount; ++k) {
				var apiParameter = new LiveAPI(buildPath(i, j, k));
				var parameterName = apiParameter.get("name");
				if (parameterName != "Device On") continue;

				if (enable) apiParameter.set("value", 1);
				else apiParameter.set("value", 0);
			}
		}
	}
}

function buildPath() {
	var path = "live_set";
	if (arguments.length >= 1) {
		path += " tracks " + arguments[0];
	}
	if (arguments.length >= 2) {
		path += " devices " + arguments[1];
	}
	if (arguments.length >= 3) {
		path += " parameters " + arguments[2];
	}

	log(path);
	return path;
}

var loggingEnabled = true;
function log() {
	if (!loggingEnabled) return;

	var log_statement = "";
	for (var i = 0; i < arguments.length; ++i) {
		log_statement = log_statement + " " + arguments[i];
	}

	post(log_statement, "\n");
}