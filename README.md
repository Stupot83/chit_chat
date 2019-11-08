# Chit Chat App #

## Features Implemented for Chit_Chat App ##

```
-   [x]   As a Maker
           So that I can let people know what I am doing  
           I want to post a message (peep) to Chit Chat

-   [x]   As a maker
           So that I can see what others are saying  
           I want to see all peeps in reverse chronological order

-   [x]   As a Maker
           So that I can better appreciate the context of a peep
           I want to see the time at which it was made

-   [x]   As a Maker
           So that I can post messages on Chit Chat as me
           I want to sign up for Chit Chat

-   [x]   As a Maker
           So that only I can post messages on Chit Chat as me
           I want to log in to Chit Chat

-   [x]   As a Maker
           So that I can avoid others posting messages on Chit Chat as me
           I want to log out of Chit Chat

EXTRAS

-   [x]   As a Maker
           So that I can leave Chit Chat
           I want to be able to delete my account including all chits + followings

-   [x]   As a Maker
           So that I can change my account details
           I want to be able to edit my account

-   [x]   As a Maker
           So that I can change the content of a chit
           I want to be able to edit my specific chits

-   [x]   As a Maker
           So that I can see what my friends are doing
           I want to be able to follow my friends

-   [x]   As a Maker
           So that I can stop seeing what my friends are doing
           I want to be able to unfollow friends

-   [x]   As a Maker
           So that I can see what my friends are chitting
           I only want to be able to see mine or my friends chits on the feed


STILL IN DEVELOPMENT

-   [ ]   As a Maker
           So that I can stay constantly tapped in to the shouty box of Chit Chat
           I want to receive an email if I am tagged in a Peep
```

## Getting Started ##

As the challenge was originally designed to work with SQL, I have reworked the setup to use MongoDB instead.

Before installing the app, you will need to make sure you follow these instructions:

### MongoDB ###

MongoDB is a document database which stores data in flexible, JSON-like documents. You will need to install Mongo locally. To do this, please visit the official download page at **https://www.mongodb.com/download-center/community** and
download the correct version of the community server for your operating system. There’s a link to detailed, OS-specific installation instructions beneath every download link, which you can consult if you run into trouble.

### MongoDB GUI ###

You should also install Compass, the official GUI for MongoDB at **https://www.mongodb.com/download-center/compass**. This tool helps you
visualize and manipulate the data, allowing you to interact with documents with full CRUD functionality.

### Check Installed Correctly ###

It is worth checking that you have node and npm installed and the version that your
system is running. To check node is installed and the versioon you have, type:

`node -v`

and for npm type:

`npm -v`

This will output the version number of each program (`8.11.3` and `6.3.0` respectively at the time of writing).

To check that your local installation of Mongo has worked and ther version, type:

`mongo --version`

This should output a bunch of information, including the version number (`4.0.3` at the time of writing).

### Check Database Connection Using Compass ###

Type the following command into a terminal:

`mongod`

Next, open Compass. You should be able to accept the defaults (server: localhost, port: 27017), press the CONNECT button, and establish a connection to the database server.

Note that the databases `admin` and `local` are created automatically and can be ignored.

### Install the App and Setup Dependencies ###

To get the app installed, fork the repo in GitHub. Then, clone it to your own computer. Run `npm install` to get all the dependencies set up. This should add everything that is needed to run the Chit Chat App locally, including mongoose which helps create the mongo database schemas for User, Chit and Following.

Mongoose Virtuals have been used for the createdAt and postedAt times as this data is derived and doesn't need to be stored. By using derived data from the database this reduces data redundancy.

### Running the App ###

Run `npm run watch` or `nodemon server.js`  to start the app. Once you have created a user, you will be able to use the app and see it's various functionality from the frontend.

> **Note:** running `npm run watch` or `nodemon server.js` will make the app automatically restart when you make changes - no need to constantly stop and restart the server

You can also use the Compass GUI to see the information that is being entered into the Mongo Database and how it changes when data is updated or deleted, or when you follow/unfollow a user for example. This confirms the backend functionality.

When you have finished testing the app, you can also use the Compass GUI to drop the Users, Chits and Followings collections when you are finished testing the app, or can drop the chit_chat database as a whole.

### Running the unit tests ###

To run the unit tests, you must have the app running on another terminal. Type
`npm test` to run the unit tests.

### Running Cypress for feature tests ###

To run the feature tests, you must have the app running on another terminal. Type
`npx cypress open` to see the cypress console. From here click on the option to run all specs to see the tests run to completion.

### Key Files/Notes ###

- `public/tailwind.css` - a CSS framework used to style the app. See
    https://tailwindcss.com/ for more information
- `views/` - a set of HTML pages for each part of the app. These use
  [Handlebars](https://handlebarsjs.com/) to include data in our HTML pages
- `routes.js` - what to do for each route (method and URL) in the app
- `server.js` - sets everything up and starts the app
- `dataAccess/dataAccess.js` - file to set up all the methods to interact with the
  mongo database. Includes inserts, finds, updates and deletes
- Use of Mongoose to create schemas for mongo database for User, Chit and             Following. Unique indexes used to prevent replicated data
- App stores the data using mongodb, in the form of collections for Users, Chits     and Followings
