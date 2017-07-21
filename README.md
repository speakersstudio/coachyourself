# Hello!

## Running the app

Here's a general outline of how to get the Improv Database app running locally!

1.  Pull the repository down to a folder on your computer (duh)
2. Install NodeJS and PostgreSQL
3. Run the command `npm install` on the root project folder. This installs all of the dependencies for the app.
4. Create and set up a PostgreSQL database (see below)
5. Make sure your NODE_ENV environment variable is set to "development"
6. Create a SENDGRID_API_KEY environment variable, set to the SendGrid API key
6. `npm start` should start the app in a terminal
7. Visit https://localhost:1919 to access the webapp, and localhost:1919/api to get the API.
8. If the SSL doesn't work, check the SSL Setup information, below.

---

## Setting up the database

This is required to get the app running.

1. In PGAdmin create a user called `sdbuatyadcczhj` (these are the users generated for the app in the Heroku Postgres plugin)
2. Now create a database called `d1ihmfmjooehcl` (make sure you set that user as the owner)
3. Locate the postgresql folder in the project, which contains the latest backup of the database (probably not the safest system, but it works for now)
4. Use PGAdmin's `restore` function to import the latest BACKUP file from that folder

---

## SSL Setup

This might be required on other dev machines. The key and certificate included was built on my desktop.

To generate your own key and certificate, run the following commands:

```
$ openssl genrsa -out dev-key.pem 1024

$ openssl req -new -key dev-key.pem -out certrequest.csr

$ openssl x509 -req -in certrequest.csr -signkey dev-key.pem -out dev-cert.crt
```

Get openssl in Windows here: https://slproweb.com/products/Win32OpenSSL.html

When you run the second command, it will ask for a bunch of prompts. The main one to keep in mind is that when it asks for "YOUR Name" enter "localhost"

You then have to install that .crt file in your list of Trusted Root Certification Authorities.