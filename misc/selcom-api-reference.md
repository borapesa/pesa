# Selcom Developers — API Reference

# Introduction

Welcome to the Selcom Developers!

Selcom Developer offers a set of Application Programming Interfaces (APIs) that gives you the ability to incorporate Selcom functionality into your projects.
Our API's are State of Art with complete security module and structured to meet Market needs.

We are excited to work with you to innovate on the next generation of applications using Selcom proprietary APIs. Each step below outlines what it takes to get your project off the ground. From finding a use case that meets your needs, to launching that project to your customers.

To access Selcom API endpoints for services like Utility Payments, Wallet Cashin and Qwiksend. One has to get in touch with our Teams (info@selcom.net). Our Developer Zone has language bindings in PHP, Java and Shell. Code examples are on the right side of the Panel, switching to different Programming language make use of the Tabs.

# Client Packages

Following are links to the client library code repositories on github and ways to install from online using package managers. For more information and source code visit the github pages.

## PHP

### Installation

composer require selcom/selcom-apigw-client

### Github Link

PHP GITHUB REPOSITORY

## JAVA

### Installation

Get Snippet for relevant package manager from https://central.sonatype.com/artifact/io.github.selcompaytechltd/apigwClient/1.0.3/overview

or
search for io.github.selcompaytechltd/apigwClient using package manager

### Github Link

JAVA GITHUB REPOSITORY

## CSHARP

### Installation

dotnet add package selcom-apigw-client

### Github Link

CSHARP GITHUB REPOSITORY

## PYTHON

### Installation

pip install selcom_apigw_client

### Github Link

PYTHON GITHUB REPOSITORY

## NODE.JS

### Installation

npm i selcom-apigw-client

### Github Link

NODE.JS GITHUB REPOSITORY

## WORDPRESS

### Installation

Download plugin and install

### Github Link

WORDPRESS GITHUB REPOSITORY

## WOOOCOMMERCE

### Installation

Download plugin and install

### Github Link

WOOOCOMMERCE GITHUB REPOSITORY

# Authentication

> To authorize, use this code:

```shell
# With shell, you can just pass the correct header with each request
curl "api_endpoint_here"
  -H "Content-type: application/json"
  -H "Authorization: SELCOM meowmeowmeow"
  -H "Digest-Method: HS256"
  -H "Digest: tW32A+O1FcpRj2o2mbWgF2r+vmILqqKwHqDryj+7lvI="
  -H "Timestamp: 2019-02-26T09:30:46+03:00"
  -H "Signed-Fields: utilityref,vendor,pin,transid,amount,msisdn"
  -d  '{"vendor":"BANKX", "pin":"3333", "utilityref":"075XXXXXXX", "transid":"T001", "amount":"1234", "msisdn":"25568XXXXXXX"}'
```

Selcom Developers uses API key and API secret to allow access to our APIs. Kindly reach out to our business team for further information on getting access

All API requests must be authenticated using your API Key and API Secret.

You must include the required HTTP headers and generate a cryptographic signature (Digest) for every request (GET or POST).

| Header        | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| Authorization | Base64-encoded API Key prefixed with SELCOM                                                  |
| Timestamp     | Datetime in ISO 8601 date format (YYYY-MM-DDThh:mm:ssTZD). Example 2019-02-26T09:30:46+03:00 |
| Digest-Method | Signature algorithm:HS256(HMAC-SHA256) orRS256(RSA-SHA256)                                   |
| Digest        | Base64-encoded signature of the request payload                                              |
| Signed-Fields | Comma-separated list of request parameter keys used to generate the signature                |

| Header        | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization | SELCOM <Base64(API_KEY)>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Timestamp     | Must match exactly what is used in signature generation.Time drift may cause request rejection.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Digest        | Signature (Digest) Generation:Step 1:Build Signing String Construct a string in this exact format: timestamp=&field1=value1&field2=value2&...Rules:Fields must follow the order in Signed-Fieldstimestamp is always included first (even if not listed in Signed-Fields)No extra spacesValues must match request payload exactlyStep 2:Generate Signature:Option A — HMAC (HS256):Digest = Base64( HMAC_SHA256(signing_string, API_SECRET) )Option B — RSA (RS256):Digest = Base64( RSA_SHA256(signing_string, PrivateKey) ) |
| Signed-Fields | Must match the exact order used in signing string.Case-sensitive.Only include request parameters (exclude timestamp).                                                                                                                                                                                                                                                                                                                                                                                                        |

Refer to the below example

`Authorization: SELCOM MjAyY2I5NjJhYzU5MDc1Yjk2NGIwNzE1MmQyMzRiNzA=`

`Digest-Method: HS256`

`Digest: tW32A+O1FcpRj2o2mbWgF2r+vmILqqKwHqDryj+7lvI=`

`Timestamp: 2019-02-26T09:30:46+03:00`

`Signed-Fields: utilitycode,utilityref,vendor,pin,transid,amount`

# API Response

> API responses for failure scenario

```json
{
  "transid": "F10001",
  "reference": "0289999288",
  "resultcode": "403",
  "result": "FAIL",
  "message": "No reponse from upstream system",
  "data": []
}
```

> API responses for Success scenario

```json
{
  "transid": "F10002",
  "reference": "0270720833",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Airtime recharge\nReference 0270720833\nPhone 0773820XXX\nAmount TZS 10,000\nVendor XYZVENDOR\n\nPowered by Selcom",
  "data": []
}
```

| Result     | Errorcode  | Description                                                                      |
| ---------- | ---------- | -------------------------------------------------------------------------------- |
| SUCCESS    | 000        | Transaction successful                                                           |
| INPROGRESS | 111,927    | Transaction in progress please query to know the exact status of the transaction |
| AMBIGOUS   | 999        | Transactions status unknown wait for recon                                       |
| FAIL       | All others | Transaction failed                                                               |

## Handling INPROGRESS and AMBIGUOUS Status Codes

If a transaction returns a status of `INPROGRESS` or `AMBIGUOUS`, follow the steps below:

1. Wait for 3 minutes before taking any action.
2. Invoke the Transaction Status Query API to check the latest status.
3. If the status remains unchanged:
     Repeat the query at 3-minute intervals for a reasonable retry window.
4. If the transaction still does not resolve after multiple attempts:
     Escalate the issue by contacting Selcom Contact Center at helpdesk@selcom.net

### Notes

- Avoid immediate retries to prevent duplicate processing.
- AMBIGUOUS typically indicates uncertain transaction outcome (e.g., network timeout).
- INPROGRESS indicates the transaction is still being processed on the backen.

# Utility Payments

The Utility Payment Request API from Selcom enables businesses to process payments for third-party service providers (utilities) such as electricity, water, TV subscriptions, and telecom services.
It acts as a payment aggregation layer, allowing your system to:

- Validate customer utility accounts
- Initiate payments
- Receive real-time or asynchronous transaction status

## Utility Payment Request

The Utility Payment Request API from Selcom allows merchants to initiate and process payments for various utility services through a single integration. It enables your system to:

- Submit customer payments to utility providers
- Use a utility reference (e.g., meter number, account number, phone number)
- Receive transaction status (immediate or via query API)
- This API is commonly used for bill payments, prepaid services, and subscriptions

> Utility Payment Request Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/utilitypayment/process' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,utilitycode,utilityref,amount,vendor,pin,msisdn" \
  -d '{
  "transid":"1218d5Qb",
  "utilitycode": "LUKU",
  "utilityref": "654944949",
  "amount":8000,
  "vendor":  "66546846845",
  "pin":"48585",
  "msisdn":"255055555555",
}'
```


### HTTP Request

`POST /v1/utilitypayment/process`

### JSON Payload Parameters

| Parameter   | Type      | Example     | Description                                                                                                                 |
| ----------- | --------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| transid     | Mandatory | XYZ123444   | Unique Transaction ID of the transaction                                                                                    |
| utilitycode | Mandatory | LUKU        | Transaction type that Identifies the Utility you are paying for. Refer toUtilitycode Definitions for UtilityPaymentssection |
| utilityref  | Mandatory | 01234567891 | Payment reference for the Utility service                                                                                   |
| amount      | Mandatory | 1000        | Transaction amount                                                                                                          |
| vendor      | Mandatory | 01234567891 | Float account identifier                                                                                                    |
| pin         | Mandatory | 01234567891 | Float account PIN                                                                                                           |
| msisdn      | Optional  | 01234567891 | End-user mobile number                                                                                                      |

## Utility Look Up

The Utility Lookup API from Selcom is used to validate and retrieve customer details before initiating a utility payment.
It ensures that the provided utility reference (e.g., meter number, account number, or phone number) is valid and returns relevant billing information.

> Utility Look Up Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/utilitypayment/lookup?utilitycode={utilitycode}&utilityref={utilityref}&transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: utilitycode,utilityref,transid"
```


### HTTP Request

`GET /v1/utilitypayment/lookup?utilitycode=LUKU&utilityref=XYZ123444&transid=1001`

### Query Parameters

| Parameter   | Type      | Example     | Description                                                                                                                                                            |
| ----------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| utilitycode | Mandatory | LUKU        | Utility Type Identifier                                                                                                                                                |
| utilityref  | Mandatory | 01234567891 | Payment reference for the utility                                                                                                                                      |
| transid     | Mandatory | XYZ123444   | Transaction ID to match request and response. Transid used for lookup can be used for transaction call. transid field cannot duplicate for multiple transaction calls. |

> Luku Lookup Sample response:

```json
{
  "reference": "6927759116",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "LUKU Confirmation\nFIROZ\nMeter# 4300071XXXX\n",
  "data": [
    {
      "name": "FIROZ MOH"
    }
  ]
}
```

> GEPG Lookup Sample response:

```json
{
  "reference": "6927768243",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "DAWASA\nName MNYANGA\nControl# 99104217XXXX\nTZS 5,000",
  "data": [
    {
      "name": "MNYANGA",
      "amount": "5000",
      "institution": "DAWASA",
      "type": "PART",
      "desc": "Bill Charges 2019-2"
    }
  ]
}
```

## Query Payment Status

> Query Payment Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/utilitypayment/query?transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid"
```


Query status of the Utility Payment or Bill Pay transaction in case of a timeout or ambigous response.

### HTTP Request

`GET /v1/utilitypayment/query?transid=XYZ123444`

### Query Parameters

| Parameter | Type      | Example   | Description                              |
| --------- | --------- | --------- | ---------------------------------------- |
| transid   | Mandatory | XYZ123444 | Unique Transaction ID of the transaction |

\*\*Note : Receipt data in response is present only for successful transactions and is dependent availability from thridparty FI

> Response Example

```json
{
  "messageId": "20200721001",
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Transaction successful",
  "data": [{ "receipt": "12344" }]
}
```

## Utilitycode Definitions for UtilityPayments

In the Selcom Utility Payments API, a `utilitycode` is a unique identifier that specifies the service provider and payment type you are targeting. It tells the gateway which utility/biller to route the transaction to.

### Utility Services

| Utilitycode | Ref Label | Ref Type       | Ref Eg.          | LookUp Avail | Description         |
| ----------- | --------- | -------------- | ---------------- | ------------ | ------------------- |
| LUKU        | Meter No  | Numeric(11)    | 01234567891      | Yes          | Prepaid Electricity |
| TOP         | Mobile No | Numeric(10,12) | 068XXXXXXX       | No           | Prepaid Airtime     |
| TUKUZA      | Meter No  | Numeric(11,16) | 01234567891      | Yes          | Prepaid Electricity |
| NCARD       | Card No   | Numeric(16)    | 8888111188881111 | Yes          | N-Card Top up       |

NHC and DAWASA has been migrated to GEPG. Please refer to `Government Payments` section below.

### TV Subscriptions

| Utilitycode | Ref Label                   | Ref Type       | Ref Eg.      | LookUp Avail | Description          |
| ----------- | --------------------------- | -------------- | ------------ | ------------ | -------------------- |
| DSTV        | Smartcard No                | Numeric(11)    | 01234567891  | Yes          | DSTV Subscriptions   |
| DSTVBO      | Smartcard No                | Numeric(11)    | 01234567891  | Yes          | DSTV Box Office      |
| AZAMTV      | Smartcard No                | Numeric(12)    | 012345678912 | Yes          | AZAMTV Subscriptions |
| STARTIMES   | Customer ID or Smartcard No | Numeric(10,11) | 01234567891  | Yes          | STARTIMES            |
| ZUKU        | Account No                  | Numeric(6)     | 012345       | Yes          | ZUKU Subscriptions   |

### Prepaid Internet

| Utilitycode | Ref Label  | Ref Type    | Ref Eg.     | LookUp Avail | Description                |
| ----------- | ---------- | ----------- | ----------- | ------------ | -------------------------- |
| SMILE       | Account No | Numeric(10) | 01234567891 | Yes          | SMILE 4G Internet          |
| ZUKUFIBER   | Account No | Numeric(6)  | 012345      | Yes          | ZUKU Fiber Internet        |
| TTCL        | Mobile No  | Numeric(10) | 01234567891 | No           | TTCL Prepaid and Broadband |

### Government Payments

| Utilitycode | Ref Label  | Ref Type    | Ref Eg.      | LookUp Avail | Description                                                        |
| ----------- | ---------- | ----------- | ------------ | ------------ | ------------------------------------------------------------------ |
| GEPG        | Control No | Numeric(12) | 991234567891 | Yes          | Goverment Bill Payment (150 Gov Enties including DAWASA, NHC, etc) |
| ZANMALIPO   | Control No | Numeric(12) | 991234567891 | Yes          | Goverment Bill Payment                                             |

### Travel & Ticket Booking

| Utilitycode | Ref Label   | Ref Type           | Ref Eg.     | LookUp Avail | Description      |
| ----------- | ----------- | ------------------ | ----------- | ------------ | ---------------- |
| PW          | Booking Ref | Numeric(5-10)      | 01234567891 | Yes          | Precision Air    |
| COASTAL     | Booking Ref | Numeric(8)         | 0123456     | Yes          | COASTAL Aviation |
| AURIC       | Booking Ref | Numeric(6)         | 012345      | Yes          | Auric Air        |
| ATCL        | Booking Ref | AlphaNumeric(6-10) | 2QCD123     | Yes          | Air Tanzania     |

### Investment & Pension Funds

| Utilitycode | Ref Label  | Ref Type   | Ref Eg.   | LookUp Avail | Description |
| ----------- | ---------- | ---------- | --------- | ------------ | ----------- |
| UTT         | Account No | Numeric(9) | 012345678 | Yes          | UTT Amis    |

### Merchant Payments (Over 20K Merchants)

| Utilitycode | Ref Label  | Ref Type           | Ref Eg.     | LookUp Avail | Description                            |
| ----------- | ---------- | ------------------ | ----------- | ------------ | -------------------------------------- |
| SELCOMPAY   | Account No | AlphaNumeric(6-20) | 01234567891 | Yes          | SelcomPay/Masterpass Merchant Payments |

# Wallet Cashin

The Wallet Cashin API in Selcom is used to credit (top up) a wallet/mobile money account from an external funding source such as mobile money, bank, or agent network. It enables systems to add funds into a registered wallet/mobile money balance that can later be used for payments, transfers, or settlements.

## Cashin Request

> Cashin Request Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/walletcashin/process' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,utilitycode,utilityref,amount,vendor,pin,msisdn" \
  -d '{
    "transid":"1218d5Qb",
    "utilitycode": "VMCASHIN",
    "utilityref": "0149449499",
    "amount" : 8000,
    "vendor" : "64654949",
    "pin" :  "3545846",
    "msisdn" : "01854595959"
}'
```


### HTTP Request

`POST /v1/walletcashin/process`

### JSON Payload Parameters

| Parameter   | Type      | Example     | Description                                                                                                                          |
| ----------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| transid     | Mandatory | XYZ123444   | Unique Transaction ID of the transaction                                                                                             |
| utilitycode | Mandatory | VMCASHIN    | Transaction type that Identifies the Wallet you are sending money to. Refer toUtilitycode Definitions for WalletCashinsection below. |
| utilityref  | Mandatory | 075XXXXXXX  | Mobile number that identifies the wallet (receiver)                                                                                  |
| amount      | Mandatory | 1000        | Transaction amount                                                                                                                   |
| vendor      | Mandatory | 01234567891 | Float account identifier                                                                                                             |
| pin         | Mandatory | 01234567891 | Float account PIN                                                                                                                    |
| msisdn      | Optional  | 06534567891 | End-user or initiator mobile number.(sender)                                                                                         |

## Wallet Cashin Name Look Up

> Wallet Cashin Name Lookup Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/walletcashin/namelookup?utilitycode={uitlitycode}&utilityref={utilityref}&transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: utilitycode,utilityref,transid"
```


> Wallet Cashin Name Lookup Sample response:

```json
{
  "reference": "6927759116",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Name fetch successful",
  "data": [
    {
      "name": "FIROZ MOH"
    }
  ]
}
```

### HTTP Request

`GET /v1/walletcashin/namelookup?utilitycode=VMCASHIN&utilityref=XYZ123444&transid=1001`

### Query Parameters

| Parameter   | Type      | Example        | Description                                                                                                                                                            |
| ----------- | --------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| utilitycode | Mandatory | VMCASHIN       | Utility Type Identifier                                                                                                                                                |
| utilityref  | Mandatory | 25575XXXXXXXXX | Mobile number associated with the wallet                                                                                                                               |
| transid     | Mandatory | XYZ123444      | Transaction ID to match request and response. Transid used for lookup can be used for transaction call. transid field cannot duplicate for multiple transaction calls. |

## Query Transaction Status

> Query Transaction Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/walletcashin/query?transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid"
```


Query status of the Walelt Cashin transaction in case of a timeout or ambigous response.

### HTTP Request

`GET /v1/walletcashin/query?transid=XYZ123444`

### Query Parameters

| Parameter | Type      | Example   | Description                              |
| --------- | --------- | --------- | ---------------------------------------- |
| transid   | Mandatory | XYZ123444 | Unique Transaction ID of the transaction |

\*\*Note : Receipt data in response is present only for successful transactions and is dependent availability from thridparty FI

> Response Example

```json
{
  "messageId": "20200721001",
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Transaction successful",
  "data": [{ "receipt": "12344" }]
}
```

## Utilitycode Definitions for WalletCashin

| Utilitycode | Category | Ref Label | Ref Type       | Ref Eg.    | LookUp Avail | Description                                                                         |
| ----------- | -------- | --------- | -------------- | ---------- | ------------ | ----------------------------------------------------------------------------------- |
| VMCASHIN    | Wallet   | Mobile No | Numeric(10,12) | 076XXXXXXX | No           | Vodacom Mpesa cashin                                                                |
| AMCASHIN    | Wallet   | Mobile No | Numeric(10,12) | 068XXXXXXX | Yes          | AirtelMoney cashin                                                                  |
| TPCASHIN    | Wallet   | Mobile No | Numeric(10,12) | 065XXXXXXX | Yes          | Mixx by Yas cashin                                                                  |
| EZCASHIN    | Wallet   | Mobile No | Numeric(10,12) | 077XXXXXXX | Yes          | EzyPesa cashin                                                                      |
| HPCASHIN    | Wallet   | Mobile No | Numeric(10,12) | 062XXXXXXX | Yes          | HaloPesa cashin                                                                     |
| TTCASHIN    | Wallet   | Mobile No | Numeric(10,12) | 073XXXXXXX | Yes          | TTCLPesa cashin                                                                     |
| CASHIN      | Wallet   | Mobile No | Numeric(10,12) | 073XXXXXXX | Yes          | All wallet cashin (selcom will automatically route the traffic based on MNP Lookup) |

# Selcom Pesa

## Selcom Pesa Cashin Request

> Selcom Pesa Cashin Request Sample

This API is allows you to transfer funds to a Selcom Pesa account, using either Selcom Pesa account number or mobile number.

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/selcompesa/cashin' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,utilityref,amount,vendor,pin,msisdn" \
  -d '{
    "transid":"1218d5Qb",
    "utilityref": "<selcom pesa account or mobile number>",
    "amount" : 8000,
    "vendor" : "64654949",
    "pin" :  "3545846",
    "msisdn" : "01854595959"
}'
```


### HTTP Request

`POST /v1/selcompesa/cashin`

### JSON Payload Parameters

| Parameter   | Type      | Example     | Description                                                |
| ----------- | --------- | ----------- | ---------------------------------------------------------- |
| transid     | Mandatory | XYZ123444   | Unique Transaction ID of the transactionsending money to.  |
| utilityref  | Mandatory | 075XXXXXXX  | Selcom Pesa account or mobile number                       |
| utilitycode | Static    | SPSCASHIN   | Selcom Pesa cashin static utility code                     |
| amount      | Mandatory | 1000        | Transaction amount                                         |
| vendor      | Mandatory | 01234567891 | Float account identifier                                   |
| pin         | Mandatory | 01234567891 | Float account PIN                                          |
| msisdn      | Optional  | 06534567891 | End-user or initiator mobile number.(Sender Mobile number) |

## Selcom Pesa Name Look Up

> Selcom Pesa Name Lookup Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/selcompesa/namelookup?utilityref={utilityref}&transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: utilityref,transid"
```


> Selcompesa Cashin Name Lookup Sample response:

```json
{
  "reference": "6927759116",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Name fetch successful",
  "data": [
    {
      "name": "FIROZ MOH"
    }
  ]
}
```

### HTTP Request

`GET  /v1/selcompesa/namelookup?transid=X12455&utilitref=<selcompesa account or mobile number>`

### Query Parameters

| Parameter  | Type      | Example      | Description                                                                                                                                                            |
| ---------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| utilityref | Mandatory | 25575XXXXXXX | Selcom Pesa account or mobile number                                                                                                                                   |
| transid    | Mandatory | XYZ123444    | Transaction ID to match request and response. Transid used for lookup can be used for transaction call. transid field cannot duplicate for multiple transaction calls. |

## Selcom Pesa Query Transaction Status

> Query Transaction Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/selcompesa/query?transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid"
```


Query status of the Selcompesa Cashin transaction in case of a timeout or ambigous response.

### HTTP Request

`GET /v1/selcompesa/query?transid=X12455`

### Query Parameters

| Parameter | Type      | Example   | Description                              |
| --------- | --------- | --------- | ---------------------------------------- |
| transid   | Mandatory | XYZ123444 | Unique Transaction ID of the transaction |

\*\*Note : Receipt data in response is present only for successful transactions and is dependent availability from thridparty FI

> Response Example

```json
{
  "messageId": "20200721001",
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Transaction successful",
  "data": [{ "receipt": "12344" }]
}
```

# POS/Agent Cashout

## Agent Cashout Process

> Agent Cashout Process Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/hudumacashin/process' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,utilitycode,utilityref,amount,vendor,pin,name" \
  -d '{
      "transid":"1218d5Qb",
    "utilitycode": "HUDUMACI",
    "utilityref": "0149449499",
    "amount" : 8000,
    "vendor" : "64654949",
    "pin" :  "3545846",
    "name" : "John Jon"
}'
```


> Cashout Sample response:

```json
{
  "reference": "6927759116",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "0312332222 Confirmed. You have received TZS 1,000 from VENDORXYZ. Dial *150*50# choose Selcom Huduma Cashout to cashout at any Selcom Huduma agent.",
  "data": []
}
```

The API allows thrid party businesses to send funds to a customer for a direct cashout option at Selcom Huduma agents. The API, upon debiting the float balance credits a temporary wallet of the customer on the Selcom platform, which the customer can access dialing `*150*50#` and selecting option 4 Selcom, ‘Huduma Cashout’. The customer can visit any Selcom Huduma agent, dial the shortcode, enter agent code and amount to complete the withdrawal process before receiving cash from Agent.

### HTTP Request

`POST /v1/hudumacashin/process`

### JSON Payload Parameters

| Parameter   | Type      | Example    | Description                                                                          |
| ----------- | --------- | ---------- | ------------------------------------------------------------------------------------ |
| transid     | Mandatory | XYZ123444  | Unique Transaction ID of the transaction                                             |
| utilitycode | Mandatory | HUDUMACI   | Transaction type that Identifies the type of cashout. Use HUDUMACI for Agent cashout |
| utilityref  | Mandatory | 075XXXXXXX | Mobile number of the customer whom the token/voucher will be send                    |
| amount      | Mandatory | 1000       | Transaction amount                                                                   |
| vendor      | Mandatory | VENDORXYZ  | Float account identifier                                                             |
| pin         | Mandatory | 3122       | Float account PIN                                                                    |
| name        | Optional  | John Mushi | Name of the customer                                                                 |

## Transaction Status Query

> Query Transaction Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/hudumacashin/query?transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid"
```


Query status of the POS/Agent Cashout transaction in case of a timeout or ambigous response.

### HTTP Request

`GET /v1/hudumacashin/query?transid=XYZ123444`

## Utilitycode Definitions for Agent Cashout

| Utilitycode | Category | Ref Label | Ref Type       | Ref Eg.    | LookUp Avail | Description       |
| ----------- | -------- | --------- | -------------- | ---------- | ------------ | ----------------- |
| HUDUMACI    | Agent    | Mobile No | Numeric(10,12) | 076XXXXXXX | No           | POS/Agent cashout |

# Float Account Management

## Get Float Balance

> Get Float Balance Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST "http://example.com/v1/vendor/balance" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields:vendor,pin,transid"\
  -d '{"vendor":"12186889","pin" : "123456","transid" :"001"}
```


Get available balance from float account.

### HTTP Request

`POST /v1/vendor/balance`

### JSON Payload Parameters

| Parameter | Type      | Example     | Description              |
| --------- | --------- | ----------- | ------------------------ |
| vendor    | Mandatory | 01234567891 | Float account identifier |
| pin       | Mandatory | 01234567891 | Float account PIN        |
| transid   | Mandatory | A1234       | Unique transaction ID    |

> Balance Sample response:

```json
{
  "reference": "6927759116",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Balance successful",
  "data": [
    {
      "balance": "1000000"
    }
  ]
}
```

# C2B/Collection Services

This is a realtime API which is invoked when a payment is received from one of Selcom channels to be posted to third party systems. Channels include mobile wallets, bank accounts, POS and non-POS Selcom Huduma/Huduma+ agents. The API is intiated from Selcom Gateway notifying third party system.

## Authentication C2B

All requests will include authentication token “Bearer $token” in header. Token will be shared by 3rd party. The authentication method for this API is different the one description at the first section of the documentation as its consumed by Selcom Gateway from thirdparty.

`Authorization: Bearer lfksa823wera342o23`,
`Content-Type: application/json`

## Payment Lookup

Payment lookup leg, verify amount, utility reference, phone number etc.

### Request Format

`POST /lookup HTTP/1.1`

| Parameter  | Type      | Example     | Description                                                                                                                                                |
| ---------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| operator   | Available | AIRTELMONEY | Name of the channel. Values passed for mobile wallet originating transactions (AIRTELMONEY, MPESA-TZ, TIGOPESATZ, HALOPESATZ, TTCLMOBILE and ZANTELEZPESA) |
| transid    | Available | XYZ123444   | Unique Transaction ID of the transaction                                                                                                                   |
| reference  | Available | 033XX12211  | Unique transaction Identifier from Selcom Gateway                                                                                                          |
| utilityref | Available | AB12345     | Payment reference or account number from business who will recieve the funds                                                                               |
| msisdn     | Available | 06534567891 | End-user or initiator mobile number.                                                                                                                       |

### Expected Response Format

| Response Field | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| reference      | Same value as in request                                                                          |
| resultcode     | Error codes. Refer toExpected Error codes from thirdpary businessessection for better guideness   |
| result         | Transaction status. SUCCESS ro FAILED. This value is not used.                                    |
| message        | Error description                                                                                 |
| name           | Name of the customer associated with the account or utilityref (Optional)                         |
| amount         | Amount associated with the reference. If the amount is fixed for the payment requested (Optional) |

## Payment Validation

Payment validation leg, verify amount, utility reference, phone number etc. A timeout or failure from this API return failure to the source channel and auto reverse the funds.

### Request Format

`POST /validation HTTP/1.1`

| Parameter  | Type      | Example     | Description                                                                                                                                                |
| ---------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| operator   | Available | AIRTELMONEY | Name of the channel. Values passed for mobile wallet originating transactions (AIRTELMONEY, MPESA-TZ, TIGOPESATZ, HALOPESATZ, TTCLMOBILE and ZANTELEZPESA) |
| transid    | Available | XYZ123444   | Unique Transaction ID of the transaction                                                                                                                   |
| reference  | Available | 033XX12211  | Unique transaction Identifier from Selcom Gateway                                                                                                          |
| utilityref | Available | AB12345     | Payment reference or account number from business who will recieve the funds                                                                               |
| amount     | Available | 1000        | Transaction amount                                                                                                                                         |
| msisdn     | Available | 06534567891 | End-user or initiator mobile number.                                                                                                                       |

### Expected Response Format

| Response Field | Description                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| reference      | Same value as in request                                                                        |
| resultcode     | Error codes. Refer toExpected Error codes from thirdpary businessessection for better guideness |
| result         | Transaction status. SUCCESS ro FAILED. This value is not used.                                  |
| message        | Error description                                                                               |
| name           | Name of the customer associated with the account or utilityref (Optional)                       |

## Payment Notification

Payment confirmation after successful validation. The payload is exactly same as validate api. A timeout or no response from this API return not auto reverse funds on the source channel, transactions will be held on ambiguous status for manual recon process to be completed.

### Request Format

`POST /notification HTTP/1.1`

| Parameter  | Type      | Example     | Description                                                                                                                                                |
| ---------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| operator   | Available | AIRTELMONEY | Name of the channel. Values passed for mobile wallet originating transactions (AIRTELMONEY, MPESA-TZ, TIGOPESATZ, HALOPESATZ, TTCLMOBILE and ZANTELEZPESA) |
| transid    | Available | XYZ123444   | Unique Transaction ID from the channel                                                                                                                     |
| reference  | Available | 033XX12211  | Unique transaction Identifier from Selcom Gateway                                                                                                          |
| utilityref | Available | AB12345     | Payment reference or account number from business who will recieve the funds                                                                               |
| amount     | Available | 1000        | Transaction amount                                                                                                                                         |
| msisdn     | Available | 06534567891 | End-user or initiator mobile number.                                                                                                                       |

### Expected Response Format

| Response Field | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- |
| reference      | Same value as in request                                                                       |
| resultcode     | Error codes. Refer toExpected Error codes from thirdparty businesssection for better guideness |
| result         | Transaction status. SUCCESS ro FAILED. This value is not used.                                 |
| message        | Error description                                                                              |

## Expected Error codes from thirdparty business

| Error Code | Meaning                                           |
| ---------- | ------------------------------------------------- |
| 000        | Success.                                          |
| 010        | Invalid account or payment reference (utilityref) |
| 012        | Invalid amount                                    |
| 014        | Amount too high                                   |
| 015        | Amount too low                                    |
| 4XX        | for other failure cases from your system.         |

## Wallet Pull Funds (Push USSD)

This API is used to trigger or push the USSD menu of a given wallet with a PIN entry request. A success response from this API shall not mean the customer wallet has been debited; it only means that the customer's wallet provider returned a successful response to a push request. The business will be notified of the transaction having been completed through usual C2B notification means.

### HTTP Request

`POST /v1/wallet/pushussd`

### JSON Payload Parameters

| Parameter  | Type      | Example     | Description                                                                                   |
| ---------- | --------- | ----------- | --------------------------------------------------------------------------------------------- |
| transid    | Mandatory | XYZ123444   | Unique Transaction ID of the transaction                                                      |
| utilityref | Mandatory | AB12345     | Payment reference or account number from business who will recieve the funds or paid against  |
| amount     | Mandatory | 1000        | Transaction amount                                                                            |
| vendor     | Mandatory | 01234567891 | Float account identifier                                                                      |
| msisdn     | Mandatory | 06534567891 | Wallet mobile number to which push ussd should be triggered to complate wallet authentication |

## Query C2B Transaction Status

> Sample response:

```json
{
  "reference": "6927759116",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "   | COMPLETE | CONFIRMED | Payment successful\nUtility 255620685292\nAmt TZS 15,000\nTransID NBCBULK-0000024388-154\nReference 0406046312\n#RunsOnSelcom",
  "data": []
}
```

This API is used to check the status of a C2B transaction using Selcom unique reference. The reference returned during `Wallet Pull funds (Push USSD)` API or Selcom reference passed during validation. In cases when transaction notification is not received for a succcessfully validated c2b collection transaction clients can check the status of the transaction against Selcom gateway.

### HTTP Request

`GET /v1/c2b/query-status`

### JSON Payload Parameters

| Parameter | Type                                   | Example   | Description                                                  |
| --------- | -------------------------------------- | --------- | ------------------------------------------------------------ |
| transid   | Mandatory (Optional if reference used) | XYZ123444 | Unique Transaction ID of the transaction from Selcom Gateway |
| reference | Mandatory (Optional if transid used)   | XYZ123444 | Unique Reference of the transaction from Selcom Gateway      |

### Status Response

| Response Field | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- |
| reference      | Same value as in request                                                                       |
| resultcode     | Error codes. Refer toExpected Error codes from thirdparty businesssection for better guideness |
| result         | Transaction status. SUCCESS ro FAILED. This value is not used.                                 |
| message        | Error description                                                                              |

# Qwiksend

Qwiksend is a Selcom's bank disbursement product for FI and other institutions to send money to a bank.

## Bank Transfer

> Bank Transfer Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/qwiksend/process' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,srecipientFiCode,recipientAccount,recipientName,senderAccount,senderName,amount,vendor,pin,msisdn,remarks" \
  -d '{"transid":"1218d5Qb",
    "recipientFiCode": "AKIBA",
    "recipientAccount" : "000000040000",
    "recipientName" : "Jon Jon",
    "senderAccount" :  "3545846654",
    "senderName" : "Jil Jill",
    "amount" : 8000,
    "vendor" :  "3545846",
    "pin" : "09959",
    "msisdn" : "0101855855",
    "remarks" :  "None",
    }'
```


### HTTP Request

`POST /v1/qwiksend/process`

### JSON Payload Parameters

| Parameter        | Type      | Example      | Description                                                                     |
| ---------------- | --------- | ------------ | ------------------------------------------------------------------------------- |
| transid          | Mandatory | XYZ123444    | Unique Transaction ID of the transaction                                        |
| recipientFiCode  | Mandatory | AKIBA        | Destination bank shortocde. Refer toList of Bank Short Namessection             |
| recipientAccount | Mandatory | 1234567890   | Destination account number                                                      |
| recipientName    | Mandatory | ROBERT MUSHI | Source account holder name                                                      |
| senderAccount    | Mandatory | 01234567891  | Source account number or Unique identifier of the sender on the source platform |
| senderName       | Mandatory | ROBERT MUSHI | Source account holder name                                                      |
| amount           | Mandatory | 1000         | Transaction amount                                                              |
| vendor           | Mandatory | BANKX        | Float account identifier ( Used to identify the source service provider)        |
| pin              | Mandatory | 4343         | Float account PIN                                                               |
| msisdn           | Mandatory | 01234567891  | Sender mobile number                                                            |
| purpose          | Mandatory | GIFT         | Purpose of the transfer                                                         |
| remarks          | Optional  | Salary       | Purpose of the payment or payment description                                   |

## Account Name Lookup

> Account Name Lookup SAmple

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/qwiksend/lookup/?bank={bank}&account={account}&transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: bank,account,transid"
```


### HTTP Request

`GET /v1/qwiksend/lookup/?bank=AKIBA&account=XYZ123444&transid=1001`

### Query Parameters

| Parameter | Type      | Example   | Description                                                                                                                                                            |
| --------- | --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bank      | Mandatory | AIBA      | Bank short name                                                                                                                                                        |
| account   | Mandatory | XYZ123444 | Account number                                                                                                                                                         |
| transid   | Mandatory | XYZ123444 | Transaction ID to match request and response. Transid used for lookup can be used for transaction call. transid field cannot duplicate for multiple transaction calls. |

.

## Query Transaction Status Qwiksend

> Query Transaction Status Qwiksend Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/qwiksend/query?transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid"
```


Query status of the Qwiksend transaction in case of a timeout or ambigous response.

### HTTP Request

`GET/v1/qwiksend/query?transid=XYZ123444`

### Query Parameters

| Parameter | Type      | Example   | Description                              |
| --------- | --------- | --------- | ---------------------------------------- |
| transid   | Mandatory | XYZ123444 | Unique Transaction ID of the transaction |

## List of Bank Short Names

| Bank Name                              | Look Up Available | Bank Shortcode |
| -------------------------------------- | ----------------- | -------------- |
| ABSA BANK                              | Yes               | ABSA           |
| SELCOM MICROFINANCE BANK / Selcom Pesa | Yes               | SPSCASHIN      |
| AKIBA COMMERCIAL BANK                  | Yes               | AKIBA          |
| AMANA BANK                             | Yes               | AMANABANK      |
| AZANIA BANCORP BANK                    | Yes               | AZANIA         |
| ACCESS BANK TANZANIA                   | Yes               | BANCABC        |
| BANK OF AFRICA (TANZANIA) LTD          | Yes               | BOA            |
| BANK OF BARODA (T) LTD                 | Yes               | BANKOFBARODA   |
| BANK OF INDIA (T) LTD                  | Yes               | BANKOFINDIA    |
| CHINA DASHENG BANK LTD                 | Yes               | CHINADASHENG   |
| CITIBANK TANZANIA LIMITED              | Yes               | CITIBANK       |
| CRDB BANK LIMITED                      | Yes               | CRDBBANK       |
| DCB COMMERCIAL BANK                    | Yes               | DCBBANK        |
| DIAMOND TRUST BANK                     | Yes               | DTB            |
| ECOBANK TANZANIA LTD                   | Yes               | ECOBANK        |
| EQUITY BANK (T) LTD                    | Yes               | EQUITYBANK     |
| EXIM BANK                              | Yes               | EXIMBANK       |
| FINCA MICROFINANCE BANK                | Yes               | FINCA          |
| GUARANTY TRUST BANK TANZANIA LTD       | Yes               | GTBANK         |
| HABIB AFRICAN BANK                     | Yes               | HABIBBANK      |
| I&M BANK (T) LTD                       | Yes               | IMBANK         |
| INTERNATIONAL COMMERCIAL BANK (T)      | Yes               | ICB            |
| KCB BANK TANZANIA LIMITED              | Yes               | KCB            |
| COOP BANK TANZANIA                     | Yes               | KILIMANJARO    |
| LETSHEGO BANK TANZANIA LTD             | Yes               | LETSHEGO       |
| MAENDELEO BANK                         | Yes               | MAENDELEO      |
| MKOMBOZI COMMERCIAL BANK PUBLIC LTD    | Yes               | MKOMBOZI       |
| MWALIMU COMMERCIAL BANK OF TANZANIA    | Yes               | MWALIMU        |
| MWANGA HAKIKA MICROFINANCE BANK        | Yes               | MWANGA         |
| NATIONAL MICROFINANCE BANK             | Yes               | NMB            |
| NBC LIMITED                            | Yes               | NBC            |
| NCBA BANK TANZANIA LTD                 | Yes               | NCBA           |
| PEOPLE'S BANK OF ZANZIBAR              | Yes               | PBZ            |
| STANBIC BANK TANZANIA                  | Yes               | STANBIC        |
| TANZANIA COMMERCIAL BANK PLC           | Yes               | TCB            |
| UCHUMI COMMERCIAL BANK                 | Yes               | UCHUMI         |
| UNITED BANK FOR AFRICA                 | Yes               | UBA            |

# VCN

## Create VCN

> Create VCN Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/vcn/create' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: msisdn,account,first_name,last_name,middle_name,gender,dob,address,city,region,nationality,validity,email,language"
  -d '{"msisdn":"25577XXXXXXXX", "account" : "013222244", "first_name":"ROBERT", "last_name":"MUSHI", "middle_name":"E", "gender":"MALE", "dob":"07112988", "address": "Plot no 99, UN Road", "city": "Dar es Salaam", "region":"Dar es Salaam", "nationality": "TANZANIAN", "validity": "12", "email":"robert@example.com", "language":"en", "vendor":"XYZBANK", "pin":"4321", "product_code": "AAVCN001"}
```


### HTTP Request

`POST /v1/vcn/create`

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "VCN creation success",
  "data": {
    "card_id": "0000021111",
    "masked_card": "533322******0320",
    "card_url": "dfnldafalnfalnalfnaln"
  }
}
```

### JSON Payload Parameters

| Parameter      | Type      | Example           | Description                                                                                                |
| -------------- | --------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| msisdn         | Mandatory | 255781234567      | Customer mobile number in international format(must be a valid TZ mobile number)                           |
| account        | Mandatory | 013222244         | Wallet Account number or Bank account number                                                               |
| first_name     | Mandatory | ROBERT            | First name of the customer                                                                                 |
| last_name      | Mandatory | MUSHI             | Last name of the customer                                                                                  |
| middle_name    | Optional  | E                 | Middle name of the customer                                                                                |
| gender         | Mandatory | MALE              | Gender. Must be MALE or FEMALE                                                                             |
| dob            | Mandatory | 11071987          | Date of Birth (DDMMYYYY format)                                                                            |
| address        | Mandatory | Mktaba St, Upanga | Street and Area                                                                                            |
| city           | Mandatory | Dar es Salaam     | City of residence                                                                                          |
| region         | Optional  | Dar es Salaam     | Region                                                                                                     |
| nationality    | Mandatory | Tanzanian         | Nationality                                                                                                |
| validity       | Optional  | 12                | No fo months the VCN should be valid, after which it will expire. Must be 6 , 12 or 24, Default 24 months. |
| email          | Optional  | test@example.com  | Email address                                                                                              |
| language       | Optional  | sw                | Customer language preference (to personalize responses). en for english and sw for kswahili.               |
| marital_status | Optional  | SINGLE            | Marital status MARRIED, SINGLE, DIVORCED, WIDOW                                                            |
| maiden_name    | Optional  | EPHRAIM           | Mothers maiden name                                                                                        |
| vendor         | Mandatory | XTZBANK           | Float account identifier                                                                                   |
| pin            | Mandatory | 4321              | Float account PIN                                                                                          |
| transid        | Mandatory | XYZ123444         | Unique Transaction ID of the transaction (Required as the vendor will be shared the fee)                   |
| product_code   | Optional  | AAVCN001          | A static product code assigned for the VCN product specific to the issuer                                  |

## Create VCN Status Enquiry

> Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/vcn/create-status-enquiry?msisdn={msisdn}&transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: msisdn,transid"
```


The API is used to get the VCN card creation status. No sms will be triggered to end customer on using this API

### HTTP Request

`GET /v1/vcn/create-status-enquiry?msisdn=25577XXXXXXXX&transid=T1000932222`

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "VCN creation success",
  "data": {
    "card_id": "0000021111",
    "masked_card": "533322******0320",
    "card_url": "dfnldafalnfalnalfnaln"
  }
}
```

### JSON Payload Parameters

| Parameter | Type      | Example      | Description                                                                                                    |
| --------- | --------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| transid   | Mandatory | A1234        | Unique transaction ID                                                                                          |
| msisdn    | Mandatory | 255781234567 | Customer mobile number using during VCN registration in international format(must be a valid TZ mobile number) |

## Block/Unblock/Suspend Card (Change Status)

> Block/Unblock/Suspend Card (Change Status) Sample

```shell
# With shell, you can just pass the correct header with each request
curl "api_endpoint_here"
  -H "Authorization: SELCOM {authorization-token}"
  -H "Digest-Method: {digest-token}"
  -H "Digest: {digest}"
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}"
  -H "Signed-Fields: msisd,account,status,remarks"
  -d '{"msisdn":"25577XXXXXXXX", "account":"T1000932222", "status":"BLOCK", "remarks":"LOST"}
```


### HTTP Request

`POST /v1/vcn/changestatus`

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "VCN status change successful",
  "data": {
    "new_status": "BLOCKED"
  }
}
```

### JSON Payload Parameters

| Parameter | Type      | Example      | Description                                                                                                                                              |
| --------- | --------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| msisdn    | Mandatory | 255781234567 | Customer mobile number using during VCN registration in international format(must be a valid TZ mobile number)                                           |
| account   | Mandatory | T1000932222  | Wallet Account number or Bank account number                                                                                                             |
| status    | Mandatory | BLOCK        | New status of the card to be set. Must be BLOCK or UNBLOCK or SUSPEND. SUSPEND status ends the card's life cycle.                                        |
| remarks   | Optional  | LOST         | Reason for change status (from customer)                                                                                                                 |
| card_id   | Optional  | 0113322      | Unique card ID return on create API call. Required only One customer with multiple card scenario and when multiple product allocated for the same issuer |
| requestid | Mandatory | XYZ123444    | Unique Request ID for the request (this is not transid as its not a financial transaction on Selcom side)                                                |
| language  | Optional  | SW           | Language to use for SMS response to end customer (EN - English, SW - Swahili)                                                                            |

## Show Card

> Show Card Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/vcn/show' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: msisdn,account"
  -d '{"msisdn":"25577XXXXXXXX", "account":"T1000932222"}''
```


API is used to push VCN card info to the customer by delivering a secure link to the customer

### HTTP Request

`POST /v1/vcn/show`

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "VCN details sent to customer msisdn",
  "data": {}
}
```

### JSON Payload Parameters

| Parameter | Type      | Example      | Description                                                                                                                                               |
| --------- | --------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| msisdn    | Mandatory | 255781234567 | Customer mobile number using during VCN registration in international format(must be a valid TZ mobile number)                                            |
| account   | Mandatory | T1000932222  | Account number of the VCN returned on create api call                                                                                                     |
| card_id   | Optional  | 0113322      | Unique card ID return on create API call. Required only One customer with multiple card scenario and when multiple product allocation for the same issuer |
| requestid | Mandatory | XYZ123444    | Unique Request ID for the request (this is not transid as its not a financial transaction on Selcom side)                                                 |
| language  | Optional  | SW           | Language to use for SMS response to end customer (EN - English, SW - Swahili)                                                                             |

## Get Card Status

> Get Card Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/vcn/status?msisdn={msisdn}&account={account}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: msisdn,account"
```


The API is used to get the current VCN card status. No sms will be triggered to end customer on using this API

### HTTP Request

`GET /v1/vcn/status?msisdn=25577XXXXXXXX&account=T1000932222`

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "VCN status fetch successful",
  "data": [
    {
      "masked_card": "512342XXXXXX1234",
      "status": "UNBLOCKED"
    }
  ]
}
```

### JSON Payload Parameters

| Parameter | Type      | Example      | Description                                                                                                    |
| --------- | --------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| msisdn    | Mandatory | 255781234567 | Customer mobile number using during VCN registration in international format(must be a valid TZ mobile number) |
| account   | Mandatory | T1000932222  | Account number of the VCN returned on create api call                                                          |

## Set Transaction Limit

> Set Transaction Limit Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/vcn/set-limit' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: msisd,account,status,remarks"
  -d '{"msisdn":"25577XXXXXXXX", "account":"T1000932222", "limit_amount":"100000", "limit_type":"DAILY"}
```


Set transaction limit for ecommerce transactions for the VCN

### HTTP Request

`POST /v1/vcn/set-limit`

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Limit set successful",
  "data": [{}]
}
```

### JSON Payload Parameters

| Parameter    | Type      | Example      | Description                                                                                                                                              |
| ------------ | --------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| msisdn       | Mandatory | 255781234567 | Customer mobile number using during VCN registration in international format(must be a valid TZ mobile number)                                           |
| account      | Mandatory | T1000932222  | Wallet Account number or Bank account number                                                                                                             |
| limit_amount | Mandatory | 100000       | Limit amount.                                                                                                                                            |
| limit_type   | Mandatory | MONTHLY      | Transaction limit period/type (Supported types DAILY, MONTHLY, TRANSACTION)                                                                              |
| card_id      | Optional  | 0113322      | Unique card ID return on create API call. Required only One customer with multiple card scenario and when multiple product allocated for the same issuer |

# Checkout API

This allows you to consume selcom's payment gateway for a complete ecommerce check process that supports Masterpass, Debit/Credit cards (Master, VISA. Amex), Mobile Money pull payments etc. Refer to the below process flow.

On demand subcription or stored card payment flow.

## Create Order

> Create Order Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/checkout/create-order' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: vendor,order_id,buyer_email,buyer_name,buyer_user_id,buyer_phone,buyer_gateway_token,amount,currency,payment_methods,redirect_url,cancel_url,webhook,billing.firstname,billing.lastname,billing.address_1,billing.address_2,billing.city,billing.state_or_region,billing.postcode_or_pobox,billing.country,billing.email, billing.phone,shipping.firstname,shipping.lastname,shipping.address_1, shipping.address_2,shipping.city,shipping.state_or_region,shipping.country,shipping.email,shipping.phone,payer_remarks,merchant_remarks,no_of_items_items" \
  -d '{
  "vendor":"12323232",
  "order_id":"121212",
  "buyer_email": "",
  "buyer_name": "",
  "buyer_user_id": "",
  "buyer_phone": "",
  "gateway_buyer_uuid": "",
  "amount":  8000,
  "currency":"TZS",
  "payment_methods":"ALL",
  "redirect_url":"URL",
  "cancel_url":"URL",
  "webhook":"URL",
  "billing":   {
    "firstname" : "John",
    "lastname" : "Doe",
    "address_1" : "969 Market",
    "address_2" : "",
    "city" : "San Francisco",
    "state_or_region" : "CA",
    "postcode_or_pobox" : "94103",
    "country" : "US",
    "phone" : "255082852526"
  },
  "shipping":   {
    "firstname" : "John",
    "lastname" : "Doe",
    "address_1" : "969 Market",
    "address_2" : "",
    "city" : "San Francisco",
    "state_or_region" : "CA",
    "postcode_or_pobox" : "94103",
    "country" : "US",
    "phone" : "255082852526"
  },
  "buyer_remarks":"None",
  "merchant_remarks":"None",
  "no_of_items":  3

}'
```


Create a new order post checkout from your ecommerce website. Card payments with no billing info will get rejected. Note: All urls in the request and response are base64 encoded.

### HTTP Request

`POST /v1/checkout/create-order`

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Payment notification logged",
  "data": [{ "gateway_buyer_uuid": "12344321", "payment_token": "80008000", "qr": "QR", "payment_gateway_url": "http:example.com/Ahesmey" }]
}
```

### JSON Payload Parameters

| Parameter                  | Type      | Example              | Description                                                                                                                    |
| -------------------------- | --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| vendor                     | Mandatory | SHOP203              | Vendor/Merchant ID allocated by Selcom                                                                                         |
| order_id                   | Mandatory | 123                  | Order id that uniquely identifies the order                                                                                    |
| buyer_email                | Mandatory | customer@example.com | Buyer email                                                                                                                    |
| buyer_name                 | Mandatory | Joe John             | Buyer's full name                                                                                                              |
| buyer_userid               | Option    | joejohn20            | Buyers unique user-id in the thridparty ecommerce website. Should be empty for guest check                                     |
| buyer_phone                | Mandatory | 255781234XXX         | Buyers msisdn                                                                                                                  |
| gateway_buyer_uuid         | Option    | A1233232             | Used to display stored card in the payment process. The field is returned first time the user creates an order                 |
| amount                     | Mandatory | 5000                 | Order amount                                                                                                                   |
| currency                   | Mandatory | TZS                  | International currency code TZS, USD                                                                                           |
| payment_methods            | Mandatory | ALL                  | Has to be comma separated list of ALL, MASTERPASS, CARD, MOBILEMONEYPULL                                                       |
| redirect_url               | Optional  | aHR0cDovL3VybC5jb20= | Base64 encoded thirdparty ecommerce page url that the customer should be redirected after payment process is complete          |
| cancel_url                 | Optional  | aHR0cDovL3VybC5jb20= | Base64 encoded thirdparty ecommerce page url that the customer should be redirected when payment process canceled by the buyer |
| webhook                    | Optional  | aHR0cDovL3VybC5jb20= | Base64 encoded webhook callback url to recieve API call back of the payment status                                             |
| billing.firstname          | Mandatory | Joe                  | First name - Payment Billing info                                                                                              |
| billing.lastname           | Mandatory | John                 | Last name - Payment Billing info                                                                                               |
| billing.address_1          | Mandatory | 23, street X         | Address 1 - Payment Billing info                                                                                               |
| billing.address_2          | Optional  | Upanga Area          | Address 2 - Payment Billing info                                                                                               |
| billing.city               | Mandatory | Dar es salaam        | City - Payment Billing info                                                                                                    |
| billing.state_or_region    | Mandatory | Dar es Salaam        | Region - Payment Billing info                                                                                                  |
| billing.postcode_or_pobox  | Mandatory | 43434                | PO Box- Payment Billing info                                                                                                   |
| billing.country            | Mandatory | TZ                   | International Country code - Payment Billing info                                                                              |
| billing.phone              | Mandatory | 25578123XXXX         | Phone - Payment Billing info                                                                                                   |
| shipping.firstname         | Optional  | Joe                  | First name - Payment Billing info                                                                                              |
| shipping.lastname          | Optional  | John                 | Last name - Payment Billing info                                                                                               |
| shipping.address_1         | Optional  | 23, street X         | Address 1 - Payment Billing info                                                                                               |
| shipping.address_2         | Optional  | Upanga Area          | Address 2 - Payment Billing info                                                                                               |
| shipping.city              | Optional  | Dar es salaam        | City - Payment Billing info                                                                                                    |
| shipping.state_or_region   | Optional  | Dar es Salaam        | Region - Payment Billing info                                                                                                  |
| shipping.postcode_or_pobox | Optional  | 43434                | PO Box- Payment Billing info                                                                                                   |
| shipping.country           | Optional  | TZ                   | International Country code - Payment Billing info                                                                              |
| shipping.phone             | Optional  | 25578123XXXX         | Phone - Payment Billing info                                                                                                   |
| buyer_remarks              | Optional  | 255781234567         | Payer remark/decription for the order                                                                                          |
| merchant_remarks           | Optional  | 255781234567         | Buyer remark/decription for the order                                                                                          |
| no_of_items                | Mandatory | 255781234567         | No of items in the order                                                                                                       |
| header_colour              | Optional  | #FF0012              | Payment gateway page header colour                                                                                             |
| link_colour                | Optional  | #FF0012              | Payment gateway page link text colour                                                                                          |
| button_colour              | Optional  | #FF0012              | Payment gateway page button colour                                                                                             |
| expiry                     | Optional  | 60                   | Expiry in minutes                                                                                                              |

## Create Order - Minimal

> Create Order - Minimal Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/checkout/create-order-minimal' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: vendor,order_id,buyer_email,buyer_name,buyer_user_id,buyer_phone,amount,currency,payment_methods,webhook,payer_remarks,merchant_remarks,order_items" \
  -d '{
  "vendor":"12323232",
  "order_id":"121212",
  "buyer_email": "john@example.com",
  "buyer_name": "John Joh",
  "buyer_phone": "255682XXXXXX",
  "amount":  8000,
  "currency":"TZS",
  "webhook":"https://merchantdomain.com/process-order/121212",
  "buyer_remarks":"None",
  "merchant_remarks":"None",
  "no_of_items":  1

}'
```


Create a new order post checkout from your ecommerce website for non-card payments. This api cannot be used for card payments. Card payment option wont be displayed on the payment gateway page after redirection. Ideal for mobile wallet push payments and manual payments when merchant is capable of presenting the payment token or qr code to the customer. Note: All urls in the request and response are base64 encoded.

### HTTP Request

`POST /v1/checkout/create-order-minimal`

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Payment notification logged",
  "data": [{ "gateway_buyer_uuid": "12344321", "payment_token": "80008000", "qr": "QR", "payment_gateway_url": "aHR0cDpleGFtcGxlLmNvbS9wZy90MTIyMjI=" }]
}
```

### JSON Payload Parameters

| Parameter        | Type      | Example              | Description                                                                                                                    |
| ---------------- | --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| vendor           | Mandatory | SHOP203              | Vendor/Merchant ID allocated by Selcom                                                                                         |
| order_id         | Mandatory | 123                  | Order id that uniquely identifies the order                                                                                    |
| buyer_email      | Mandatory | customer@example.com | Buyer email                                                                                                                    |
| buyer_name       | Mandatory | Joe John             | Buyer's full name                                                                                                              |
| buyer_phone      | Mandatory | 255781234XXX         | Buyers msisdn                                                                                                                  |
| amount           | Mandatory | 5000                 | Order amount                                                                                                                   |
| currency         | Mandatory | TZS                  | International currency code TZS, USD                                                                                           |
| redirect_url     | Optional  | aHR0cDovL3VybC5jb20= | Base64 encoded thirdparty ecommerce page url that the customer should be redirected after payment process is complete          |
| cancel_url       | Optional  | aHR0cDovL3VybC5jb20= | Base64 encoded thirdparty ecommerce page url that the customer should be redirected when payment process canceled by the buyer |
| webhook          | Optional  | aHR0cDovL3VybC5jb20= | Base64 encoded webhook callback url to recieve API call back of the payment status.                                            |
| buyer_remarks    | Optional  | 255781234567         | Payer remark/decription for the order                                                                                          |
| merchant_remarks | Optional  | 255781234567         | Buyer remark/decription for the order                                                                                          |
| no_of_items      | Mandatory | 255781234567         | No of items in the order (No of product times no items)                                                                        |
| header_colour    | Optional  | #FF0012              | Payment gateway page header colour                                                                                             |
| link_colour      | Optional  | #FF0012              | Payment gateway page link text colour                                                                                          |
| button_colour    | Optional  | #FF0012              | Payment gateway page button colour                                                                                             |
| expiry           | Optional  | 60                   | Expiry in minutes                                                                                                              |

## Cancel Order

> Cancel Order Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X DELETE 'http://example.com/v1/checkout/cancel-order?order_id={order_id}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: order_id"
```


Cancel an order before customer completes the payment. An expired or completed order cannot be cancelled.

### HTTP Request

`DELETE /v1/checkout/cancel-order?order_id={order_id}`

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Order cancelled successfully",
  "data": []
}
```

## Get Order Status

> Get Order Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/checkout/order-status?order_id={order_id}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: order_id"
```


Get status of an order.

### HTTP Request

`GET /v1/checkout/order-status?order_id={order_id}`

### HTTP Request

| Parameter | Type      | Example   | Description                  |
| --------- | --------- | --------- | ---------------------------- |
| order_id  | Mandatory | XYZ123444 | Unique Order ID of the order |

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Order fetch successful",
  "data": [{ "order_id": "123", "creation_date": "2019-06-06 22:00:00", "amount": "1000", "payment_status": "PENDING", "transid": null, "channel": null, "reference": null, "phone": null }]
}
```

### JSON Response data field

| Parameter      | Description                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| payment_status | Payment Status (PENDING, COMPLETED, CANCELLED, USERCANCELLED, REJECTED,INPROGRESS)                                     |
| order_id       | Order id                                                                                                               |
| creation_date  | Order creation date                                                                                                    |
| amount         | Order amount                                                                                                           |
| transid        | Unique transaction identifier from the payment channel. Available on COMPLETED payments only                           |
| channel        | Channel name Eg AIRTELMONEY. Available on COMPLETED payments only                                                      |
| reference      | PG unique payment identifier. Available on COMPLETED payments only                                                     |
| msisdn         | Mobile number involved in the payment incase of a wallet / mastercard QR payment. Available on COMPLETED payments only |

## List All Orders

> List All Orders Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/checkout/list-orders?fromdate={YYYY-MM-DD}&todate={YYYY-MM-DD}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: fromdate, todate"
```


### HTTP Request

`GET /v1/checkout/list-orders?fromdate={YYYY-MM-DD}&todate={YYYY-MM-DD}`

> Below sample response:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Order fetch successful",
  "data": [
    { "order_id": "123", "creation_date": "2019-06-06 22:00:00", "amount": "1000", "payment_status": "PENDING" },
    { "order_id": "124", "creation_date": "2019-06-06 22:10:00", "amount": "2000", "payment_status": "CANCEL" }
  ]
}
```

### JSON Response data field

| Parameter      | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| result         | Result of the order submitted (FAIL, SUCCESS, PENDING)                             |
| payment_status | Payment Status (PENDING, COMPLETED, CANCELLED, USERCANCELLED, REJECTED,INPROGRESS) |
| order_id       | Order id                                                                           |
| creation_date  | Order creation date                                                                |

## Fetch Stored Card Tokens

> Fetch Stored Card Tokens Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/checkout/stored-cards?gateway_buyer_uuid={gateway_buyer_uuid}&buyer_userid={buyer_userid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: gateway_buyer_uuid, buyer_userid"
```


> Below sample response:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Order fetch successful",
  "data": [
    { "masked_card": "5555-12XX-XXXX-1234", "creation_date": "2019-06-06 22:00:00", "card_token": "ABC123423232", "name": "JOE JOHN", "card_type": "001" },
    { "masked_card": "5555-12XX-XXXX-4321", "creation_date": "2019-06-06 23:00:00", "card_token": "ABC123423244", "name": "JOE JOHN", "card_type": "001" }
  ]
}
```

This API allows the eccomerce website to fetch stored cards for specific user passing the gateway_buyer_uuid that was generated for each user on there first order creation.

### HTTP Request

`GET /v1/checkout/stored-cards?gateway_buyer_uuid={gateway_buyer_uuid}&buyer_userid={buyer_userid}`

### JSON Payload Parameters

| Parameter          | Type      | Example   | Description                                                                              |
| ------------------ | --------- | --------- | ---------------------------------------------------------------------------------------- |
| buyer_userid       | Mandatory | 23        | Buyers unique user-id in the thridparty ecommerce website. Same as create order request. |
| gateway_buyer_uuid | Mandatory | 124343434 | Gateway Buyer UUID returned during order creation first time a buyer created an order    |

### JSON Response data field

| Parameter     | Description                              |
| ------------- | ---------------------------------------- |
| masked_card   | Masked card number                       |
| creation_date | Card token creation date                 |
| name          | Full name of the hard holder             |
| card_type     | Card type (001 - Visa, 002 - Mastercard) |
| card_token    | Card token                               |
| id            | Unique Resouce id                        |

## Delete Stored Card

> Delete Stored Card Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X DELETE 'http://example.com/v1/checkout/delete-card?id={card-resource-id}&gateway_buyer_uuid=   {gateway_buyer_uuid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: id,gateway_buyer_uuid "
```


This API allows the eccomerce website to delete stored cards for specific user passing the gateway_buyer_uuid that was generated for each user on there first order creation.

### HTTP Request

`DELETE /v1/checkout/delete-card?id={card-resource-id}&gateway_buyer_uuid={gateway_buyer_uuid}`

### JSON Payload Parameters

| Parameter          | Type      | Example   | Description                                                                           |
| ------------------ | --------- | --------- | ------------------------------------------------------------------------------------- |
| id                 | Mandatory | 23        | Stored card resource id                                                               |
| gateway_buyer_uuid | Mandatory | 124343434 | Gateway Buyer UUID returned during order creation first time a buyer created an order |

> Below sample response:

```json
{
  "reference": "0289999288",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Delete successful",
  "data": []
}
```

## Process Order - Card Payment

> Process Order - Card Payment Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/checkout/card-payment' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,vendor,order_id,card_token,buyer_userid,gateway_buyer_uuid" \
  -d '{"transid":"T123442","vendor":"VENDORTILL", "order_id":"123", "card_token":"ABC123423232", "buyer_userid":"adfm311",gateway_buyer_uuid":"12344321"}
```


```json
{
  "reference": "0289999288",
  "resultcode": "111",
  "result": "PENDING",
  "message": "Request in progress. You will receive a callback shortly.",
  "data": []
}
```

Process Order api allows the ecommerce website to process an order using stored cards directly without redirecting the user to payment gateway page. Can be used for in-app payments where users can select stored cards or for ondemand subscription type recurring payments.

### HTTP Request

`POST /v1/checkout/card-payment`

| Parameter          | Type      | Example      | Description                                                                                |
| ------------------ | --------- | ------------ | ------------------------------------------------------------------------------------------ |
| transid            | Mandatory | A1234        | Unique transaction ID                                                                      |
| vendor             | Mandatory | SHOW01       | Vendor/Merchant ID allocated by Selcom                                                     |
| order_id           | Mandatory | 123          | Order ID                                                                                   |
| card_token         | Mandatory | ABC123423232 | Card token fetched usingFetch Stored Tokenised Cards for Specific UserAPI                  |
| buyer_userid       | Mandatory | joejohn20    | Buyers unique user-id in the thridparty ecommerce website. Should be empty for guest check |
| gateway_buyer_uuid | Mandatory | 124343434    | Gateway Buyer UUID returned during order creation first time a buyer created an order      |

## Process Order - Wallet Pull Payment

> Process Order - Wallet Pull Payment Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST "http://example.com/v1/checkout/wallet-payment" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,order_id,msisdn"  \
  -d '{"transid":"T123442", "order_id":"123", "msisdn":"2556828XXXXX"}
```


Process Order api allows the ecommerce website to process an order using mobile wallets directly without redirecting the user to payment gateway page. Can be used for in-app payments where users can select linked mobile numbers, tigger this api call to reiceve a PUSH ussd from the mobile wallet to complete the transaction.

### HTTP Request

`POST /v1/checkout/wallet-payment`

| Parameter | Type      | Example      | Description                                                                                         |
| --------- | --------- | ------------ | --------------------------------------------------------------------------------------------------- |
| transid   | Mandatory | A1234        | Unique transaction ID                                                                               |
| order_id  | Mandatory | 123          | Order ID                                                                                            |
| msisdn    | Mandatory | 2556828XXXXX | Billing wallet mobile from which the merchant want to pull funds from using Push USSD authorization |

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "111",
  "result": "PENDING",
  "message": "Request in progress. You will receive a callback shortly.",
  "data": []
}
```

## Process Order - Selcom Pesa Push Payment

> Process Order - Selcom Pesa Push Payment Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST "http://example.com/v1/checkout/selcompesa-payment" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,order_id,msisdn"  \
  -d '{"transid":"T123442", "order_id":"123", "msisdn":"2556828XXXXX"}
```


Process Order api allows the ecommerce website to process an order using Selcom Pesa directly without redirecting the user to payment gateway page. Can be used for in-app payments where users can select Selcom Pesa registered mobile numbers, tigger this api call to recieve an in app Selcom Pesa payment request.

### HTTP Request

`POST /v1/checkout/selcompesa-payment`

| Parameter | Type      | Example      | Description                                     |
| --------- | --------- | ------------ | ----------------------------------------------- |
| transid   | Mandatory | A1234        | Unique transaction ID                           |
| order_id  | Mandatory | 123          | Order ID (Same as create-order-minimal request) |
| msisdn    | Mandatory | 2556828XXXXX | Selcom Pesa Mobile Nmber                        |
| remarks   | Optional  | PNR 123123   | Requestor Reference number                      |

> The above command returns JSON structured like this:

```json
{
  "reference": "0289999288",
  "resultcode": "111",
  "result": "PENDING",
  "message": "Request in progress. You will receive a callback shortly.",
  "data": []
}
```

## Create Till Alias

> Create Till Alias - Minimal Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/checkout/create-till-alias' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: vendor,name,memo" \
  -d '{
  "vendor":"12323232",
  "name":"TEST CUSTOMER",
  "memo": "TEST-CUSTOMER-1"
}'
```


A Till Alias enables merchants to create a unique secondary till number under
their primary till profile. This alias is linked to the main till for payments, while
settlements are processed directly to the primary till number.

The Till Alias functions as an open till number (Lipa Number) that can receive
payments from any channel across Tanzania through TanQR, ensuring seamless
transactions.

The merchant will integrate the Selcom PG API to enable the creation of Till
Aliases, which will generate unique Till Numbers/Lipa Numbers. These aliases
will be seamlessly linked to customer profiles within the ERP system, ensuring
efficient payment processing and streamlined settlements.

### HTTP Request

`POST /v1/checkout/create-till-alias`

> The above command returns JSON structured like this:

```json
{
  "reference": "S19901380962",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Payment token 63675386 created for TEST CUSTOMER (61085258) - TESTCUSTOMER-001",
  "data": [{ "till_alias": "63675386" }]
}
```

### JSON Payload Parameters

| Parameter | Type      | Example         | Description                              |
| --------- | --------- | --------------- | ---------------------------------------- |
| vendor    | Mandatory | SHOP203         | Vendor/Merchant ID allocated by Selcom   |
| name      | Mandatory | TEST CUSTOMER   | The name associated with the till alias  |
| memo      | Mandatory | TEST-CUSTOMER-1 | A memo or description for the till alias |

## Webhook Callback

> Webhook Callback Sample

```shell
# With shell, you can just pass the correct header with each request
curl "{thirdparty_site_webhook url}"\
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,order_id,reference,result,resultcode,payment_status" \
  -d '{"transid":"T123442", "reference":"028912121", "order_id":"123", "reference":"0281121212", "result":"SUCCESS", "resulcode":"000","payment_status":"COMPLETED"}
```

```json
# Webhook payload sample
{
  "result": "SUCCESS",
  "resultcode": "000",
  "order_id": "602021152",
  "transid": "7945454515",
  "reference": "856266164161",
  "channel": "TIGOPESATZ",
  "amount": "10000",
  "phone": "255000000001",
  "payment_status": "COMPLETED"
}
```

Payment status callback api from payment gateway to ecommerce website.
\*\*Note : Webhook only on successful transcations

### HTTP Request

| Parameter      | Type      | Example    | Description                                                       |
| -------------- | --------- | ---------- | ----------------------------------------------------------------- |
| transid        | Mandatory | A1234      | Thirdparty transaction id same as payment request                 |
| order_id       | Mandatory | 123        | Order ID                                                          |
| reference      | Mandatory | 0289124234 | Selcom Gateway transaction reference                              |
| result         | Mandatory | SUCCESS    | Status of the transaction SUCCESS, FAIL                           |
| resultcode     | Mandatory | 000        | Error code                                                        |
| payment_status | Mandatory | COMPLETE   | Status of the payment COMPLETED, CANCELLED, PENDING, USERCANCELED |

# Integrated Merchants

This is a realtime API which is invoked when a payment is received from one of Selcom channels to be posted to third party systems. Channels include mobile wallets, bank accounts, POS and non-POS Selcom Huduma/Huduma+ agents. The API is intiated from Selcom Gateway notifying third party system.

## Authentication C2B (to be implemented on Merchants Side)

All requests will include authentication token “Bearer $token” in header. Token will be shared by 3rd party. The authentication method for this API is different the one description at the first section of the documentation as its consumed by Selcom Gateway from thirdparty.

`Authorization: Bearer lfksa823wera342o23`,
`Content-Type: application/json`

## Payment Validation to Merchant's ERP

Payment validation leg, verify amount, utility reference, phone number etc. A timeout or failure from this API return failure to the source channel and auto reverse the funds.

### Request Format

This API request is initiated from Selcom to Merchant's ERP system.
`POST /validation HTTP/1.1`

| Parameter  | Type      | Example     | Description                                                                                                                                                                                     |
| ---------- | --------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| operator   | Available | AIRTELMONEY | Name of the channel. Values passed for mobile wallet originating transactions (AIRTELMONEY, MPESA-TZ, TIGOPESATZ, HALOPESATZ, TTCLMOBILE and ZANTELEZPESA)                                      |
| transid    | Available | XYZ123444   | Unique Transaction ID of the transaction                                                                                                                                                        |
| reference  | Available | 033XX12211  | Unique transaction Identifier from Selcom Gateway                                                                                                                                               |
| utilityref | Available | 075XXXXXXX  | Invoice No or Merchant Unique reference for the payment                                                                                                                                         |
| amount     | Available | 1000        | Transaction amount (Incase of a fixed invoices. This will be zero and expected amount on the response. So customer dont have to enter the amount and the amount is returned from Merchants ERP) |
| msisdn     | Available | 06534567891 | End-user or initiator mobile number.                                                                                                                                                            |

### Expected Response Format

| Response Field | Description                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| reference      | Same value as in request                                                                        |
| resultcode     | Error codes. Refer toExpected Error codes from thirdpary businessessection for better guideness |
| result         | Transaction status. SUCCESS ro FAILED. This value is not used.                                  |
| message        | Error description                                                                               |
| name           | Name of the customer associated with the account or utilityref (Optional)                       |
| amount         | Payment amount associated with the utilityref. (optional)                                       |

## Payment Notification to Merchant's ERP

Payment confirmation after successful validation. The payload is exactly same as validate api. A timeout or no response from this API return not auto reverse funds on the source channel, transactions will be held on ambiguous status for manual recon process to be completed.

### Request Format

This API request is initiated from Selcom to Merchant's ERP system.

`POST /notification HTTP/1.1`

| Parameter  | Type      | Example     | Description                                                                                                                                                |
| ---------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| operator   | Available | AIRTELMONEY | Name of the channel. Values passed for mobile wallet originating transactions (AIRTELMONEY, MPESA-TZ, TIGOPESATZ, HALOPESATZ, TTCLMOBILE and ZANTELEZPESA) |
| transid    | Available | XYZ123444   | Unique Transaction ID from the channel                                                                                                                     |
| reference  | Available | 033XX12211  | Unique transaction Identifier from Selcom Gateway                                                                                                          |
| utilityref | Available | 075XXXXXXX  | Invoice No or Merchant Unique reference for the payment                                                                                                    |
| amount     | Available | 1000        | Transaction amount                                                                                                                                         |
| msisdn     | Available | 06534567891 | End-user or initiator mobile number.                                                                                                                       |

### Expected Response Format

| Response Field | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- |
| reference      | Same value as in request                                                                       |
| resultcode     | Error codes. Refer toExpected Error codes from thirdparty businesssection for better guideness |
| result         | Transaction status. SUCCESS ro FAILED. This value is not used.                                 |
| message        | Error description                                                                              |

## Expected Error codes from Merchant's System or ERP

| Error Code | Meaning                                           |
| ---------- | ------------------------------------------------- |
| 000        | Success.                                          |
| 010        | Invalid account or payment reference (utilityref) |
| 012        | Invalid amount                                    |
| 014        | Amount too high                                   |
| 015        | Amount too low                                    |
| 4XX        | for other failure cases from your system.         |

## Prompt Payment Flow on POS Terminal

API is used to trigger a Payment on POS terminal by a Merchant intiated by the Merchant Billing System, ERP or Cash counter. On completion on payment flow on the POS terminal the Notification Api in the previous section is triggered.

> Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST "http://example.com/v1/checkout/initiate-pos-payment" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: transid,currency,amount,payment_method,msisdn"\
  -d '{"currency":"TZS",  "amount":"123","payment_method":"MOBILEMONEY" "msisdn":"255111111111"}
```


### HTTP Request

`POST /v1/checkout/initiate-pos-payment`

| Parameter      | Type      | Example     | Description                                                                                                    |
| -------------- | --------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| currency       | Mandatory | TZS         | Currency                                                                                                       |
| amount         | Mandatory | 5000        | Amount                                                                                                         |
| payment_method | Optional  | CARD        | MOBILEMONEY, CARD                                                                                              |
| msisdn         | Optional  | 255XXXXXXXX | Billing wallet mobile from which the merchant want to pull funds. MANDATORY when payment_method is MOBILEMONEY |
| invoice_no     | Optional  | BAD001      | Invoice for payment                                                                                            |

## Pos Payment Status

API is used to fetch a Payment status by a Merchant initiated from the Billing System, ERP or Cash counter.

> Payment Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/checkout/pos-payment-status?invoice_no={invoice_no}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: invoice_no"
```


### HTTP Request

`GET /v1/checkout/pos-payment-status?invoice_no={invoice_no}`

### Query Parameters

| Parameter  | Type      | Example | Description         |
| ---------- | --------- | ------- | ------------------- |
| invoice_no | Mandatory | BAD001  | Invoice for payment |

> Pending Status Response:

```json
Pending Status
{
    "reference": "S20495509162",
    "resultcode": "999",
    "result": "INPROGRESS",
    "message": "Transaction pending",
    "data": []
}
```

> Completed/Paid Status Response:

```json
{
  "reference": "300913382877",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Selcom Pay\nSELCOM P2000 (DEBUG)\nSALE-8127\nTZS 100.00\nReceipt 300913382877\nMID 60349337\n09/04/2026 1:40:03 PM",
  "data": [
    {
      "invoice_no": "SELTEST004",
      "card_number": "8127",
      "payment_method": "CARD",
      "payer_mobile": "-",
      "amount": "100",
      "currency": "TZS",
      "channel": "SELCOMPOS",
      "transid": "000037732842",
      "reference": "300913382877"
    }
  ]
}
```

### JSON Response data field

| Parameter      | Description                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| result         | Payment Status (PENDING, SUCCESS, CANCELLED, USERCANCELLED, REJECTED,INPROGRESS)                                                                 |
| invoice_no     | Invoice for payment                                                                                                                              |
| card_number    | last 4 digits of card number (only available for card payments)                                                                                  |
| payment_method | MOBILEMONEY, CARD                                                                                                                                |
| amount         | amount                                                                                                                                           |
| transid        | Unique transaction identifier from the payment channel. Available on COMPLETED payments only                                                     |
| channel        | Channel name Eg AIRTELMONEY. Available on COMPLETED payments only                                                                                |
| reference      | PG unique payment identifier. Available on COMPLETED payments only                                                                               |
| payer_mobile   | Mobile number involved in the payment incase of a wallet / QR payment. Available on COMPLETED payments only (only available for mobile payments) |

# International Money Transfer API (IMT)

## Wallet Name Look Up

> Wallet Name Lookup Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/imt/wallet-namelookup?utilitycode={uitlitycode}&utilityref={utilityref}&transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: utilitycode,utilityref,transid"
```


> Wallet Name Lookup Sample response:

```json
{
  "reference": "6927759116",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Name fetch successful",
  "data": [
    {
      "name": "FIROZ MOH"
    }
  ]
}
```

### HTTP Request

`GET /v1/imt/wallet-namelookup?utilitycode=REMITIN&utilityref=XYZ123444&transid=1001`

### Query Parameters

| Parameter   | Type      | Example        | Description                                                                                                                                                            |
| ----------- | --------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| utilitycode | Mandatory | REMITIN        | Utility Type Identifier                                                                                                                                                |
| utilityref  | Mandatory | 25575XXXXXXXXX | Mobile number associated with the wallet                                                                                                                               |
| transid     | Mandatory | XYZ123444      | Transaction ID to match request and response. Transid used for lookup can be used for transaction call. transid field cannot duplicate for multiple transaction calls. |

### Utilty Codes

| Wallet Type | Utility code |
| ----------- | ------------ |
| MPESA       | MPREMITIN    |
| MIXX BY YAS | TPREMITIN    |
| HALOPESA    | HPREMITIN    |
| AIRTELMONEY | AMREMITIN    |
| TTCL Pesa   | TTREMITIN    |

## Bank Account Name Lookup

> Bank Account Name Lookup SAmple

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/imt/bank-namelookup/?bank={bank}&account={account}&transid={transid}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: bank,account,transid"
```


### HTTP Request

`GET /v1/imt/bank-namelookup/?bank=AKIBA&account=XYZ123444&transid=1001`

### Query Parameters

| Parameter | Type      | Example   | Description                                                                                                                                                            |
| --------- | --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bank      | Mandatory | AIBA      | Bank short name                                                                                                                                                        |
| account   | Mandatory | XYZ123444 | Account number                                                                                                                                                         |
| transid   | Mandatory | XYZ123444 | Transaction ID to match request and response. Transid used for lookup can be used for transaction call. transid field cannot duplicate for multiple transaction calls. |

.

## Send Money

> IMT Send Money Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X POST 'http://example.com/v1/imt/send-money' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: messageId,end2endId,sender.firstname,sender.lastname,sender.country,sender.mobile,sender.idType,sender.idNo,sender.dateOfBirth,sender.placeOfBirth,sender.nationality,sender.idIssuedCountry,sender.occupation,sender.address,sender.city,sourceOfFundsrecipient.firstname,recipient.lastname,recipient.country,recipient.mobile,vendor,pin,currency,amount,billingAmount,billingCurrency,purpose,personalMessage,secretMessage,sourceFI.type,sourceFI.name,sourceFI.country,sourceFI.code,sourceFI.account,destinationFI.type,destinationFI.name,destinationFI.country,destinationFI.code,destinationFI.account" \
  -d '{
    "messageId":"M1234",
    "end2endId":"E1234",
    "sender.firstname": "John",
    "sender.lastname": "Joh",
    "sender.country": "USA",
    "sender.mobile": "256xxxxxxxxx",
    "sender.idType":  "PASSPORT",
    "sender.idNo":"GS1002223",
    "sender.dateOfBirth" :"2011-02-26",
    "sender.placeOfBirth":"Springfield ",
    "sender.nationality": "USA",
    "sender.idIssuedCountry":"USA",
    "sender.occupation":"Doctor",
    "sender.address":"1234 Elm Street, Apt 567, Springfield, IL 62704, USA",
    "sender.city":" Springfield",
    "sourceOfFunds":"SALARY",
    "recipient.firstname":"Benjamin",
    "recipient.lastname":"Beny",
    "recipient.country":"TZA",
    "recipient.mobile":"255xxxxxxxxxx",
    "vendor" : "IMTHUB001",
    "pin" : "123123",
    "currency" : "TZS",
    "amount" : 49200,
    "billingAmount":"20",
    "billingCurrency":"USD",
    "purpose" : "GIFT",
    "personalMessage" : "Happy birthday",
    "secretMessage" : "MANGO",
    "sourceFI.type" : "BANK",
    "sourceFI.name" : "Citibank",
    "sourceFI.country" : "USA",
    "sourceFI.code" : "CITIBANKUSA",
    "sourceFI.account" : "9693546",
    "destinationFI.type" : "WALLET",
    "destinationFI.name" : "MPESA",
    "destinationFI.country" : "TZA",
    "destinationFI.code" : "    VMTZ",
    "destinationFI.account" : "255xxxxxxxxx"
}'
```


```json
Request
{
  "messageId": "2020070101",
  "end2endId": "2020070101",
  "sender":{
    "firstname":"John",
    "lastname":"White",
    "country":"USA",
    "mobile":"25632223232",
    "idType": "PASSOPORT",
    "idNo":"ABCDEFGH",
    "dateOfBirth" :"2011-02-26",
    "placeOfBirth":"Springfield ",
    "nationality": "USA",
    "idIssuedCountry":"USA",
    "occupation":"Doctor",
    "address":"1234 Elm Street, Apt 567, Springfield, IL 62704, USA",
    "city":" Springfield"

  },
  "sourceOfFunds":"SALARY",
  "recipient":{
    "firstname":"John",
    "lastname":"White",
    "country":"TZA",
    "mobile":"2556828XXXXX"
  },
  "vendor": "IMTHUB123",
  "pin":"1221",
  "currency":"TZS",
  "amount":"49200",
  "billingAmount":"20",
  "billingCurrency":"USD",
  "purpose":"Personal",
  "personalMessage":"Gift",
  "secretMessage":"",
  "sourceFI":{
    "type":"AGENT,CARD,BANK,WALLET",
    "name":"MARIAM FOREX SERVICES",
    "country":"USA",
    "code": "PAYPAL",
    "account":"0110000021",
  },
  "destinationFI":{
    "type":"WALLET",
    "name":"NMB BANK",
    "account":"0110000021",
    "code":"NMBTZ",
    "country":"TZA"
  }
}
```

```json
Response
{
  "reference" : "0289999288",
  "resultcode" : "000",
  "result" : "SUCCESS",
  "message" : "Refund request received",
  "data": []
}
```

An IMT Hub or Financial institution invokes this API to an FI connected to Selcom.
Note : This API is async and callback gives final confirmation that the recipient has recieved the funds.

### HTTP Request

`POST /v1/imt/send-money`

| Parameter              | Type | Example                                              | Description                                                                                                           |
| ---------------------- | ---- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| messageId              | M    | M1234                                                | Unique transaction id for the refund request                                                                          |
| end2endId              | M    | E1234                                                | Transaction id of the orginal payment request for which refund is required.                                           |
| sender.firstname       | M    | John                                                 | First name of the sender                                                                                              |
| sender.lastname        | M    | Mushi                                                | Last name of the sender                                                                                               |
| sender.country         | M    | USA                                                  | Alpha 3 country code of the sender in ISO 3166 international standard                                                 |
| sender.mobile          | M    | 15551234567                                          | Mobile number of the sender in international format without plus or 00 preix                                          |
| sender.idType          | O    | PASSPORT                                             | KYC info. Identity document type of the sender. PASSWORD, DRIVERSLICENCE, NATIONALID etc                              |
| sender.idNo            | M    | GS1002223                                            | KYC info. Identity document number                                                                                    |
| sender.idIssuedCountry | M    | USA                                                  | Alpha 3 country code of the country that issued sender identity document in ISO 3166 international standard           |
| sender.dateOfBirth     | M    | 2011-02-26                                           | Date of birth of sender in the format ( yyyy-mm-dd )                                                                  |
| sender.nationality     | M    | USA                                                  | Alpha 3 country code of the country Nationality of the sender                                                         |
| sender.placeOfBirth    | M    | Springfield                                          | Place of birth of the sender                                                                                          |
| sender.occupation      | M    | DOCTOR                                               | Occupation of sender                                                                                                  |
| sender.address         | M    | 1234 Elm Street, Apt 567, Springfield, IL 62704, USA | Address of the sender                                                                                                 |
| sender.city            | O    | Springfield                                          | City of the sender                                                                                                    |
| sourceOfFunds          | M    | SALARY                                               | Source of funds to be sent (SALARY, BUISSINESS)                                                                       |
| recipient.firstname    | M    | Benjamin                                             | First name of the recipient                                                                                           |
| recipient.lastname     | M    | Sata                                                 | Last name of the recipient                                                                                            |
| recipient.country      | M    | TZA                                                  | Alpha 3 country code of the recipient in ISO 3166 international standard                                              |
| recipient.mobile       | M    | 255700123456                                         | Mobile number of the receipient in international format without plus or 00 preix                                      |
| vendor                 | M    | IMTHUB001                                            | Float account identifier. To be shared by selcom                                                                      |
| pin                    | M    | 1212                                                 | Float account pin. To be shared by selcom                                                                             |
| currency               | M    | TZS                                                  | Transaction currency (3 character Alphabetic code in ISO 4217 standard)                                               |
| amount                 | M    | 49200                                                | Transaction amount                                                                                                    |
| billingAmount          | M    | 20                                                   | Billing amount (sender)                                                                                               |
| billingCurrency        | M    | USD                                                  | Billing currency (sender) (3 character Alphabetic code in ISO 4217 standard)                                          |
| purpose                | M    | BUSINESS                                             | Purpose of the IMT (GENERAL, BUSINESS, GIFT)                                                                          |
| personalMessage        | O    | Happy birthday                                       | Personal message to be passed on to the recipient                                                                     |
| secretMessage          | O    | MANGO                                                | Secret code or code number                                                                                            |
| sourceFI.type          | M    | BANK                                                 | Source Financial institution type (AGENT,CARD,BANK,WALLET)                                                            |
| sourceFI.name          | M    | Citibank                                             | Name of the source Financial Institution                                                                              |
| sourceFI.country       | M    | USA                                                  | Source FI country (Alpha 3 country code of the sender in ISO 3166 international standard)                             |
| sourceFI.code          | M    | CITIBANKUSA                                          | Source FI code (to be shared by selcom)                                                                               |
| sourceFI.account       | M    | 5000123                                              | Senders account number (to be used for refund transaction in case of a failure or refund request from Destination FI) |
| destinationFI.type     | M    | WALLET                                               | Source Financial institution type (AGENT,CARD,BANK,WALLET)                                                            |
| destinationFI.name     | M    | MPESA                                                | Name of the destination FI                                                                                            |
| destinationFI.country  | M    | TZA                                                  | Destination FI country (Alpha 3 country code of the sender in ISO 3166 international standard)                        |
| destinationFI.code     | M    | VMTZ                                                 | Destination FI code (to be shared by selcom)                                                                          |
| destinationFI.account  | M    | 255700123456                                         | Recipient account number                                                                                              |

Type: M - Mandatory, O - Optional and C - Conditional Mandatory

## Transaction Status

> Transaction Status Sample

```shell
# With shell, you can just pass the correct header with each request
curl -X GET 'http://example.com/v1/imt/query?messageId={messageId}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: SELCOM {authorization-token}" \
  -H "Digest-Method: {digest-token}" \
  -H "Digest: {digest}" \
  -H "Timestamp: {timestamp in yyyy-dd-mm H:i:s format}" \
  -H "Signed-Fields: messageId"
```


### HTTP Request

`GET /v1/imt/query?messageId=20200721001`

```json
Response 1

{
  "messageId" : "20200721001",
  "reference" : "0289999288",
  "resultcode" : "000",
  "result" : "SUCCESS",
  "message" : "Transaction successful",
  "data": [{"receipt": "12344"}]
}

Response 2
{
  "messageId" : "20200721001",
  "reference" : "0289999288",
  "resultcode" : "999",
  "result" : "AMBIGOUS",
  "message" : "Transaction successful",
  "data":[]
}

Response 3
{
  "messageId" : "20200721001",
  "reference" : "0289999288",
  "resultcode" : "404",
  "result" : "FAILED",
  "message" : "Invalid Account number",
  "data":[]

}


Response 4
{
  "messageId" : "20200721001",
  "reference" : "0289999288",
  "resultcode" : "111",
  "result" : "INPROGRESS",
  "message" : "Transaction is being processed",
  "data":[]
}
```

### Query Parameters

| Parameter | Type      | Example   | Description                              |
| --------- | --------- | --------- | ---------------------------------------- |
| messageId | Mandatory | XYZ123444 | Unique Transaction ID of the transaction |

\*\*Note : Receipt data in response is present only for successful transactions and is dependent availability from thridparty FI

## Transaction Callback - Selcom to Thirdparty

```json
Request
{
  "messageId" : "20200721001",
  "reference" : "0289999288",
  "resultcode" : "000",
  "result" : "SUCCESS",
  "message" : "Transaction successful",
  "data": [{"receipt": "12344"}]
}

Response:
HTTP 200
```

### HTTP Request

| Parameter  | Type      | Example    | Description                                          |
| ---------- | --------- | ---------- | ---------------------------------------------------- |
| messageId  | Mandatory | A1234      | Thirdparty transaction id same as payment request    |
| reference  | Mandatory | 0289124234 | Selcom Gateway transaction reference                 |
| result     | Mandatory | SUCCESS    | Status of the transaction SUCCESS, FAIL, INPROGRESS, |
| resultcode | Mandatory | 000        | Error code,                                          |
| message    | Mandatory | Success    | Description                                          |

\*\*Note : Receipt data in response is present only for successful transactions and is dependent availability from thridparty FI

## IMT Errorcodes

### Synchronous Response

| Resultcode          | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| 111, 001, 002, 003  | Transaction in progress ( Async transaction wait for callback) |
| 000                 | Successful ( transaction completed synchronously)              |
| 999                 | Ambiguous status                                               |
| 010                 | Invalid mobile number or operator not supported.               |
| 029                 | Customer account on suspended state                            |
| 103                 | Invalid recipient account/mobile number                        |
| 015                 | Invalid amount                                                 |
| 013                 | Amount higher than allowed limit                               |
| 611                 | Source FI not found                                            |
| 612, 012            | Destination FI not found.                                      |
| 202, 201            | Invalid account number or name validation failed               |
| 203                 | Recipient Name mismatch                                        |
| 218, 889, 900 , 151 | Service unavailable                                            |
| 400                 | Transaction failed. (general)                                  |
| 415                 | KYC Validation failure.                                        |

### Callback Status

| Resultcode | Description                                    |
| ---------- | ---------------------------------------------- |
| 000        | Success                                        |
| 404, 400   | Transaction failed to reach destination FI     |
| 500 , 501  | Transaction rejected by destination FI         |
| 701        | Transaction rejected by destination FI         |
| 702        | Destination FI Internal Errors or Unavailable  |
| 703        | Account currency mismatch                      |
| 704        | Transfer aborted due to customer maximum limit |
| 200        | Transaction Failed and reversed manually       |
