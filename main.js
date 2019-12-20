const {
  app,
  BrowserWindow
} = require('electron');

const {
  ipcMain
} = require('electron')
const path = require('path');
const url = require('url');
var $ = jQuery = require('jquery')


let win;
let loggedInUserID;
const {
  remote
} = require('electron')


var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "database.sqlite3"
  }
});

function createWindow() {
  // Creates Window
  webPreferences: {
    nodeIntegration: true
  }

  win = new BrowserWindow({
    width: 1024,
    height: 768,
    center: true,
    'minHeight': 600,
    'minWidth': 800,
    icon: './css/media/coolIcon.png',
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  //Loads index.html
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Open DevTools ! only for development !
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
}

//Run window
app.on('ready', createWindow);

// Quits when all windows are closed
app.on('window-all-closed', () => {
  //Mac OS Check
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


//get the userdata: email, password to validate the Login. sends back a error or
//on success they get redirected to the nextpage
ipcMain.on('form-Login-submission', function(event, email, password) {
  if (email < 4 || password < 8) {
    event.reply('login-error-msg', true)
  }

  knex.table('accounts').pluck('email').then(function(ids) {
    if (ids.includes(email)) {
      knex('accounts').where('email', email).pluck('password').then(function(ids) {
        if (ids.includes(password)) {
          knex('accounts').where('email', email).pluck('userID').then(function(ids) {
            loggedInUserID = parseInt(ids);
            win.loadURL(url.format({
              pathname: path.join(__dirname, 'home.html'),
              protocol: 'file:',
              slashes: true
            }));

          })
        } else {
          event.reply('login-error-msg', true)
        }
      });
    } else {
      event.reply('login-error-msg', true);
    }
  });
});

//gets the data from the Registration and validates them on error send a errorCode
//On succes gets redirected to the login with a success msg
ipcMain.on('form-registration-submission', function(event, email, username, password) {

  knex.table('accounts').pluck('email').then(function(ids) {
    if (ids.includes(email)) {
      //Email alredy exists
      event.reply('registration-error-msg', 'emailEx');
    } else {
      if (validateEmail(email) == false) {
        //invalid Email
        event.reply('registration-error-msg', 'email');
      } else {
        //check username
        if (validateUsername(username) == false) {
          event.reply('registration-error-msg', 'username');
        } else {
          if (password < 8) {
            event.reply('registration-error-msg', 'password');
          } else {

            knex('accounts').insert({
                email: email,
                username: username,
                password: password
              })
              .then();
            event.reply('registration-success', '');
          }
        }
      }
    }
  })
});


//Email regex validation ... totaly copypasted
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

//Username reges validation
function validateUsername(username) {
  var re = /^[A-Za-z]{4,13}$/
  return re.test(String(username).toLowerCase());
}


//gives USERNAME to the render script
ipcMain.on('form-getUsername-submission', function(event) {
  if (loggedInUserID == null) {

  } else {
    knex('accounts').where('userID', loggedInUserID).pluck('username').then(function(ids) {
      event.reply('getUsername-success', ids);
    })
  }
})


//gives Status to the render script
ipcMain.on('form-getStatus-submission', function(event) {
  if (loggedInUserID == null) {

  } else {
    knex('accounts').where('userID', loggedInUserID).pluck('status').then(function(ids) {
      let status = ids.toString()
      event.reply('getStatus-success', status);
    })
  }
})

//give Description to the render script
ipcMain.on('form-getDescription-submission', function(event) {
  if (loggedInUserID == null) {

  } else {
    knex('accounts').where('userID', loggedInUserID).pluck('description').then(function(ids) {
      let description = ids.toString()
      event.reply('getDescription-success', description);
    })
  }
})

//give ProfilPic to the render script
ipcMain.on('form-getProfilpic-submission', function(event) {
  if (loggedInUserID == null) {

  } else {
    knex('accounts').where('userID', loggedInUserID).pluck('profilpicture').then(function(ids) {
      let profilpic = ids.toString()
      event.reply('getProfil-success', profilpic);
    })
  }
})



//sets the new status of the Userinput
ipcMain.on('form-setStatus-submission', function(event, newStatus) {
  knex('accounts')
    .where('userID', loggedInUserID)
    .update({
      status: newStatus
    })
    .then();
})


//sets the new Description of the Userinput
ipcMain.on('form-setDescription-submission', function(event, description) {
  knex('accounts')
    .where('userID', loggedInUserID)
    .update({
      description: description
    })
    .then();

})


////sets the new Picture wich the user choose
ipcMain.on('form-setPicture-submission', function(event, newPicture) {
  knex('accounts')
    .where('userID', loggedInUserID)
    .update({
      profilpicture: newPicture
    })
    .then();
  event.reply('getProfil-success', newPicture)
})



//Gives Gameinfos about all the games for the datatable
ipcMain.on('form-getGameInfo-submission', function(event, ) {
  var title;
  var tags;
  var rating;
  var price;
  var description;
  knex('games').count('gameID as CNT').then(function(amount) {
    var size = parseInt(amount[0].CNT);
    for (var i = 1; i <= size; i++) {
      knex('games')
        .where('gameID', i)
        .then(function(ids) {
          title = ids[0].title;
          tags = ids[0].tags;
          rating = ids[0].rating;
          price = ids[0].price;
          description = ids[0].description;
          event.reply('getGameInfo-success', title, tags, rating, price, description)
        })
    }
  })
})
var gameIDs;

//makes a wishlist entery
ipcMain.on('form-SetWishlist-submission', function(event, gametitles) {
  if (loggedInUserID == null) {
  } else {
    knex('games').where('title', gametitles).then(function(ids) {
      gameIDs = parseInt(ids[0].gameID);
      knex('wishList').where('gameID', gameIDs).then(function(ids) {
        if (ids == "") {
          knex('wishlist').insert({
              userID: loggedInUserID,
              gameID: gameIDs
            })
            .then();
        } else {
          var a = ids[0].userID;
          if (a = loggedInUserID) {

          } else {
            knex('wishlist').insert({
                userID: loggedInUserID,
                gameID: gameIDs
              })
              .then();
          }
        }
      })
    })
  }
})

//Wishlist info about the wishlist for the datatable
ipcMain.on('form-getWishlistInfo-submission', function(event, ) {
  var gamelistID
  var title;
  var tags;
  var rating;
  var price;
  var description;

  knex('wishlist')
    .where('userID', loggedInUserID)
    .then(function(ids) {
      ids.forEach(function(item, index) {
        knex('games').where('gameID', item.gameID)
          .then(function(ids) {
            title = ids[0].title;
            tags = ids[0].tags;
            rating = ids[0].rating;
            price = ids[0].price;
            description = ids[0].description;
            event.reply('getWishlistInfo-success', title, tags, rating, price, description)
          })
      })

    })
})


//give charts infos
ipcMain.on('form-getChartInfo-submission', function(event, ) {
  //get Data from the wishlist and pass them
  knex('wishlist')
    .select('tags')
    .innerJoin('games', 'wishlist.gameID', 'games.gameID')
    .where('wishlist.userID', loggedInUserID)
    .groupBy('tags')
    .count('tags', {
      as: 'amount'
    })
    .orderBy('amount', 'desc')
    .then(function(ids) {

      event.reply('getChartInfo-success', ids)

    })

})

//delete entry from wishList
ipcMain.on('form-deleteWishlist-submission', function(event, gametitles) {

  knex('games')
    .where('title', gametitles)
    .then(function(ids) {
      gameIDs = parseInt(ids[0].gameID);
      knex('wishList')
        .where('userID', loggedInUserID)
        .andWhere('gameID', gameIDs)
        .del()
        .then();
      event.reply('successDeleteWishlistEntery', )
    })
})
