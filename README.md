# avax-bridge

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This is a node.js JavaScript application that creates a bridge between two blockchains, for the purpose of transferring tokens between blockchains. The first version of this app targets the AVAX and BCH blockchains, but it can also work with the eCash (BCHA) blockchain as well. On the BCH and eCash blockchain, the focus is on the SLP token protocol.

Sending a token to this app on one chain, will cause the app to burn the tokens on that chain and re-mint them on the other chain. It does not work with general tokens, but only with specific tokens the app is set up to handle. The memo field is used to communicate the address where the newly-minted tokens should be sent.

Additional documenation can be found in the [docs folder](./docs)


## License
[MIT](./LICENSE.md)
