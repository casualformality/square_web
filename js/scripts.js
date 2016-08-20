/**** Class Listings ****/
var Collection = function(title) {
  this.title = title;
  this.songs = [];
}

Collection.prototype.addSong = function(song) {
  if(song) {
    this.songs.push(song);
    updatePlaylist();
  }
}

Collection.prototype.removeSong = function(song) {
  var index = $.inArray(song, this.songs);
  if(index >= 0) {
    this.songs.splice(index, 1);
    updatePlaylist();
  }
}

Collection.prototype.clear = function() {
  this.songs = [];
}

var Song = function(file, name, length) {
  if(name === undefined) {
    this.file = file;
    this.title = file.name.replace(/(\.mp3$)|(\.wav$)/gi, "");
    this.loaded = true;
  } else {
    this.title = name;
    this.length = length;
    this.file = path;
    this.loaded = false;
  }
}

/**** Global Variables ****/
var collectionList = [];
var currentCollection;

/**** Initialization ****/
$(document).ready(function() {
  // Initialize radio button
  var radios = $('input[name="tab-group"]');
  if(radios.is(':checked') === false) {
    radios.filter('[value=playlist]').prop('checked', true);
    $('#collections').hide();
  }

  $('#rem-col-btn').prop('disabled', true);

  currentCollection = new Collection("All Music");
  collectionList.push(currentCollection);
  updateCollections();
  updatePlaylist();
});

/**** Tab Switching ****/
$(function() {
  $('input[name="tab-group"]').change(function() {
    var selected = $('input[name="tab-group"]:checked').attr('id');
    
    if(selected == "playlist-tab") {
      $('#playlist').show();
      $('#collections').hide();
    } else {
      $('#playlist').hide();
      $('#collections').show();
    }
  });
});

/***** File Transfer ****/
/* Song Drag-and-Drop */
$(function() {
  $('#playlist-list').on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.originalEvent.dataTransfer;
    var files = dt.files;
    for(var i = 0; i < files.length; i++) {
      if(! /^audio\//.test(files[i].type)) {
        $('#playlist-list').addClass('dragdisable');
        $('#playlist-list').prop('disabled', true);
        return;
      }
    }
    $('#playlist-list').addClass('dragenter');
  });

  $('#playlist-list').on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
  });

  $('#playlist-list').on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#playlist-list').removeClass('dragenter');
    $('#playlist-list').removeClass('dragdisable');
    $('#playlist-list').prop('disabled', false);
    
    dt = e.originalEvent.dataTransfer;
    var files = dt.files;
    loadSongs(files);
  });

  $('#playlist-list').on('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#playlist-list').removeClass('dragenter');
    $('#playlist-list').removeClass('dragdisable');
    $('#playlist-list').prop('disabled', false);
  });
});

/* Collections Drag-and-Drop */
$(function() {
  $('#collection-list').on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var dt = e.originalEvent.dataTransfer;
    var files = dt.files;
    for(var i = 0; i < files.length; i++) {
      if(! /^audio\//.test(files[i].type)) {
        $('#collection-list').addClass('dragdisable');
        $('#collection-list').prop('disabled', true);
        return;
      }
    }
    $('#collection-list').addClass('dragenter');
  });

  $('#collection-list').on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
  });

  $('#collection-list').on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#collection-list').removeClass('dragenter');
    $('#collection-list').removeClass('dragdisable');
    $('#collection-list').prop('disabled', false);
    
    dt = e.originalEvent.dataTransfer;
    var files = dt.files;
    loadPlaylists(files);
  });

  $('#collection-list').on('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();
     $('#collection-list').removeClass('dragenter');
    $('#collection-list').removeClass('dragdisable');
    $('#collection-list').prop('disabled', false);
  });
});

function loadSongs(files) {
  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    var musicType = /^audio\//;

    if(!musicType.test(file.type)) {
      continue;
    }

    var newSong = new Song(file);
    currentCollection.addSong(newSong);
  }
}

function loadPlaylists(files) {
  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    var playlistType = /^audio\/mpegurl$/;

    if(!playlistType.test(file.type)) {
      continue;
    }

    var reader = new FileReader();
    reader.addEventListener("load", function() {
      var title = file.name.replace(/\.m3u$/gi, "");
      parsePlaylist(title, reader.result);
    });
    
    if(file) {
      reader.readAsText(file);
    }
  }
}

function parsePlaylist(title, data) {
  var playlistType = /^audio\/mpegurl$/;
  var entryType = /^EXTINF.*/;

  var collection = new Collection(title);
  collectionList.push(collection);

  var entries = data.split('#');
  for(var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    if(!entryType.test(entry)) {
      continue;
    }

    var entryArr = entry.split(/[:,\n]/);
    var songLength = entryArr[1];
    var songName = entryArr[2];
    var songPath = entryArr[3];
    collection.addSong(new Song(songName, songLength, songPath));
  }

  updateCollections();
}

/**** Context Menus ****/
$(function() {
  var selectedIndex;

  $('#playlist-list').on('contextmenu', function(e) {
    // Clear playlist menu
    $('.playlistItem').remove();
    
    // Show menu
    $('#playlistMenu').css({
      display: 'block',
      left: e.pageX,
      top: e.pageY
    });
    selectedIndex = e.target.index;

    // Add "Add to ..." elements
    var collectionIndex = $.inArray(currentCollection, collectionList);
    $.each(collectionList, function(i) {
      if(i != collectionIndex) {
        var li = $('<li/>')
            .appendTo('#playlistMenuList')
            .addClass('playlistItem');
        var ref = $('<a/>')
            .attr('tabindex', '-1')
            .text(collectionList[i].title)
            .attr('href', '#')
            .addClass('playlistItemLink')
            .appendTo(li);
      }
    });
    
    $('.playlistItemLink').on('click', function() {
      var selectedTitle = this.text;
      var menuItems = $.grep(collectionList, function(el) {
          return el.title == selectedTitle;
      });
      menuItems[0].addSong(currentCollection.songs[selectedIndex]);
      hideContextMenu();
    });
    
    // Enable links
    $('#playlistMenu').prop('disabled', selectedIndex < 0);
    if(selectedIndex >= 0) {
      $('#playlist-list').prop('selectedIndex', selectedIndex);
      $('#playlistMenuList a').each(function() {
        $(this).removeClass('disabled-link');
      });
    } else {
      $('#playlistMenuList a').each(function(i) {
        $(this).addClass('disabled-link');
      });
    }
    return false;
  });

  $('#remSong').on('click', function() {
    hideContextMenu();
    currentCollection.songs.splice(selectedIndex, 1);
    updatePlaylist();
  });

  $('#playSong').on('click', function() {
    var song = currentCollection.songs[selectedIndex];
    $('#mp-title').html(song.title);
    Player.load(song.file, true);
    hideContextMenu();
  });

  $('body').on('click', function() {
    hideContextMenu();
  });

  function hideContextMenu() {
    $('#playlistMenu').hide();
  }
});

/**** List Update ****/
function updatePlaylist() {
  $('#playlist-list')
    .find('option')
    .remove()
    .end();

  $.each(currentCollection.songs, function(key, val) {
    $('#playlist-list')
      .append($('<option></option>')
        .attr('value', val.title)
        .text(val.title));
  });
}

function updateCollections() {
  $('#collection-list')
    .find('option')
    .remove()
    .end();

  $.each(collectionList, function(key, val) {
    $('#collection-list')
      .append($('<option></option>')
        .attr('value', val.title)
        .text(val.title));
  });
}

/**** List/Song Selection ****/
$(function() {
  $('#playlist-list').dblclick(function() {
    var song = currentCollection.songs[this.selectedIndex];
    $('#mp-title').html(song.title);
    Player.load(song.file, true);
  });

  $('#collection-list').dblclick(function() {
    currentCollection = collectionList[this.selectedIndex];
    updatePlaylist();
    $('#playlist-tab').click();
  });

  $('#collection-list').change(function() {
    var disableButton = $('#collection-list').prop('selectedIndex') < 0;
    $('#rem-col-btn').prop('disabled', disableButton);
    if(disableButton) {
      $('#rem-col-btn').addClass('disabled');
    } else {
      $('#rem-col-btn').removeClass('disabled');
    }
  });
});

/**** Reordering ****/
// TODO

/**** Button Handlers ****/
$(function() {
  $('#add-collection-btn').click(function() {
    addCollection();
  });

  $('#collection-title').keyup(function(e) {
    if(e.keyCode == 13) {
      $('#add-collection-btn').click();
    }
  });

  function addCollection() {
    var title = $('#collection-title').val();
    if(title && title != '') {
      collectionList.push(new Collection(title));
      updateCollections();
    }
  }
});

$(function() {
  $('#rem-col-btn').click(function() {
    var index = $('#collection-list').prop('selectedIndex');
    collectionList.splice(index, 1);
    updateCollections();
  });

  $('#load-col-btn').change(function() {
    var files = $('#load-col-btn').prop('files');
    loadPlaylists(files);
  });
});

$(function() {
  $('#load-play-btn').change(function() {
    var files = $('#load-play-btn').prop('files');
    loadSongs(files);
  });

  $('#clear-play-btn').click(function() {
    currentCollection.clear();
    updatePlaylist();
  });

//  $('#save-play-btn').
});

function loadFile() {

}

function savePlaylist() {

}

function clearPlaylist() {

}

function newCollection() {

}

function loadCollection() {

}

function removeCollection() {

}
