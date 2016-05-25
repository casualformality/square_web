var musicPlayer;
var collectionList = [];

var selectedCollection;
var allSongsCollection;
var selectedFolder;

/******************************/
/****** Class Definitions *****/
/******************************/

function Collection(collectionName) {
	this.name = collectionName;
	this.songs = [];
}

function Song(filename) {
	this.file = filename;
	this.title = filename.replace(/\.mp3|.*\//gi, "");
}

/******************************/
/******* Model Functions ******/
/******************************/
function addFileToCollection(filename, collection) {
	if(!filename || !collection) {
		alert("Invalid selection");
		return;
	}

	var newFile = new Song(filename);
	collection.songs.push(newFile);
	updateSongList();
}

function removeFileFromCollection(file, collection) {
	var index = jQuery.inArray(file, collection);
	if(index < 0) {
		alert("Invalid file");
		return;
	}

	collection.splice(index, 1);
	updateSongList();
}

function addCollection(collectionName) {
 	if(!collectionName || collectionName == "") {
 		alert("Invalid collection name");
 		return null;
 	}

 	var newCollection = new Collection(collectionName);
 	
 	collectionList.push(newCollection);
 	selectedCollection = newCollection;

 	updateCollectionList();
 	updateSongList();

 	return newCollection;
}

function removeCollection(collection) {
	var index = jQuery.inArray(collection, collectionList);
	if(index < 0 || collection == allSongsCollection) {
		alert("Invalid collection");
		return;
	}

	collectionList.splice(index, 1);

	updateCollectionList();
	if(collection == selectedCollection) {
		selectedCollection = null;
		updateSongList();
	}
}

function selectCollection(collection) {
	updateSongList();
}

function selectSong(song) {
	//musicPlayer.select(file);
}

function devInit() {
	allSongsCollection = addCollection("All Music");
	addFileToCollection("foo/tmpfile1.mp3", allSongsCollection);
	addFileToCollection("foo/tmpfile2.mp3", allSongsCollection);
	addFileToCollection("foo/tmpfile3.mp3", allSongsCollection);

  updateFolderList();
}

/******************************/
/******* View Functions *******/
/******************************/

function updateCollectionList() {
  $('#collection-list')
    .find('option')
    .remove()
    .end()
  ;

  $.each(collectionList, function(key,val) {
      $('#collection-list')
        .append($("<option></option>")
          .attr("value",val.name)
          .text(val.name));
  });
}

function updateFolderList() {
  var folderListElement = document.getElementById("folder-list");

  // Ugly code to parse paths correctly
  if(selectedFolder) {
    var selectedFile = folderListElement.value;
    if(selectedFile == "..") {
      var path = selectedFolder.split("/");
      path.pop();
      selectedFolder = path.join("/");

      if(selectedFolder == "") {
        selectedFolder = "/";
        return;
      }
    } else if(selectedFile == ".") {
      return;
    } else {
      selectedFolder += "/" + folderListElement.value;
    }
  } else {
    selectedFolder = "/";
  }
  console.log(selectedFolder);

  /** Begin POST **/
  $.post(
    "php/dirlist.php", 
    {path: selectedFolder}
  )

  // Show new listing on success
  .done(function(data) {
    var dirlist = JSON.parse(data);

    $('#folder-list')
      .find('option')
      .remove()
      .end()
    ;

    $.each(dirlist, function(key,val) {
        $('#folder-list')
          .append($("<option></option>")
            .attr("value",val)
            .text(val));
    });
  })

  // Alert on failure
  .fail(function() {
    window.alert("Request failed");
  });
  /** End POST **/
}

function updateSongList() {
	// Clear current song list
	var songListElement = document.getElementById("song-list");
	for (a in songListElement.options) { 
		songListElement.options.remove(0);
	}

	// Populate song list from collection
	var collectionListElement = document.getElementById("collection-list");
	var selectedCollectionIdx = collectionListElement.selectedIndex;
	if(selectedCollectionIdx >= 0) {
		selectedCollection = collectionList[selectedCollectionIdx];
		for (s in selectedCollection.songs) {
			var opt = document.createElement('option');
			opt.appendChild( document.createTextNode(
					selectedCollection.songs[s].title) );
			songListElement.appendChild(opt);
		}
	} else {
		selectedCollection = null;
	}
}

function selectedSongChanged(songListElement) {
	var element = document.getElementById("mp-title");
	var index = songListElement.selectedIndex;
	var selectedSong;

	if(index >= 0) {
		element.innerHTML = songListElement.options[index].text;
		selectedSong = selectedCollection.songs[index];
	} else {
		element.innerHTML = "No song selected.";
		selectedSong = null;
	}
	selectSong(selectedSong);
}

/******************************/
/**** Controller Functions ****/
/******************************
musicPlayer.select = function(file) {
	document.getElementById("mp-title").innerHtml = file.title;
}
*/

