<?php
error_reporting(E_ALL);
/*
    main controller
*/
$storeFolder = getcwd(). "/images/";
$response = array();
$imageFilenamePrefix = "rsz_";

function store_file($temp_filename,$original_filename,$extra="") {
    global $storeFolder;
	global $imageFilenamePrefix;  
	$original_filename = $imageFilenamePrefix.$extra.$original_filename;
    move_uploaded_file ($temp_filename ,  $storeFolder.$original_filename );
}

function action_get_file($file) {
    print_r($file);
}

function getFolderContent($folder) {
    $files = array();
    if ($handle = opendir($folder)) {
    while (false !== ($entry = readdir($handle))) {
        if ($entry != "." && $entry != "..") {
            //echo "$entry\n";
            $files[] = "$folder/".$entry;
        }
    }
    closedir($handle);
    return $files;
    }
}

if($_POST && $_FILES) {
    $response[] = $_POST;
    $response[] = $_FILES;
    if(isset($_POST["image"])){
        file_put_contents($storeFolder."/"."file" .time(). ".jpg", $_POST["image"]);        
    }
    else if(isset($_FILES["resizedImage"])) {               
        $temp_filename = $_FILES["resizedImage"]["tmp_name"]; 
        $original_filename = $_FILES["resizedImage"]["name"]; 
        $palette = $_POST["palette"];
        $paletteString =  str_replace(",","-",$palette);
        $paletteString =  str_replace(" ","_",$paletteString);
        store_file($temp_filename,$original_filename,$paletteString);
    }
    echo json_encode($response);
}
elseif($_POST) {
    $response[] = $_POST;
    $response[] = $_FILES;
    if(isset($_POST["image"])){
        file_put_contents($storeFolder."/"."file" .time(). ".jpg", $_POST["image"]);        
    }
    elseif(isset($_FILES["resizedImage"])) {                   
        $temp_filename = $_FILES["resizedImage"]["tmp_name"]; 
        $original_filename = $_FILES["resizedImage"]["name"]; 
        store_file($temp_filename,$original_filename);
    }
    echo json_encode($response);
}
if($_GET) {
    $response[] = "Server response after GET :";
    echo json_encode($response);
} else if($_FILES) {
    //for filereader only, no trasformation on client side
    if (isset($_FILES["upload"])){
        $temp_filename = $_FILES["upload"]["tmp_name"]; 
        $original_filename = $_FILES["upload"]["name"]; 
    } else if (isset($_FILES["resizedImage"])){
        $temp_filename = $_FILES["resizedImage"]["tmp_name"]; 
        $original_filename = $_FILES["resizedImage"]["name"]; 
    }
    store_file($temp_filename,$original_filename);
    $response[] = $_FILES;
    echo  json_encode($response);
}
else {   
    $arrayOfImages = getFolderContent("images");
	if (count($arrayOfImages)==0) {
		echo "Nothing to see...";
	} else {		
		foreach ($arrayOfImages as $filename) {
			echo "<img src='$filename' / >";
		}
	}
}
?>