# MongoDB API for ABT Metadata

This project implements a basic Node.js API for managing ERC-721 token metadata with MongoDB. It provides functionality to create and retrieve token metadata through RESTful endpoints.

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

### Run Server

To start the server, run:

```bash
node api-server.js
```

## Usage

### Create ABT Metadata

To add new token metadata, use the following query command:

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
        "fileUrl": "http://example.com/document.pdf"
    },
    "thumbnail": "http://example.com/image.jpg",
    "externalURL": "http://example.com",
    "assetURL": "http://example.com/asset.jpg"
}'
```

Example Response:

{"name":"Example Token","symbol":"EXT","baseURI":"http://example.com/token","description":"This is a description of my token.","contractRedemptionVoucher":{"fileName":"Document","fileUrl":"http://example.com/document.pdf"},"thumbnail":"http://example.com/thumbnail.jpg","externalURL":"http://example.com","assetURL":"http://example.com/asset.jpg","_id":"66419766c9797b8a7e0b2a7e","__v":0}%  

Note:

Token ID = "_id"

### Retrieve Token Metadata

To retrieve token metadata by ID, use the following curl command:

```bash
curl -X GET http://localhost:3000/api/token/<TokenID>
```
Replace <TokenID> with the actual ID of the token you wish to retrieve.