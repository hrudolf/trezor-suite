# @trezor/webextension

This package will contain Trezor Connect Web Extension. For now it only has e2e tests.

## Dev

In order to build it with other popup src:

```
__TREZOR_CONNECT_SRC=https://suite.corp.sldev.cz/connect/develop/ yarn workspace @trezor/connect-webextension build
```

Or like bellow if you want to run connect from localhost:

```
__TREZOR_CONNECT_SRC=http://localhost:8088/ yarn workspace @trezor/connect-webextension build
```
