autowatch = 1
function ToggleExtInstruments(enable) {
	log("toggling ext instruments");
	evaluateSet(enable);
	log("completed");
}

function evaluateSet(enable) {
	var apiSet = new LiveAPI("live_set");
	var trackCount = apiSet.getcount("tracks");
	for (var i = 0; i < trackCount; ++i) {
		var apiTrack = getAPI(apiSet, "tracks", i);
		evaluateTrack(apiTrack, enable);
	}
}

function evaluateTrack(apiTrack, enable) {
	var deviceCount = apiTrack.getcount("devices");
	for (var j = 0; j < deviceCount; ++j) {
		var apiDevice = getAPI(apiTrack, "devices", j);
		evaluateDevice(apiDevice, enable);
	}
}

function evaluateChain(apiChain, enable) {
	var deviceCount = apiChain.getcount("devices");
	for (var j = 0; j < deviceCount; ++j) {
		var apiDevice = getAPI(apiChain, "devices", j);
		evaluateDevice(apiDevice, enable);
	}
}

function evaluateDevice(apiDevice, enable) {
	var canChain = apiDevice.get("can_have_chains");
	if (canChain == 1) {
		var chainCount = apiDevice.getcount("chains");
		for (var i = 0; i < chainCount; ++i) {
			var apiChain = getAPI(apiDevice, "chains", i);
			evaluateChain(apiChain, enable);
		}
		return;
	}

	var deviceType = apiDevice.get("type");
	if (deviceType != 1) return; // 1 = instrument

	var deviceClassName = apiDevice.get("class_name");
	if (deviceClassName != "ProxyInstrumentDevice") return;

	var parameterCount = apiDevice.getcount("parameters");
	for (var i = 0; i < parameterCount; ++i) {
		var apiParameter = getAPI(apiDevice, "parameters", i);
		evaluateParameter(apiParameter, enable);
	}
}

function evaluateParameter(apiParameter, enable) {
	var parameterName = apiParameter.get("name");
	if (parameterName != "Device On") return;

	if (enable) {
		log("enabled", apiParameter.path)
		apiParameter.set("value", 1);
	}
	else {
		log("disabled", apiParameter.path)
		apiParameter.set("value", 0);
	}
}

function getAPI(currentApi, property, id) {
	var currentPath = dequote(currentApi.path);
	var path = currentPath + " " + property + " " + id;
	return new LiveAPI(path);
}

function dequote(path) {
	return path.replace(/"/g, "")
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