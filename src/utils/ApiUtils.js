/**
 * Utility classes that provided functionality that may/may not be
 * cross application applicable. This focuses on API specifically
 * @author Shahin Alam(shahin@uilicious.com)
 */
const request = require('request');
const url = require('url');
const program = require('commander');
const api = require('../utils/api');
/// Cached full host URL
var _fullHostURL = null;

class APIUtils {

	static requestErrorHandler(err) {
		console.log("FATAL ERROR >> ");
		console.log(err);
		process.exit(1);
	}

	/**
     * Makes a POST or GET request, with the given form object
     * and return its JSON result in a promise
     * @param method "POST" or "GET" method
     * @param url
     * @param data
     * @param callback
     * @return {Promise.<TResult>}
     */
	static rawRequestData(method, url, data) {

		// Option / parameter parsing
		var option = {
			url : url,
			method : method,
            jar : api._core.getCookieJar()
		};
		if ( method == "GET" ) {
			option.qs = data;
		} else {
			option.form = data;
		}

		// The actual API call, with promise object
		return new Promise(function(good, bad) {
			return request(option, function( err, res, body ) {
				if (err) {
					throw new Error("Unexpected error for URL request : " + url + " -> " + err);
					process.exit(1);
				} else {
					try {
						good(body);
						return;
					} catch(err) {
						throw new Error("Invalid data (JSON) format for URL request : " + url + " -> " + body);
                        process.exit(1);
					}
				}
			});
		});
	}

    /**
     * Makes a POST or GET request for test requests, with the given form object (strictly for test requests)
     * and return its JSON result in a promise
     * @param method
     * @param url
     * @param data
     * @param callback
     * @return {Promise.<TResult>}
     * @constructor
     */
	static TestRequestData(method, url, data) {

		// Option / parameter parsing
		var option = {
			url : url,
			method : method,
            jar : api._core.getCookieJar()
		};
		if ( method == "GET" || method == "POST") {
			option.form = data;
		}

		// The actual API call, with promise object
		return new Promise(function(good, bad) {
			return request(option, function( err, res, body ) {
				if (err) {
					throw new Error("Unexpected error for URL request : " + url + " -> " + err);
				} else {
					try {
						good(body);
						return;
					} catch(err) {
						throw new Error("Invalid data (JSON) format for URL request : " + url + " -> " + body);
					}
				}
			});
		});
	}


    /**
     * Makes a GET or POST request, with the given form object
     * and return its JSON result in a promise
     * @param method
     * @param url
     * @param inData
     * @param callback
     * @return {Promise.<TResult>}
     */
	static jsonRequest(method, url, inData) {
		// Calling rawRequest, and parsing the good result as JSON
		return new Promise(function(good, bad) {
			return APIUtils.rawRequestData(method, url, inData)
                .then(data => {
                    good(data);
                    return;
                })
                .catch(errors => bad(errors));
		});
	}

    /**
     * Debug the request and response
     * @param method
     * @param url
     * @param inData
     * @param callback
     * @return {Promise.<TResult>}
     * @constructor
     */
	static TestRequest(method, url, inData) {
		// Calling rawRequest, and parsing the good result as JSON
		return new Promise(function(good, bad) {
			return APIUtils.TestRequestData(method, url, inData)
                .then(data => {
                        good(data);
                        return;
                })
                .catch(errors => bad(errors));
		});
	}

    /**
     * Does a login check,set cookies and provides the actual server URL to call API
     * silently terminates, with an error message if it fails
     * @return {Promise}
     */
	static getFullHostURL() {

		if ( _fullHostURL != null ) {
		    return Promise.resolve(_fullHostURL);
		}
        return new Promise(function (good, bad) {
            if(program.user==null || program.pass==null){
                console.log("Error: username/password can not leave empty");
                process.exit(1);
            }
            if(program.apiHost!=null){
                let apiHost = program.apiHost;
                let pattern = /^((http|https):\/\/)/;
                if(!pattern.test(apiHost)) {
                    apiHost = "https://" + apiHost;
                }
                if (apiHost.substr(-1) != '/'){
                    apiHost += '/';
				}
                api._core.baseURL(apiHost);
            }
            else {
                api._core.baseURL("https://api.uilicious.com/");
            }
            return api.account.login({loginName:program.user, password: program.pass})
                .then(response =>{
                    return api.account.hostURL();
                })
                .then(data => {
                    var obj = JSON.parse(data);
                    if ( obj.result == false ) {
                        console.error("ERROR: Unable to login - Invalid username/password");
                        process.exit(1);
                    } else {
                        _fullHostURL = obj.result;
                        good(_fullHostURL);
                        return;
                    }
                })
                .catch(errors => bad("ERROR: an error occurred while processing the request"));
        });
    }

    /**
     * Does a JSON request to web-studio instance of the client
     * @param method
     * @param webPath
     * @param params
     * @param callback
     * @return {Promise.<TResult>}
     */
	static webstudioJsonRequest(method, webPath, params) {
		return new Promise(function(good, bad) {
			return APIUtils.getFullHostURL()
                .then(hostURL=> APIUtils.jsonRequest(method, hostURL+webPath, params))
                .then(response => {
                    good(response);
                    return;
                })
				.catch(errors => bad(errors));
		});
	}

    /**
     * Does a request to web-studio for test run
     * @param method
     * @param webPath
     * @param params
     * @return {Promise}
     */
	static webstudioTestRequest(method, webPath, params) {
		return new Promise(function(good, bad) {
			return APIUtils.getFullHostURL()
                .then(hostURL=> APIUtils.TestRequest(method, hostURL+webPath, params))
                .then(response => {
                    good(response);
                    return;
                })
                .catch(errors => bad(errors));
		});
	}

    /**
     * Does a RAW request to web-studio instance of the client
     * @param method
     * @param webPath
     * @param params
     * @return {Promise}
     */
	static webstudioRawRequest(method, webPath, params) {
		return new Promise(function(good, bad) {
			return APIUtils.getFullHostURL()
                .then(hostURL=> APIUtils.rawRequestData(method, hostURL+webPath, params))
                .then(data => {
                    good(data);
                    return;
                })
                .catch(errors => bad("ERROR: an error occurred while processing the request"));
		});
	}
}

module.exports = APIUtils;
