<?php
  if( $_POST["path"] ) {
    $dir_list = scandir($_POST["path"]);
    echo json_encode($dir_list);
  } else {
    echo "invalid input";
  }

  exit();
?>
