

$('#min-btn').click(function() {
  remote.getCurrentWindow().minimize();
});

$('#max-btn').click(function() {
  if (!remote.getCurrentWindow().isMaximized()) {
    remote.getCurrentWindow().maximize();
  } else {
    remote.getCurrentWindow().unmaximize();
  }
});


$('#close-btn').click(function() {
  remote.getCurrentWindow().close();
});
