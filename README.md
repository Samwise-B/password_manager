# Full Stack Password Manager

This project was a custom built password manager that can store and retrieve passwords securely using a zero knowledge proof [1](https://en.wikipedia.org/wiki/Zero-knowledge_proof). The application uses a React frontend, NodeJS (Express) backend, a PostgreSQL database and a docker stack for the respective containers' management. All the encryption was designed using JavaScript's built-in WebCrypto API. The API follows a RESTful CRUD framework and the entire stack is built in TypeScript. The server was deployed on a VPS.

To build and run the application use the command `docker-compose up`. NOTE: you must create an .env file in the root of the directory along with an nginx.conf file to act as a reverse proxy for the react-app and backend API. For further details, please contact me.
