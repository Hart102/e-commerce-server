# FreshCart Api

## Key Features:

Node.js and Express.js: The codebase is built using Node.js and Express.js, a popular web application framework for JavaScript.
MongoDB: The API uses MongoDB as the database for storing product data. It provides an object-document mapping (ODM) layer using Mongoose.

The codebase provides key functionalities for managing users, products, categories, and addresses within an e-commerce application. It includes user authentication, such as registration, login, profile editing, password reset, and logout, alongside address management features.

In the product management section, it supports creating, editing, retrieving, and deleting products, with provisions for handling images and associating products with categories. Similarly, category management allows for creating, editing, fetching, and deleting categories.

The application also incorporates file upload functionality, particularly for product images, and handles image deletion when necessary. Schema validation ensures that user and product data meet required criteria. Additionally, centralized error handling provides consistent error responses throughout the application.


## Error Handling:
The API includes error handling for various scenarios, such as invalid form data, missing required fields, and database errors.
Error responses are returned in JSON format with an "isError" field indicating whether an error occurred, and a "message" field providing a description of the error.
