# Full Stack Password Manager

This project was a custom built password manager that can store and retrieve passwords securely using a zero knowledge proof [1]. The application uses a React frontend, NodeJS (Express) backend, a PostgreSQL database and a docker stack for the respective containers' management. All the encryption was designed using JavaScript's built-in WebCrypto API. The API follows a RESTful CRUD framework and the entire stack is built in TypeScript. The server was deployed on a VPS.

To build and run the application use the command `docker-compose up`. NOTE: you must create an .env file in the root of the directory along with an nginx.conf file to act as a reverse proxy for the react-app and backend API. For further details, please contact me.

# Full Stack Password Manager

This project is a custom-built, full-stack password manager application that securely stores and retrieves passwords using a [zero-knowledge proof](https://en.wikipedia.org/wiki/Zero-knowledge_proof). The stack is built with TypeScript and comprises a React frontend, Node.js (Express) backend, and PostgreSQL database, managed in a Dockerized environment.

All encryption is implemented using JavaScript’s built-in WebCrypto API, ensuring high security and compliance with zero-knowledge protocols.

## Features

- **Zero-Knowledge Proof Security**: User authentication and password retrieval employ zero-knowledge proofs to enhance data privacy and security.
- **RESTful API**: The API is built on a RESTful CRUD framework, supporting efficient management of stored credentials.
- **Containerized Environment**: Docker is used to manage and deploy the frontend, backend, and database in isolated containers, ensuring ease of deployment and scalability.
- **Reverse Proxy with Nginx**: An `nginx.conf` file is used to configure Nginx as a reverse proxy, routing requests between the React frontend and the backend API.

## Tech Stack

- **Frontend**: React (TypeScript)
- **Backend**: Node.js (Express, TypeScript)
- **Database**: PostgreSQL
- **Encryption**: WebCrypto API (JavaScript)
- **Containerization**: Docker and Docker Compose

## Setup and Deployment

1. **Environment Configuration**:
   - Create an `.env` file in the root directory to configure environment variables (e.g., database credentials, API keys).
   - Add an `nginx.conf` file for reverse proxy setup between the frontend and backend.

2. **Run the Application**:
   Use Docker Compose to build and run the application:
   ```bash
      docker-compose up

3. **Deployment**: The server is deployed on a Virtual Private Server (VPS) for secure remote access and scalability.

