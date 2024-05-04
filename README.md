# OTP VERIFACTION API

Created an API to register user, verify user using OTP sent on mail, update user data after verification, login user and to reutrn data of verified user after login.



## API Reference

<b>AWS Lambda Link : https://ihba5p4t433dg5cct6cysjaqpe0smnuw.lambda-url.ap-south-1.on.aws</b>
___
### Register a User

Registers a new user using email and password

```http
  POST /users/register
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |

#### Response:
```javascript
{ "message": "User registered successfully" }
```
___
### Verify User

Verifies user using email address and OTP

```http
  POST /users/verify
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. Your registered email |
| `otp`      | `string` | **Required**. OTP recieved in mail |
#### Response:
```javascript
{ 
  "message": "User has been verified",
  "token" : ${JSON Web Token}
}
```

Returns a JWT, which is needed to update data 

___
### Update User Data

Update user data using JWT

```http
  POST /users/update
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `location`      | `string` | **Required**. Location of user |
| `age`      | `number` | **Required**. Age of user |
| `work`      | `string` | **Required**. Current job of user |


| Authorization | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Authorization`      | `BEARER Token` | **Required**. JSON Web TOken |


#### Response:
```javascript
{ 
  "message": "User data updated successfully",
  "token" : ${JSON Web Token}
}
```
___
### User Login

Login using email and password

```http
  POST /users/login
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |


#### Response:
```javascript
{ 
  "token" : ${JSON Web Token}
}
```
___
### Get User Data

Get user data using JWT generated after login

```http
  GET /users/data
```

| Authorization | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Authorization`      | `BEARER Token` | **Required**. JSON Web TOken |


#### Response:
```javascript
{ 
  "data" : {
      "location" : *user_location*,
      "age"      : *user_age*,
      "work"     : *user_work*
  }
}
```
