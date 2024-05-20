# MongoDB API for ABT Metadata

This project implements a basic Node.js API for managing ABT metadata with MongoDB. It provides functionality to create, retrieve, update and delete ABT metadata through RESTful endpoints.

## Prerequisites

Before you start, ensure you have the following installed on your system:

- **Node.js and npm** (Node.js 18.x or later is recommended)

## Installation

### Clone the Repository

Start by cloning this repository to your local machine:

```bash
git clone https://github.com/NIOV-Labs/mongodb-api.git
cd mongodb-api
```

### Install Dependencies

Run the following command in your project directory to install the necessary packages:

```bash
npm install
```

### Add Environment Variables

```bash
nano .env
```

```bash
MONGO_URI=<Ask Jesse or make your own @ [MongoDB](https://www.mongodb.com/products/platform/atlas-database)>
JWT_SECRET='hniTm,?0{p9|?3£g;y?Z£xRNv|J\nS(P'
```

### Run Server

To start the server, run:

```bash
npm run dev
```

## Usage

#### Index

<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 16px;">

[Web3 Auth](#web3-auth) | [Upload PDF](#upload-pdf) | [Delete PDF](#delete-pdf) | [Create ABT](#create-abt) | [Retrieve ABT](#retrieve-abt) | [Update ABT](#update-abt) | [Delete ABT](#delete-abt) | [Delete all ABTs](#delete-all-abts)

</div>

### Web3 Auth

To auth and create a session use the following command::

```bash
npm run test:login
```

### Upload PDF

To upload pdf refer to the test/upload.js file:

```bash
npm run test:upload
```

Via Curl:

```bash
head -c 1024 test/test.pdf | base64 > chunk.txt 
curl -X POST http://localhost:3000/upload \
-H "Content-Type: application/json" \
-d @- <<EOF
{
  "ext": "pdf",
  "chunk": "data:application/pdf;base64,$(cat chunk.txt)",
  "chunkIndex": 0,
  "totalChunks": 1
}
EOF
```

### Delete PDF

To delete a pdf use the following curl:

Via Curl:

```bash
curl -X DELETE -H "Content-Type: application/json" -d '{"fileName": "1716162989796_test-1.pdf"}' http://localhost:3000/api/upload
```

### Create ABT

To add new ABT metadata, use the following query command:

```bash
curl -X POST http://localhost:3000/api/token/9912349 \
     -H "Content-Type: application/json" \
     -d '{
           "user_address": "0x1234567890abcdef1234567890abcdef12345678",
           "network": "sepolia",
           "metadata": {
               "name": "Test Token",
               "description": "This is a test token",
               "externalURL": "https://example.com",
               "image": "https://example.com/image.png",
               "document": "https://example.com/document.pdf"
           }
         }'
```

Example Response:

```json
{
    "tokenId": "2395871029845719" 
}
```

### Retrieve ABT

To retrieve ABT metadata by ID, use the following curl command:

```bash
curl -X GET http://localhost:3000/api/token/<TokenID>
```

*Replace <TokenID> with the actual ID of the ABT you wish to retrieve.*

### Update ABT

To update ABT metadata by ID, use the following curl command:

```bash
curl -X PUT http://localhost:3000/api/token/<TokenID> \
-H "Content-Type: application/json" \
-d '{
    "name": "Updated ABT Name",
    "description": "Updated description here.",
    "thumbnail": "http://example.com/updated_thumbnail.jpg"
}'
```

*Replace <TokenID> with the actual ID of the ABT you wish to update.*

### Delete ABT

To delete ABT metadata by ID, use the following curl command:

```bash
curl -X DELETE http://localhost:3000/api/token/<TokenID>
```

*Replace <TokenID> with the actual ID of the ABT you wish to delete.*

### Delete all ABTs

To delete all ABT metadatas in mongodb and start fresh, use the following curl command:

```bash
curl -X DELETE http://localhost:3000/api/tokens
```

