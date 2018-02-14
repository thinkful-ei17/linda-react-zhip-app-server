const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Transaction, User}  = require('./database/model');


const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');

const app = express();

app.use(jsonParser);

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
            console.log('what is transaction', transaction);
          res.json(transaction);
        })
        .catch(err =>{
          console.error(err);
          res.status(500).json({message: 'Internal Server Error'});
        }); //error handler
});


//sending user inputs userId and transactionAmount => capture via req.body; capture transaction type via param id? or default to send?
//{"transactionType":"send","transactionAmount":20,"userId":"5a844483734d1d1523dba1d6"}
app.post('/send/transaction', jsonParser, (req, res) => {
    /***** Never trust users - validate input *****/
    const requiredFields = ['userId', 'transactionAmount', 'transactionType'];
    
    const missingFields = requiredFields.filter(field => !(field in req.body)); 
 
  
    const { userId, transactionAmount, transactionType  } = req.body;
    
    const newTransaction = {userId, transactionAmount, transactionType };
  
    Transaction.create(newTransaction)
      .then(sendAmount => {
        if (sendAmount) {
          res.json(sendAmount);
        }
      })
      .catch(err => console.error(`Error: ${err.message}`));
  });

  //{"transactionType":"send","transactionAmount":20,"userId":"5a844483734d1d1523dba1d6"}
  app.put('/send/transaction', (req, res) => {
    const id = req.body.userId;
    const amount = req.body.transactionAmount;
    const type = req.body.transactionType;
    console.log('what is id', id);
    console.log('what is amount', amount);
    console.log('what is type', type);
     /***** Never trust users - validate input *****/
    const requiredFields = ['transactionType'];
  
    const missingFields = requiredFields.filter(field => !(field in req.body));

    console.log('is there a missingFields', missingFields);
  
   User.findById(id)
    .then(transaction => {
        console.log('what is transaction', transaction);
        let newBalance = parseInt(transaction.accountBalance) - parseInt(amount);
          User.findByIdAndUpdate(id, {accountBalance: newBalance})
          .then(() => res.status(204).end())
          .catch(err => console.error(`Error: ${err.message}`));
    })
    .catch(err => {
      res.status(500).send({message: 'Internal Server Error'});
    });  // error handler
  });

//   //{"transactionType":"send","transactionAmount":20,"userId":"5a844483734d1d1523dba1d6"}
// app.post('/receive/transaction/:transactionAmount/:originatingTransactionId', jsonParser, (req, res) => {
//     const transId = req.params.originatingTransactionId;
//     const amount = req.params.transactionAmount;
//     const type = req.body.transactionType;
//     const userId = req.body.userId;
//     console.log('what is id', transId);
//     console.log('what is amount', amount);
//     console.log('what is type', type);
//      /***** Never trust users - validate input *****/
//     const requiredFields = ['userId', 'transactionType'];
    
//     const missingFields = requiredFields.filter(field => !(field in req.body)); 
 
  
//     const { userId, transactionAmount, transactionType  } = req.body;
    
//     const newTransaction = {userId, transactionAmount, transactionType };
  
//     Transaction.create(newTransaction)
//       .then(sendAmount => {
//         if (sendAmount) {
//           res.json(sendAmount);
//         }
//       })
//       .catch(err => console.error(`Error: ${err.message}`));
//   });

//   //{"transactionType":"send","transactionAmount":20,"userId":"5a844483734d1d1523dba1d6"}
//   app.put('/receive/transaction', (req, res) => {
//     const id = req.body.userId;
//     const amount = req.body.transactionAmount;
//     const type = req.body.transactionType;
//     console.log('what is id', id);
//     console.log('what is amount', amount);
//     console.log('what is type', type);
//      /***** Never trust users - validate input *****/
//     const requiredFields = ['transactionType'];
  
//     const missingFields = requiredFields.filter(field => !(field in req.body));

//     console.log('is there a missingFields', missingFields);
  
//    User.findById(id)
//     .then(transaction => {
//         console.log('what is transaction', transaction);
//         let newBalance = parseInt(transaction.accountBalance) + parseInt(amount);
//           User.findByIdAndUpdate(id, {accountBalance: newBalance})
//           .then(() => res.status(204).end())
//           .catch(err => console.error(`Error: ${err.message}`));
//     })
//     .catch(err => {
//       res.status(500).send({message: 'Internal Server Error'});
//     });  // error handler
//   });

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
