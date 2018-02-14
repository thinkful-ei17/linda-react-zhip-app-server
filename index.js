const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {Transaction, User}  = require('./database/model');

const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');

const app = express();

//sender
//POST - create new send transaction
//PUT - update user balance

//receiver
//POST - create new claim transaction
//PUT - update user balance

app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
        skip: (req, res) => process.env.NODE_ENV === 'test'
    })
);

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

//call put in post METHODS- fetch request (node js fetch module);

//POST


app.get('/users', (req, res) => {
    console.log('what is user',User);
    User.find({})
       .then(user => {
        res.json(user);
       })
       .catch(err =>{
         console.error(err);
         res.status(500).json({message: 'Internal Server Error'});
       }); //error handler
});
   
//see all transactions info (ledger) - public key, transaction amt, transaction id, transaction type
app.get('/transactions', (req, res) => {
    console.log('what is user',Transaction);
    Transaction.find({})
        .then(transaction => {
          res.json(transaction);
        })
        .catch(err =>{
          console.error(err);
          res.status(500).json({message: 'Internal Server Error'});
        }); //error handler
});

function runServer(port = PORT) {
    const server = app.listen(port, () => {
            console.info(`App listening on port ${server.address().port}`);
        })
        .on('error', err => {
            console.error('Express failed to start');
            console.error(err);
        });
}

if (require.main === module) {
    dbConnect();
    runServer();
}

module.exports = {app};
