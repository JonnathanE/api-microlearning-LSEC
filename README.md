# API Rest Microlearning of LSEC

The project is a rest API with the objective of teaching Ecuadorian Sign Language.

The proyect is build in Nodejs. The forntend are below:

- Fontend: https://github.com/JonnathanE/microlearning-LSEC
- DEMO: https://learn-lsec.herokuapp.com/

## Tech Stack

**Client:** React, Tailwind

**Server:** Node v13.12.0, Express, MongoDb


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE`

`DATABASE_TEST`

`JWT_SECRET`

`PORT`

`CLOUDINARY_CLOUD_NAME`

`CLOUDINARY_API_KEY`

`CLOUDINARY_API_SECRET`
    
## Run Locally

Clone the project

```bash
  git clone https://github.com/JonnathanE/api-microlearning-LSEC.git
```

Go to the project directory

```bash
  cd api-microlearning-LSEC
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

To run unit tests, run the following command

```bash
  npm run test
```

To run e2e tests, run the following command

```bash
  npm run start:test
```

## API Reference

You can go to the `http_API` folder, where you can find a json document of the API and its routes. Upload the file to Postman to view it.
  