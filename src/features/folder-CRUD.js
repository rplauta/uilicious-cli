/**
 * folder class that provides functionality for CRUD operations
 * to be performed by the folder
 */


const APIUtils = require('./../api-utils');


class folderCRUD {

	/// Get a list of folders
///
/// @param  [Optional] Callback to return result, defaults to console.log
///
/// @return  Promise object, for result
	static folderList(projectID, callback) {
	return APIUtils.webstudioJsonRequest(
		"GET",
		"/api/studio/v1/projects/" + projectID + "/workspace/folders",
		{},
		callback
	);
}

// List all the folders
// silently terminates , with an error message if no project is present
	static folders(projectId, callback) {
	return new Promise(function(good,bad) {
		folderCRUD.folderList(projectId, function(list) {
			if(list != null) {
				for(let i = 0; i < list.length; i++) {
					let item = list[i];
					console.log(" * " + item.name);
				}
				console.log("");
			} else {
				console.error("ERROR: No folder is present.");
				process.exit(1);
			}
		});
	}).then(callback);
}

/// Check for duplicate Folder name
/// @param	Project ID
/// @param	Folder Name
	static checkFolder(projID, folderName, callback) {
	return new Promise(function(good, bad) {
		folderCRUD.folderList(projID, function(list) {
			for (let i = 0; i < list.length; i++) {
				let folder = list[i];
				if (folder.name == folderName) {
					console.error(error_warning("ERROR: This folder '" + folderName + "' exists.\nPlease use another name!\n"));
					process.exit(1);
				}
			}
			good(folderName);
			return;
		});
	}).then(callback);
}

/// Create a new folder using projectName
/// @param	Project ID from projectID()
	static createFolder(projectID, folderName, callback) {
	return APIUtils.webstudioRawRequest(
		"POST",
		"/api/studio/v1/projects/" + projectID + "/workspace/folders/addAction",
		{
			name: folderName
		},
		callback
	);
}

/// Create a new folder under another folder under the project using the nodeID and the projectName
/// @param projectID
/// @param nodeID
	static createFolderUnderFolder(projectID, nodeID, creatingfoldername, callback) {
	return APIUtils.webstudioRawRequest(
		"POST",
		"/api/studio/v1/projects/" + projectID + "/workspace/folders/addAction",
		{
			name: creatingfoldername,
			parentId: nodeID
		},
		callback
	);
}

/// Update a test/folder
/// @param	Project ID from projectID()
/// @param	Node ID from testID() or folderID()
/// @param  [Optional] Callback to return result
	static updateTestFolder(projectID, nodeID, new_Name, callback) {
	return APIUtils.webstudioRawRequest(
		"POST",
		"/api/studio/v1/projects/" + projectID + "/workspace/nodes/" + nodeID + "/renameAction",
		{
			name: new_Name
		},
		callback
	);
}

/// Delete a test/folder
/// @param	Project ID from projectID()
/// @param	Node ID from testID() of folderID()
/// @param  [Optional] Callback to return result
	static deleteTestFolder(projectID, nodeID, callback) {
	return APIUtils.webstudioRawRequest(
		"POST",
		"/api/studio/v1/projects/" + projectID + "/workspace/nodes/" + nodeID + "/deleteAction",
		{},
		callback
	);
}

/// Returns the folder ID (if found), given the project ID AND folder webPath
/// Also can be used to return node ID for folder
///
/// @param  Project ID
/// @param  Folder Name
/// @param  [Optional] Callback to return result
///
/// @return  Promise object, for result
	static folderID(projID, folderPath, callback) {
	return new Promise(function(good, bad) {
		APIUtils.webstudioJsonRequest(
			"GET",
			"/api/studio/v1/projects/" + projID + "/workspace/folders",
			{ path : folderPath },
			function(res) {
				// Prevent
				if (res.length > 1) {
					console.error("ERROR: Multiple folders named '" + folderPath + "' found.\nPlease give the correct name!\n");
					process.exit(1);
				} else {
					let id = res[0].id;
					good(parseInt(id));
					return;
				}
				console.error("ERROR: Unable to find folder: '" + folderPath + "'\n");
				process.exit(1);
			}
		);
	}).then(callback);
}

/// Returns the node ID (if found) , given the project ID and folderName
///@param projectID
///@param folderName
///@param [optional] callback to return the result
///
/// return promise object , for result
	static nodeID(projectId, folderName, callback) {
	return new Promise(function(good, bad) {
		folderCRUD.folderList(projectId, function(list) {
			for(let i = 0; i<list.length; ++i) {
				let item = list[i];
				if(item.name == folderName) {
					good(parseInt(item.id));
					return;
				}
			}
			console.error("ERROR: This folder <" + folderName + "> does not exist!");
			process.exit(1);
		});
	}).then(callback);
}

}


module.exports = folderCRUD;