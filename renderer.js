const {
  ipcRenderer
} = require('electron')
require('datatables.net')(window, $);
const Chart = require('chart.js');

var isInLoginWindow = true;
let isProfilMenuOpen = false;
let isSocialMenuOpen = false;
let isWishlistMenuOpen = true;
let isGameMenuOpen = false;
let username;


//Invalid Username
ipcRenderer.on('login-error-msg', (event, arg) => {
  if (arg) {
    //Invalid password or username MSG
    $('#loginFailMsg').show().delay(5000).fadeOut('slow');
  }
})

//Send the email, password
function sendLoginForm(event) {
  event.preventDefault() // stop the form from submitting
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  ipcRenderer.send('form-Login-submission', email, password)

}

//On ready hide a bunch of shit, init some methods
$(document).ready(function() {
  $('#successWishlistMSG').hide();
  $('#deleteWishlistMSG').hide();
  $('#profilTab').animate({
    width: "toggle"
  });
  $('#socialTab').animate({
    height: "toggle"
  });
  $('#gameContent').hide();
  $('#wishlistID').css({
    "background-color": "rgba(24, 24, 24, 1)"
  });
  $('.shortcut').hide();
  getUsername();
  getStatusMSG();
  getDescriptionMSG();
  setProfilPicture();
  loadDatatable();
  loadWishlistDatatable();
  drawChart();
});



/*
Setting Userinfos
------------------
Username, status, Description
*/
//Get the Username and Set it in the HTML
function getUsername() {
  ipcRenderer.send('form-getUsername-submission');
  ipcRenderer.on('getUsername-success', (event, usernameName) => {
    username = usernameName.toString();
    document.getElementById("usernameDisplay").innerHTML = username;
    document.getElementById("usernameDisplayProfilWindow").innerHTML = username;

  });

}

//Get the Status and Set it in the HTML
function getStatusMSG() {
  ipcRenderer.send('form-getStatus-submission');
  ipcRenderer.on('getStatus-success', (event, status) => {

    if (status == "") {
      document.getElementById("statusMSG").placeholder = "Set your Description here";
      $('#statusMSG').css({
        "color": "rgba(167, 167, 222, .6);"
      });
    }
    document.getElementById("statusMSG").value = status

    $('#statusMSG').css({
      "color": "rgba(167, 167, 222, 1);"
    });
  });
}


////Get the Description and Set it in the HTML
function getDescriptionMSG() {
  ipcRenderer.send('form-getDescription-submission');
  ipcRenderer.on('getDescription-success', (event, description) => {

    if (description == "") {
      document.getElementById("descriptionAreaField").placeholder = "Set your description here";
      $('#descriptionAreaField').css({
        "color": "rgba(111, 111, 162, 0.3);"
      });
    }
    document.getElementById("descriptionAreaField").value = description

    $('#descriptionAreaField').css({
      "color": "rgba(111, 111, 162, 0.8);"
    });
  });

}

//when no Status choosen -- change css
$('#statusMSG').on('input', function(e) {
  $('#statusMSG').css({
    "color": "rgba(111, 111, 162, 0.8);"
  });

});


/*
Menuswitches
---------------
Switches the content of the: Registration and the Login menu
*/

function switchLoginRegistrationWindow() {
  if (isInLoginWindow) {
    $('.RegisterContainer').show();
    $('.loginContainer').hide();
    $('#password').val("");
    $('#passwordReg').val("");
    isInLoginWindow = false;
  } else {
    $('.RegisterContainer').hide();
    $('.loginContainer').show();
    $('#password').val("");
    $('#passwordReg').val("");
    isInLoginWindow = true;
  }
}

//On registration error set css and Errormsg
ipcRenderer.on('registration-error-msg', (event, arg) => {
  errormsg = ""

  //Invalid registraion
  switch (arg) {
    case "emailEx":

      errormsg = "Email already exists"
      //borderAnim
      $('#emailReg').css('border-color', 'rgba(184, 0, 0, 0.4)');
      setTimeout(function() {
          $('#emailReg').css('border-color', 'rgba(0, 0, 0, 0.1)');
        },
        5000);
      break;
    case "email":
      errormsg = "Not a valid email"
      //borderAnim
      $('#emailReg').css('border-color', 'rgba(184, 0, 0, 0.4)');
      setTimeout(function() {
          $('#emailReg').css('border-color', 'rgba(0, 0, 0, 0.1)');
        },
        5000);
      break;
    case "password":
      errormsg = "Must be atleast 8 characters long"
      //borderAnim
      $('#passwordReg').css('border-color', 'rgba(184, 0, 0, 0.4)');
      setTimeout(function() {
          $('#passwordReg').css('border-color', 'rgba(0, 0, 0, 0.1)');
        },
        5000);
      break;
    case "username":
      errormsg = "Must be atleast 4 charecters long, max 13, no digits"
      //borderAnim
      $('#usernameReg').css('border-color', 'rgba(184, 0, 0, 0.4)');
      setTimeout(function() {
          $('#usernameReg').css('border-color', 'rgba(0, 0, 0, 0.1)');
        },
        5000);
      break;

    default:
  }
  //turns them back to normal
  $('#registrationFailMessage').html(errormsg);
  $('#registrationFail').show().delay(5000).fadeOut('slow');

});

//On registration success switches to Login menu and shows a Success MSG
ipcRenderer.on('registration-success', (event, arg) => {
  switchLoginRegistrationWindow();
  $('#registraionSuccess').show().delay(5000).fadeOut('slow');

});

//Sends the Users registration form to the Main script where it gets validated
function sendRegistrationForm(event) {
  event.preventDefault() // stop the form from submitting
  let email = document.getElementById("emailReg").value;
  let username = document.getElementById("usernameReg").value;
  let password = document.getElementById("passwordReg").value;

  ipcRenderer.send('form-registration-submission', email, username, password)

}


/*
Bunch of hover animations
*/
//hover socialTab css stuff
$('#social_ID').hover(function() {
  $('#social_ID').css({
    "background-color": "rgba(24, 24, 24, 1)"
  });
}, function() {
  if (!isSocialMenuOpen) {
    $('#social_ID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
  }
});

//hover ProfilTab css stuff
$('#profil_ID').hover(function() {
  $('#profil_ID').css({
    "background-color": "rgba(24, 24, 24, 1)"
  });
}, function() {
  if (!isProfilMenuOpen) {
    $('#profil_ID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
  }
});

//hover wishList css stuff
$('#wishlistID').hover(function() {
  $('#wishlistID').css({
    "background-color": "rgba(24, 24, 24, 1)"
  });
}, function() {
  if (!isWishlistMenuOpen) {
    $('#wishlistID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
  }
});

//hover Game
$('#gamesID').hover(function() {
  $('#gamesID').css({
    "background-color": "rgba(24, 24, 24, 1)"
  });
}, function() {
  if (!isGameMenuOpen) {
    $('#gamesID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
  }
});


/*
Toggle function of the: SocialTab, ProfileTab, GameTab and Wishlisttab Menu
*/
//Toggle SocialTab
$('#social_ID').click(function() {
  swapSocialTab();
});

function swapSocialTab() {
  $('#socialTab').stop();
  if (isSocialMenuOpen) {

    isSocialMenuOpen = false;
    $('#social_ID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
    $('#socialTab').animate({
      height: "toggle"
    });
  } else {
    isSocialMenuOpen = true;
    $('#social_ID').css({
      "background-color": "rgba(24, 24, 24, 1)"
    });
    $('#socialTab').animate({
      height: "toggle"
    });
  }
}


//Toggle ProfileTab
$('#profil_ID').click(function() {
  swapProfilTab();
});

function swapProfilTab() {
  $('#profilTab').stop();
  if (isProfilMenuOpen) {

    isProfilMenuOpen = false;
    $('#profil_ID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
    $('#profilTab').animate({
      width: "toggle"
    });
  } else {
    isProfilMenuOpen = true;
    $('#profil_ID').css({
      "background-color": "rgba(24, 24, 24, 1)"
    });
    $('#profilTab').animate({
      width: "toggle"
    });
  }
}


//Toggle GameTab
$('#gamesID').click(function() {
  swapGameTab();

});

function swapGameTab() {

  if (isGameMenuOpen) {


  } else {
    $('#wishlistID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
    $('#wishlistContent').hide();
    isWishlistMenuOpen = false;
    isGameMenuOpen = true;
    $('#gamesID').css({
      "background-color": "rgba(24, 24, 24, 1)"
    });
    $('#gameContent').show();
  }
}


//Toggle wishlistTab
$('#wishlistID').click(function() {
  swapWishlistTab();

});

function swapWishlistTab() {

  if (isWishlistMenuOpen) {

  } else {
    loadWishlistDatatable();
    drawChart();
    isGameMenuOpen = false;
    $('#gamesID').css({
      "background-color": "rgba(70, 70, 70, 0.3)"
    });
    $('#gameContent').hide();
    isWishlistMenuOpen = true;
    $('#wishlistID').css({
      "background-color": "rgba(24, 24, 24, 1)"
    });
    $('#wishlistContent').show();
  }
}

/*
Profile Tab Content
*/
//Set Newstatus
$("#statusMSG").focusout(function() {
  newStatus = $('#statusMSG').val();

  ipcRenderer.send('form-setStatus-submission', newStatus)
});


//set New profilpic
$("input:file").change(function() {
  var myFile = $('#fileUpload').prop('files')[0];
  ipcRenderer.send('form-setPicture-submission', myFile.path)

});

function setProfilPicture() {
  ipcRenderer.send('form-getProfilpic-submission', )

}

//Some profilpicture Validation if the Path is null a default Picture gets set
ipcRenderer.on('getProfil-success', (event, arg) => {
  if (arg == "") {
    //set default pic
    $('#userProfilPicture').attr("src", "css/media/none.jpg");
    $('#profilIMG').attr("src", "css/media/none.jpg");
  } else {
    //change Picture
    $('#userProfilPicture').attr("src", arg);
    $('#profilIMG').attr("src", arg);
  }

});

//delete picture request
$('#SubmitResetProfilePic').click(function() {
  ipcRenderer.send('form-setPicture-submission', "");
});

//Set Description
$("#descriptionAreaField").focusout(function() {
  description = $('#descriptionAreaField').val();

  ipcRenderer.send('form-setDescription-submission', description)
});

/*
Shortcuts functional and visual.
*/
$(document).on('keydown', function(e) {

  if ((e.metaKey || e.ctrlKey) && (String.fromCharCode(e.which).toLowerCase() === '1')) {
    //wishlist selected
    swapWishlistTab();

  }
  if ((e.metaKey || e.ctrlKey) && (String.fromCharCode(e.which).toLowerCase() === '2')) {
    //games selected
    swapGameTab();

  }
  if ((e.metaKey || e.ctrlKey) && (String.fromCharCode(e.which).toLowerCase() === '3')) {
    //social selected
    swapSocialTab();

  }
  if ((e.metaKey || e.ctrlKey) && (String.fromCharCode(e.which).toLowerCase() === '4')) {
    //profil selected
    swapProfilTab();

  }
});

//shortcut display
$(window).keydown(function(e) {
  if (e.ctrlKey) {
    shortCutHideShow(true);
  }
});

$(window).keyup(function(e) {
  if ((String.fromCharCode(e.which).toLowerCase() === '1') ||
    (String.fromCharCode(e.which).toLowerCase() === '2') ||
    (String.fromCharCode(e.which).toLowerCase() === '3') ||
    (String.fromCharCode(e.which).toLowerCase() === '4')) {

  } else {
    shortCutHideShow(false);
  }


});

var reset = true;

function shortCutHideShow(active) {

  if (active) {
    if (reset) {
      //Show
      $('.shortcut').show();
      reset = false;
    }
  } else {
    //hide
    $('.shortcut').hide();
    reset = true;
  }
}

/*Datatable*/
// GAME DataTable request
function loadDatatable() {

  ipcRenderer.send('form-getGameInfo-submission', )
}

//add to data table. gets the values
ipcRenderer.on('getGameInfo-success', (event, title, tags, rating, price, description) => {
  dbGames.row.add([
    title,
    tags,
    rating,
    price,
    description
  ]).draw(false);
})

//puts the game into the wishlist table
$('#tbody').on('click', 'button', function() {
  var data = dbGames.row($(this).parents('tr')).data();
  msg = data[0] + " added to wishlist";
  displaySuccessAdding(msg);
  setWishlist(data[0]);
});

//Displays a success msg for adding the Game to the wishlist successfully
function displaySuccessAdding(msg) {
  document.getElementById("successWishlistMessage").innerHTML = msg;
  $('#successWishlistMSG').show().delay(1000).fadeOut('slow');

}
//Displays a success msg for removing the Game from the wishlist successfully
function displaySuccessDelete(msg) {
  document.getElementById("deleteWishlistMessage").innerHTML = msg;
  $('#deleteWishlistMSG').show().delay(1000).fadeOut('slow');

}
//data send to main: to add them
function setWishlist(title) {
  ipcRenderer.send('form-SetWishlist-submission', title)
}

//data send to main: to remove them
function deleteWishlist(title) {
  ipcRenderer.send('form-deleteWishlist-submission', title)
}


//Wishlist Datatable
function loadWishlistDatatable() {
  dbWishlist.clear();
  dbWishlist.draw();
  ipcRenderer.send('form-getWishlistInfo-submission', )
}

//add to data table wishlist
ipcRenderer.on('getWishlistInfo-success', (event, title, tags, rating, price, description) => {
  dbWishlist.row.add([
    title,
    tags,
    rating,
    price,
    description
  ]).draw(false);
})

// Delete out of wishList
$('.wishlist').on('click', 'button', function() {
  var data = dbWishlist.row($(this).parents('tr')).data();
  msg = data[0] + " removed from wishlist";
  displaySuccessDelete(msg);
  deleteWishlist(data[0]);

});

//Successfully removed a game from The wishlist and refreshes the Table and the graph
ipcRenderer.on('successDeleteWishlistEntery', () => {
  loadWishlistDatatable();
  drawChart();
})

/*
GameTable WishlistTable and the Chart.. donut diagram
*/
//Datatable for games
var dbGames = $('#table_id').DataTable({
  pageLength: 5,
  lengthMenu: [
    [5, -1],
    [5, 'all']
  ],
  "columnDefs": [{
    "targets": -1,
    "data": null,
    "defaultContent": "<button>Add</button>"
  }]
});

//Datatable for Wishlist
var dbWishlist = $('#table_idWishlist').DataTable({
  pageLength: 5,
  lengthMenu: [
    [5, -1],
    [5, 'all']
  ],
  "columnDefs": [{
    "targets": -1,
    "data": null,
    "defaultContent": "<button>Delete</button>"
  }]
});


//draw dataTable
ipcRenderer.on('getChartInfo-success', (event, ids) => {
  console.log(ids.length);
  if (ids.length >= 4) {
    $('#statisticsContainer').show();
    var ctx = document.getElementById('myChart');
    var myDoughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [ids[0].tags, ids[1].tags, ids[2].tags, ids[3].tags, ids[4].tags],
        datasets: [{
          label: "Population (millions)",
          backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
          data: [ids[0].amount, ids[1].amount, ids[2].amount, ids[3].amount, ids[4].amount]
        }]
      },
      options: {
        title: {
          display: true,

        }
      }
    });
  } else {
    $('#statisticsContainer').hide();
  }
})

//Request the chart
function drawChart() {
  ipcRenderer.send('form-getChartInfo-submission', )
}
