Node Library
Node Library is an application designed to manage a library that sells products and books, as well as facilitates borrowing books that must be returned after a specified time.

Features:
Product Sales: The system allows for the sale of various products.
Borrowing System: Users can borrow books, and the system tracks due dates for returns.
User Authentication: Secure login and authentication for library staff and users.
Reports and Analytics: Generate reports on sales, book availability, and user activity.
Installation
Clone the repository:
git clone https://github.com/muhammad0936/Library.git

Install dependencies:
cd Library
npm install

create .env file in the root directory and give create variables with values like this template:
___________
MONGO_STRING = 'your main mongodb database uri'
MONGO_TEST_STRING = 'your testing mongodb database uri'
NYLAS_CLIENT_ID = 'Fill using your Nylas account configs'
NYLAS_CLIENT_SECRET = 'Fill using your Nylas account configs'
NYLAS_API_SERVER = 'Fill using your Nylas account configs'
NYLAS_ACCESS_TOKEN = 'Fill using your Nylas account configs'
___________
Run the application:
npm start

Run testing:
npm test

Here is a documentation shows how you can use the routes correctly, This application uses Json Web Tokens to authenticate users, you should provide the jwt using header named Authorization which contains the jwt like: "Bearer {jwt must be here}", You should login to a previously created account to get your jwt and use it to deal with the API.

Authentication routes: 
1. POST /signup: This route is used to sign up a new user. The request body should include:

email: User’s email.
password: User’s password.
name: User’s name.
An uploaded file: This will be used as the user’s ID photo.
The server responds with a status code of 201, a success message, and a signed token if the operation is successful. The token can be used for authenticated requests. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly.

2.POST /manager: This route is used to add a new manager. The request body should include:

fname: First name of the manager.
mname: Middle name of the manager.
lname: Last name of the manager.
email: Email of the manager.
password: Password of the manager.
idNumber: ID number of the manager.
birthDate: Birth date of the manager.
phone: Phone number of the manager.
address: Address of the manager.
Two uploaded files: The first will be used as the manager’s ID photo and the second as the manager’s personal photo.
The server responds with a status code of 201 and a success message if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by the admin.

3. GET /login: This route is used to log in a user. The request body should include:

email: User’s email.
password: User’s password.
The request query should include:

isManager: A boolean value indicating whether the user is a manager or not.
The server responds with a status code of 200, a success message, and a signed token in the ‘Authorization’ header if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that the token can be used for authenticated requests.

4. GET /reset: This route is used to send a reset email to a user. The request body should include:

email: User’s email.
The request query should include:

isManager: A boolean value indicating whether the user is a manager or not.
The server responds with a status code of 200 and a success message if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that the reset email contains a token that can be used to reset the user’s password.

5. PUT /resetPassword: This route is used to reset a user’s password. The request body should include:

email: User’s email.
token: The reset token received in the reset email.
password: The new password.
The request query should include:

isManager: A boolean value indicating whether the user is a manager or not.
The server responds with a status code of 201 and a success message if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that the reset token must be valid and not expired.


Admin and managers routes:
6. POST /product: This route is used to add a new product. The request body should include:

title: Title of the product.
price: Price of the product.
borrowingCostPerWeek: Borrowing cost per week for the product.
description: Description of the product.
quantity: Quantity of the product.
allQuantityPrice: Total price for all quantities of the product.
The request should also include multiple uploaded files which will be used as the product’s images.

The server responds with a status code of 201, a success message, and the product ID if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is a manager.

7. PUT /product/:productId: This route is used to edit an existing product. The request body can include:

title: New title of the product.
price: New price of the product.
borrowingCostPerWeek: New borrowing cost per week for the product.
description: New description of the product.
The request can also include multiple uploaded files which will be used as the new product’s images.

The server responds with a status code of 201, a success message, and the product ID if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is a manager.

8. DELETE /product/:productId: This route is used to delete an existing product. The server responds with a status code of 201, a success message, and the ID of the deleted product if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is a manager.

9.DELETE /incomingProduct/:incomingProductId: This route is used to delete a product from the inventory. The server responds with a status code of 201, a success message, and the ID of the deleted product if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is an admin.

10. POST /returnBorrowed/:orderId/:productId: This route is used to return a borrowed product. The server responds with a status code of 201 and a success message if the product is returned before the last return date. If the returning time has expired, the server responds with a status code of 200 and a message indicating that the product has moved to sales. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is a manager.

11. GET /inventoryProducts: This route is used to get all the products in the inventory. The server responds with a status code of 200 and a list of incoming products if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is an admin.

12. GET /sales: This route is used to get all the sales. The server responds with a status code of 200 and a list of sales if there are any. If there are no sales, the server responds with a status code of 200 and a message indicating that there are no sales to show. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is an admin.

13. GET /borrowings: This route is used to get all the borrowings. The server responds with a status code of 200 and a list of borrowings if there are any. If there are no borrowings, the server responds with a status code of 200 and a message indicating that there are no borrowings to show. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user who is a manager.


Customers routes:
14. GET /: This route is used to get all the products. The server responds with a status code of 200 and a list of products if there are any. If there are no products, the server responds with a status code of 200 and a message indicating that there are no products to show. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly.

15. GET /product/:productId: This route is used to get a specific product. The server responds with a status code of 200 and the product details if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly.

16. *POST /cart/:productId: This route is used to add a product to the cart. The request body should include:

quantity: Quantity of the product to add.
isBorrowed: A boolean value indicating whether the product is borrowed or not.
borrowingWeeks: Number of weeks the product is borrowed for.
The server responds with a status code of 201, a success message, and the updated cart if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly.

17. DELETE /cart/:productId: This route is used to remove a product from the cart. The server responds with a status code of 201 and a success message if the operation is successful. If the product is not in the cart, the server responds with a status code of 200 and a message indicating that the product is already not in the cart. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly.

18. GET /cart: This route is used to get all the items in the cart. The server responds with a status code of 200 and a list of cart items if there are any. If there are no items in the cart, the server responds with a status code of 200 and a message indicating that there are no products in the cart. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly.

19. POST /order: This route is used to place an order. The server responds with a status code of 201, a success message, and the order details if the operation is successful. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by an authenticated user.

20. GET /orders: This route is used to get all the orders of a user. The server responds with a status code of 200 and a list of orders if there are any. If there are no orders, the server responds with a status code of 200 and a message indicating that there are no orders to show. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly.

21. GET /order/:orderId: This route is used to get an invoice for a specific order. The server generates a PDF invoice for the order and responds with a status code of 200, the invoice as a PDF file, and the ‘Content-Type’ and ‘Content-desposition’ headers set appropriately. If there’s an error, the server responds with an appropriate status code and error message. The client should handle these responses accordingly. Note that this route can only be accessed by the user who placed the order.
