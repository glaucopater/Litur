$(function() {
  var blobTmp = undefined;
  var imageName;
  var ImageMaxWidth = $("input[name=maxWidth]").val() || 640;
  var ImageMaxHeigth = $("input[name=maxHeigth]").val() || 480;
  //var d = new Date();
  //var imageFilenamePrefix =  d.toISOString() + "resized_" +  ImageMaxWidth + "x" + ImageMaxHeigth + "_";
  var imageFilenamePrefix =
    "resized_" + ImageMaxWidth + "x" + ImageMaxHeigth + "_";

  var tempLog = "";
  var jpegQuality = 1.0;

  /*b64toBlob*/
  function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || "";
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {
      type: contentType
    });
    return blob;
  }

  /*fileUploader_valueChanged*/
  function fileUploader_valueChanged(e) {
    var files = e.value;
    if (files.length > 0) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $("#profile-image").attr("src", e.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  }

  /*onImageValueChanged*/
  function onImageValueChanged(e) {
    var files = e.target.files;
    if (files.length > 0) {
      //convert everything to jpg
      imageName = files[0].name;
      imageName = imageName.slice(0, -4) + ".jpg";

      var useImageTools =
        $("input[name=optionsRadios]:checked").val() == "ImageTools";
      var useLoadImage =
        $("input[name=optionsRadios]:checked").val() == "LoadImage";

      if (useImageTools) {
        /*Resize with Image Tools */
        ImageTools.resize(
          files[0],
          {
            width: $("input[name=ImageMaxWidth]").val(), // maximum width
            height: $("input[name=ImageMaxHeight]").val() // maximum height
          },
          function(blob, didItResize) {
            // didItResize will be true if it managed to resize it, otherwise false (and will return the original file as 'blob')
            $("#profile-image").attr("src", window.URL.createObjectURL(blob));
            blobTmp = blob;
          }
        );
      } else if (useLoadImage) {
        loadImage(
          files[0],
          function(img) {
            $img = $(img);
            $img.attr("id", "profile-image");

            var $previewLink = $('<a target="_blank">')
              .append(img)
              .attr("download", imageFilenamePrefix + imageName)
              .attr(
                "href",
                img.src || img.toDataURL("image/jpeg", jpegQuality)
              );
            
            
            console.log(img, files[0].name, " resized");

            var imgToDataUrl = img.toDataURL("image/jpeg", jpegQuality);

            var colorThief = new ColorThief();
         
            colorThief.getColorAsync(imgToDataUrl, function(color, element) {
              console.log("getColorAsync", color);
         
            });
              $("#imgPalette").html("");
             colorThief.getPaletteAsync(imgToDataUrl, function(palette, element) {
              console.log("getPaletteAsync", palette);
              
               $.each(palette,function(index,elem){
                 console.log("palette "+ index, elem);
                
                 
                
                $("#imgPalette").append("<div id='palette"+index+"' class='paletteColor' style='background:rgb("+elem.join(",")+")'></div>") 
 });
       
                  });
 
            $("#profile-image").replaceWith($previewLink); // it works but cannot be dowloaded: no src

            if (img.toBlob) {
              img.toBlob(
                function(e) {
                  console.log("blob created");
                  blobTmp = e;
                },
                "image/jpeg",
                jpegQuality
              );

      
            } else if (
              img.msToBlob !== undefined &&
              navigator.msSaveBlob !== undefined
            ) {
              /*IE > 10  support */

              imgToDataUrl = img.toDataURL("image/jpeg", jpegQuality);
              //remove metadata info for base64
              imgToDataUrl = imgToDataUrl.replace(/^[^,]+,/, "");
              contentType = "image/jpeg";
              //blobTmp = e; //working but PNG
              blobTmp = new Blob([b64toBlob(imgToDataUrl, contentType)], {
                type: "image/jpg"
              });
            }
          },
          {
            maxWidth: $("input[name=ImageMaxWidth]").val(),
            maxHeight: $("input[name=ImageMaxHeight]").val(),
            canvas: true,
            orientation: true,
            crop: true
          } // Options

          
        );
        //enable actions
        //$("#actions").removeClass("invisible");
      } else {
        var reader = new FileReader();
        var file = files[0];
        reader.addEventListener(
          "load",
          function() {
            $("#profile-image").attr("src", reader.result);
          },
          false
        );

        if (file) {
          reader.readAsDataURL(file);
        }

        console.log("Filereader only");
      }
    }
  }

  /*updateProfileButtonSubmitted*/
  function updateProfileButtonSubmitted(e) {
    // Se l'immagine é cambiata, blocca propagazione ed effettua l'elaborazione
    if (blobTmp !== undefined) {
      //e.preventDefault();

      var copyFormDataNew = new FormData();
      var firstName = $("input[name=FirstName]").val();
      var secondName = $("input[name=LastName]").val();
      var email = $("input[name=Email]").val();
      var objt = {
        FirstName: firstName,
        LastName: secondName,
        Email: email
      };

      var myJSON = JSON.stringify(objt);

      copyFormDataNew.append("resizedModel", myJSON);
      copyFormDataNew.append("resizedImage", blobTmp, imageName);

      return false;
    } else {
      return true;
    }
  }

  $("#formUpload").submit(function(e) {
    if (!updateProfileButtonSubmitted(e)) {
      e.preventDefault();
    }
  });

  $("#profileImage").on("change", function(e) {
    onImageValueChanged(e);
  });

  $("input[name=ImageMaxWidth]").on("change", function(e) {
    ImageMaxWidth =
      $("input[name=ImageMaxWidth]").val() > 0
        ? $("input[name=ImageMaxWidth]").val()
        : ImageMaxWidth;
    imageFilenamePrefix =
      "resized_" + ImageMaxWidth + "x" + ImageMaxHeigth + "_";
    console.log(ImageMaxWidth);
  });

  $("input[name=ImageMaxHeight]").on("change", function(e) {
    ImageMaxHeigth =
      $("input[name=ImageMaxHeight]").val() > 0
        ? $("input[name=ImageMaxHeight]").val()
        : ImageMaxHeigth;
    imageFilenamePrefix =
      "resized_" + ImageMaxWidth + "x" + ImageMaxHeigth + "_";
    console.log(ImageMaxHeigth);
  });

  var result = $("#result");
  var currentFile;

  $("#edit").on("click", function(event) {
    event.preventDefault();
    var imgNode = result.find("img, canvas");
    var img = imgNode[0];
    var pixelRatio = window.devicePixelRatio || 1;
    imgNode
      .Jcrop({
        setSelect: [
          40,
          40,
          img.width / pixelRatio - 40,
          img.height / pixelRatio - 40
        ],
        onSelect: function(coords) {
          coordinates = coords;
        },
        onRelease: function() {
          coordinates = null;
        }
      })
      .parent()
      .on("click", function(event) {
        event.preventDefault();
      });
  });

  //for crop
  function updateResults(img, data) {
    var $previewLink;
    if (!(img.src || img instanceof HTMLCanvasElement)) {
      $previewLink = $("<span>Loading image file failed</span>");
    } else {
      imageFilenamePrefix = "cropped_" + imageFilenamePrefix;
      $img = $(img);
      $img.attr("id", "profile-image");

      $previewLink = $('<a target="_blank">')
        .append(img)
        .attr("download", imageFilenamePrefix + imageName)
        .attr("href", img.src || img.toDataURL("image/jpeg", jpegQuality));

      if (img.toBlob) {
        img.toBlob(
          function(e) {
            console.log(e, "blob created");
            blobTmp = e;
          },
          "image/jpeg",
          jpegQuality
        );
      } else if (
        img.msToBlob !== undefined &&
        navigator.msSaveBlob !== undefined
      ) {
        /*IE > 10  support */
        imgToDataUrl = img.toDataURL("image/jpeg", jpegQuality);
        //remove metadata info for base64
        imgToDataUrl = imgToDataUrl.replace(/^[^,]+,/, "");
        const contentType = "image/jpeg";
        //blobTmp = e; //working but PNG
        blobTmp = new Blob([b64toBlob(imgToDataUrl, contentType)], {
          type: "image/jpg"
        });
      }
    }

    //$('#profile-image').replaceWith($previewLink); // it works but cannot be dowloaded: no src
    result.children().replaceWith($previewLink);
  }

  $("#crop").on("click", function(event) {
    event.preventDefault();
    var img = result.find("img, canvas")[0];
    var pixelRatio = window.devicePixelRatio || 1;
    if (img && coordinates) {
      updateResults(
        loadImage.scale(img, {
          left: coordinates.x * pixelRatio,
          top: coordinates.y * pixelRatio,
          sourceWidth: coordinates.w * pixelRatio,
          sourceHeight: coordinates.h * pixelRatio,
          minWidth: result.width(),
          maxWidth: result.width(),
          pixelRatio: pixelRatio,
          downsamplingRatio: 0.5
        })
      );
      coordinates = null;
    }
  });
});

mainColor = function(imageSrc) {
  if (!imageSrc) {
    image = $("img.image").get(0);
  } else image = $(imageSrc);

  var colorThief = new ColorThief();

  colorThief.getColorAsync("https://source.unsplash.com/random", function(
    color,
    element
  ) {
    console.log("async", color, element.src);
  });

  /* When the image is loaded */
  image.onload = function() {
    console.log(image, "loaded");
    var color = colorThief.getPalette(image, 8);

    var color1 = "rgb(" + color[0] + ")";
    var color2 = "rgb(" + color[1] + ")";
  };
};

// mainColor();
ColorThief.prototype.getPaletteAsync = function(imageUrl, callback, quality) {
    var thief = this;
    this.getImageData(imageUrl, function(imageData){
        sourceImage = document.createElement("img");
        sourceImage.addEventListener('load' , function(){
            var palette = thief.getPalette(sourceImage, 5, quality);
            callback(palette, this);
        });
        sourceImage.src = imageData;      
    });
};