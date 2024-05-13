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

MONGO_URI=<Ask Jesse or make your own @ [MongoDB](https://www.mongodb.com/products/platform/atlas-database)>

### Run Server

To start the server, run:

```bash
npm run dev
```

## Usage

### Upload PDF

To upload pdf refer to the test/upload.js file:

```bash
npm run test
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

### Create ABT Metadata

To add new ABT metadata, use the following query command:

```bash
curl -X POST http://localhost:3000/api/token \
-H "Content-Type: application/json" \
-d '{
    "name": "Example Token",
    "symbol": "EXT",
    "baseURI": "http://example.com/token",
    "description": "This is an example token.",
    "contractRedemptionVoucher": {
        "fileName": "Document",
        "fileURL": "http://example.com/document.pdf"
    },
    "thumbnail": "http://example.com/image.jpg",
    "externalURL": "http://example.com",
    "assetURL": "http://example.com/asset.jpg"
}'
```

Example Response:

```json
{
    "name":"Example Token",
    "symbol":"EXT",
    "baseURI":"http://example.com/token",
    "description":"This is a description of my token.",
    "contractRedemptionVoucher":
        {
            "fileName":"Document",
            "fileUrl":"http://example.com/document.pdf"
        },
    "thumbnail":"http://example.com/thumbnail.jpg",
    "externalURL":"http://example.com",
    "assetURL":"http://example.com/asset.jpg",
    "_id":"66419766c9797b8a7e0b2a7e",
    "__v":0
}
```

Note:

TokenID = "_id"

### Retrieve ABT Metadata

To retrieve ABT metadata by ID, use the following curl command:

```bash
curl -X GET http://localhost:3000/api/token/<TokenID>
```

*Replace <TokenID> with the actual ID of the ABT you wish to retrieve.*

### Update ABT Metadata

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

### Delete ABT Metadata

To delete ABT metadata by ID, use the following curl command:

```bash
curl -X DELETE http://localhost:3000/api/token/<TokenID>
```

*Replace <TokenID> with the actual ID of the ABT you wish to delete.*
