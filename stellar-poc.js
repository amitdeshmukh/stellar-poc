// Import Stellar SDK
const StellarSdk = require('stellar-sdk');
// Connect to TestNet
StellarSdk.Network.useTestNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
// Import request
const rp = require('request-promise');
// Import Prompt Base
var Prompt = require('prompt-base')
// Import Prompt Radio
var Radio = require('prompt-radio');

// Create a new account
console.log('\n\n######### Welcome to Stellar! ########')
let pair = StellarSdk.Keypair.random();
console.log('.\n.\nCreating a new account for you.\nMake sure you save the public and secret keys!\n.\n')

// Output the Secret key and Public key
let publicKey = pair.publicKey();
let privateKey = pair.secret();
console.log('Public Key: ', publicKey);
console.log('Secret Key: ', privateKey);

// Add XLM to the new account via FriendBot
console.log('.\n.\nLets add some XLM to your new account ...\n.\n.')

rp({
  url: 'https://friendbot.stellar.org',
  qs: { addr: publicKey },
  json: true
})
  .then(txResult => {
    // The top-up was successful. Lets get account balances
    rp({
      url: 'https://horizon-testnet.stellar.org/accounts/' + publicKey,
      json: true
    })
      .then(accResult => {
        accResult.balances.forEach(B => {
          if (B.asset_type === 'native') {
            console.log('Account', publicKey, 'is credited with XLM', B.balance, '\n.\n.')
          }
          else {
            console.log('Account', publicKey, 'is credited with', B.asset_type,  B.balance)
          }
        })
        doPrompt()
      })
      .catch(err => {
        console.error('ERROR!', err); 
      })
  })
  .catch(err => {
    console.error('ERROR!', err);      
  })

// Provide a menu and options
var runStatus = true;
let prompt = new Radio({
  name: 'Menu',
  message: 'What would you like to do next?',
  choices: [
    'Check Your Account Balance',
    'Check Other Account Balance',
    'Make Payment',
    'Exit'
  ]
});

// Show menu
function doPrompt() {
  if (runStatus) {
    // async
    prompt.ask(answer => {
      if (answer === 'Exit') {
        runStatus = false
      }
      else if (answer === 'Check Your Account Balance') {
        checkBalance(publicKey)
      }
      else if (answer === 'Check Other Account Balance') {
        // Prompt for destination account
        var dst = '';    
        var dstPrompt = new Prompt({
          name: 'account',
          message: 'Please provide an account number:'
        });
        dstPrompt.ask( (answer) => {
          dst = answer
          // Check balance
          checkBalance(dst)
        })        
      }
      else if (answer === 'Make Payment') {
        var amt = ''  // The amount to be transferred
        var dst = ''  // Destination account address

        // Prompt for amount
        var amtPrompt = new Prompt({
          name: 'amount',
          message: 'What is the amount you wish to send?'
        });
        amtPrompt.ask( (answer) => {
          amt = answer
          // Prompt for destination account          
          var dstPrompt = new Prompt({
            name: 'destination',
            message: 'Enter destination account:'
          });
          dstPrompt.ask( (answer) => {
            dst = answer
            // Make payment
            makePayment(privateKey, dst, amt)
          })
        });
      }
      else (console.log('Not a valid answer'))
    });
  } else {
    process.exit()
  }  
}

// Check account balance
function checkBalance(key) {
  server.loadAccount(key)
  .then(account => {
    console.log('Balances for account: ' + key);
    account.balances.forEach(balance => {
      if (balance.asset_type === 'native') {
        currency = 'XLM'
      } else { currency = balance.asset_type}
      console.log('Type:', currency, ', Balance:', balance.balance, '\n.\n');
    })
    doPrompt()
  })
}

// Make payment
function makePayment(src, dst, amt) {
  console.log('Building transaction ...\n\n')
  var sourceKeys = StellarSdk.Keypair.fromSecret(src);
  var transaction;
  server.loadAccount(dst)
  .catch(StellarSdk.NotFoundError, (error) => {
    throw new Error('ERROR! Destination account does not exist.');
  })
  .then( () => {
    return server.loadAccount(sourceKeys.publicKey());
  })
  .then( (srcAccount) => {
    transaction = new StellarSdk.TransactionBuilder(srcAccount)
      .addOperation(StellarSdk.Operation.payment({
        destination: dst,
        asset: StellarSdk.Asset.native(),
        amount: amt
      }))
      .addMemo(StellarSdk.Memo.text('For Inclusivity'))
      .build();
    transaction.sign(sourceKeys);
    // Submit transaction
    return server.submitTransaction(transaction);
  })
  .then(function(result) {
    console.log('Successfully transferred XLM', amt, 'to', dst);
    console.log('Result:', result._links.transaction.href, '\n.\n.')
    doPrompt()
  })
  .catch( (error) => {
    console.error('ERROR!', error);
  })
}