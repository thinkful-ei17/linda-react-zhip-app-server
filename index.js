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
    Transaction.find({})
        .then(transaction => {
          res.json(transaction);
        })
        .catch(err =>{
          console.error(err);
          res.status(500).json({message: 'Internal Server Error'});
        }); //error handler
});

//get one users balance
app.get('/user/balance/:id', (req, res) => {
    const userId = req.params.id;
    User.findById(userId)
       .then(user => {
        res.json(user);
       })
       .catch(err =>{
         console.error(err);
         res.status(500).json({message: 'Internal Server Error'});
       }); //error handler
});

//see all transactions info for user
app.get('/activity/transactions/:id', (req, res) => {
    const userId = req.params.id;
    Transaction.find({ $or: [{userIdInitiator: userId}, {userIdClaimer: userId}]})
        .then(transactionInitiate => {
          res.json(transactionInitiate);
        })
        .catch(err =>{
          console.error(err);
          res.status(500).json({message: 'Internal Server Error'});
        }); //error handler
});
   

//new user provides id and starting accountblance of 0
app.post('/user/new', (req, res) => {
    /***** Never trust users - validate input *****/
  
    User.create({accountBalance: 1000})
      .then(user => {
        if (user) {
          res.json(user);
        }
      })
      .catch(err => console.error(`Error: ${err.message}`));
  });

  //5a844476734d1d1523dba1c5
  //5a844483734d1d1523dba1d6
//sending user inputs userIdInitiator and transactionAmount => capture via req.body
//{"transactionAmount":10,"userIdInitiator":"5a844483734d1d1523dba1d6"}
app.post('/transaction/send', jsonParser, (req, res) => {

    /***** Never trust users - validate input *****/
    const requiredFields = ['transactionAmount', 'userIdInitiator'];
    
    const missingFields = requiredFields.filter(field => !(field in req.body)); 
  
    const { transactionAmount, userIdInitiator  } = req.body;

    const intAmount = parseInt(transactionAmount, 10);

    const newTransaction = {userIdInitiator, transactionAmount: intAmount};

    User.findById(userIdInitiator)
        .then(account => {
            if((parseInt(account.accountBalance, 10) > 0) && (parseInt(account.accountBalance, 10) >= intAmount)) { //checks that user has enough in account balance to perform transaction
                Transaction.create(newTransaction)
                    .then(sendAmount => {
                        if (sendAmount) {
                        res.json(sendAmount);
                        }
                    })
            }
        else {
        res.status(404).end();
        }
    })
    .catch(err => {
        res.status(500).send({message: 'Internal Server Error'});
    });
});

  //{"transactionAmount":10,"userIdInitiator":"5a844483734d1d1523dba1d6"}
  app.put('/account/send', jsonParser, (req, res) => {
    const id = req.body.userIdInitiator;
    const amount = req.body.transactionAmount;

     /***** Never trust users - validate input *****/
    const requiredFields = ['userIdInitiator', 'transactionAmount'];
  
    const missingFields = requiredFields.filter(field => !(field in req.body));
  
   User.findById(id)
    .then(account => {
        if (parseInt(account.accountBalance, 10) >= parseInt(amount, 10)) { 
        let newBalance = parseInt(account.accountBalance, 10) - parseInt(amount, 10);
          User.findByIdAndUpdate(id, {accountBalance: newBalance})
          .then(() => res.status(204).end())
          .catch(err => console.error(`Error: ${err.message}`));
        }
        else {
            res.status(404).end(); // 404 handler
        }
    })
    .catch(err => {
      res.status(500).send({message: 'Internal Server Error'});
    });  // error handler
  });

//localhost:8080/receive/transaction/5a84a88d03eb191658d565cf
//{"userIdClaimer": "5a844476734d1d1523dba1c5"}
app.put('/transaction/receive/:transactionId', jsonParser , (req, res) => {
    console.log('hello I am working hard!!!!');
    const transId = req.params.transactionId;
    const id = req.body.userIdClaimer;

    console.log('what is transId', transId);
    console.log('what is userIdClaimer', id);

    const requiredFields = ['userIdClaimer'];
  
    const missingFields = requiredFields.filter(field => !(field in req.body));

    console.log('what is tranid here', transId);
    console.log('what is user id', id);
        Transaction.findById(transId)
            .then(transaction => {
                console.log('what is transaction', transaction);
                console.log('what is isIOUClaimed', transaction.isIOUClaimed);
                console.log('what is id here in findbyId!!!!!!', id);
                console.log('what is userIdInitiator', transaction.userIdInitiator);
                if (transaction && !(transaction.isIOUClaimed) && (transaction.userIdInitiator !== id)) {
                    console.log('transaction exists! now what???');
                Transaction.findByIdAndUpdate(transId, {userIdClaimer: id, isIOUClaimed: true}, {new: true})
                    .then(completedTransaction => {
                        console.log('what is completedTransaction');
                    if (completedTransaction) {
                        res.json(completedTransaction);
                    }
                    })
                }
                else {
                    res.status(404).end(); // 404 handler
                }
        })
        .catch(err => {
            res.status(500).send({message: 'Internal Server Error'});
        });
}); 


  //{"transactionType":"send","transactionAmount":20,"userId":"5a844483734d1d1523dba1d6"}
app.put('/account/receive/:transactionId', (req, res) => {
    const id = req.body.userIdClaimer;
    //have to find const amount = req.body.transactionAmount;
    const transId = req.params.transactionId;

     /***** Never trust users - validate input *****/
    const requiredFields = ['userIdClaimer'];
  
    const missingFields = requiredFields.filter(field => !(field in req.body));

    Transaction.findById(transId)
        .then(transaction => {
            if(transaction) {
                const transAmount = parseInt(transaction.transactionAmount, 10);
                User.findById(id)
                    .then(account => {
                        let newBalance = parseInt(account.accountBalance, 10) + transAmount;
                        User.findByIdAndUpdate(id, {accountBalance: newBalance})
                            .then(() => res.status(204).end())
                            .catch(err => console.error(`Error: ${err.message}`));
                    })
            }
            else {
                res.status(404).end(); // 404 handler
            }
        })
    .catch(err => {
        res.status(500).send({message: 'Internal Server Error'}); // error handler
    });
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
