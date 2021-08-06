# API Rest Microlearning of LSEC

The project is a rest API with the objective of teaching Ecuadorian Sign Language.


## Tech Stack

**Client:** React, Bootstrap 4

**Server:** Node, Express, MongoDb

  
## Installation

Install my-project with npm

```bash
  npm install my-project
  cd my-project
```
    
## Run Locally

Clone the project

```bash
  git clone https://github.com/JonnathanE/api-microlearning-LSEC.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

  
## Documentation

To deploy this project run

```bash
  npm run docs
```
[Documentation](https://linktodocumentation)
  
## Running Tests

To run tests, run the following command

```bash
  npm run test
```

  
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE`

`DATABASE_TEST`

`JWT_SECRET`

`PORT`

    
## API Reference

#### Get all items

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### add(num1, num2)

Takes two numbers and returns the sum.

  