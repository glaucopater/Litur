<?php
error_reporting(E_ALL);
/*
main controller
*/

$storeFolder = getcwd(). "/images/";
$response = array();
$imageFilenamePrefix = "resized_";

function store_file($temp_filename,$original_filename) {
    global $storeFolder;
	global $imageFilenamePrefix;  
	$original_filename = $imageFilenamePrefix.$original_filename;
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
    //echo "Server response after POST:";print_r($_POST);print_r($_FILES);
    
    $response[] = $_POST;
    $response[] = $_FILES;
    // store_file($temp_filename,$original_filename);
    if(isset($_POST["image"])) 
        //|| isset($_POST["resizedModel"]))
    {
        file_put_contents($storeFolder."/"."file" .time(). ".jpg", $_POST["image"]);        
    }
    else if(isset($_FILES["resizedImage"])) {               
        $temp_filename = $_FILES["resizedImage"]["tmp_name"]; 
        $original_filename = $_FILES["resizedImage"]["name"]; 
		
        store_file($temp_filename,$original_filename);
    }
    
	//header('Content-type: application/json');
    echo json_encode($response);
}
else if($_POST) {
    //echo "LINE ".__LINE__;
    $response[] = $_POST;
    $response[] = $_FILES;
// store_file($temp_filename,$original_filename);
    if(isset($_POST["image"])) 
        //|| isset($_POST["resizedModel"]))
    {
        file_put_contents($storeFolder."/"."file" .time(). ".jpg", $_POST["image"]);        
    }
    else if(isset($_FILES["resizedImage"])) {                   
        $temp_filename = $_FILES["resizedImage"]["tmp_name"]; 
        $original_filename = $_FILES["resizedImage"]["name"]; 
        store_file($temp_filename,$original_filename);
    }
    //header('Content-type: application/json');
    echo json_encode($response);
}
if($_GET) {
    $response[] = "Server response after GET :";
    //print_r($_GET);
    //header('Content-type: application/json');
    echo  json_encode($response);
}
else if($_FILES) {
    //for filereader only, no trasformation on client side
    if (isset($_FILES["upload"])){
        $temp_filename = $_FILES["upload"]["tmp_name"]; 
        $original_filename = $_FILES["upload"]["name"]; 
    }
    else if (isset($_FILES["resizedImage"])){
        $temp_filename = $_FILES["resizedImage"]["tmp_name"]; 
        $original_filename = $_FILES["resizedImage"]["name"]; 
    }
    store_file($temp_filename,$original_filename);
    $response[] = $_FILES;
	//header('Content-type: application/json');
    echo  json_encode($response);

}
else {   
    $arrayOfImages = getFolderContent("images");
    /*
    foreach (scandir("C:\\xampp\\htdocs\\xampp\\test\\test_upload\\images\\"."*.jpg") as $filename) {
        //echo "$filename size " . filesize($filename) . "\n";
        echo "<img src='$filename' / >";
        */
	//echo count($arrayOfImages);
	
	if (count($arrayOfImages)==0) {
		echo "Nothing to see...";
	}
	else {		
		foreach ($arrayOfImages as $filename) {
			//echo "$filename size " . filesize($filename) . "\n";
			echo "<img src='$filename' / >";
		}
	}
}
?>