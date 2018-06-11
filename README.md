# Stellar Network client - Proof of Concept

This is proof of concept code using the Stellar Javascript SDK. It implements a client that creates a new account for the user on Testnet, asks [Friendbot](https://github.com/stellar/js-stellar-sdk/blob/master/docs/reference/api/friendbot.md) for test tokens, and then allows to check balances and make payments to accounts.

### Prerequisites

You will need [node.js](https://nodejs.org/en/) and [npm.js](https://www.npmjs.com/) installed.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
```
git clone https://github.com/amitdeshmukh/stellar-poc.git
cd stellar-poc
npm install
node stellar-poc.js
```

## Built With

* [StellarSDK](https://www.stellar.org/developers/js-stellar-sdk/reference/) - The Stellar JavaScript SDK

## Authors

* **Amit Deshmukh** - *Initial work* - [Amit Deshmukh](https://github.com/amitdeshmukh)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* The Stellar Foundation