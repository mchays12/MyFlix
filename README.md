## Movie Api
This is a node.js project build with express which contains the API for the MyFlix application

## Prerequisites
- Install node.js
- Install mongodb

## Installation
1. clone repository
2. navigate to project directory in terminal
3. run npm install to install required dependencies
4. set up mongo databases

## Technologies Used
- node
- express
- mongodb

# Defining endpoints

**1. return all movies READ
endpoint:**

/movies

**2. return movie by title READ
endpoint:**

/movies/:Title

**3. return movies by genre name READ
endpoint:**

/movies/genre/:Genre

**4. return movies by director name READ
endpoint:**

/movies/directors/:Director

**5. get information about a director by name READ
endpoint:**

/movies/director_information/:Director

**6. get information about a genre by name READ
endpoint:**

/movies/genre_information/:Genre

**7. allow users to add a movie to their list of favorites UPDATE/CREATE
endpoint:**

/users/:Username/movies/:MovieID

**8. allow users to remove a movie from their list of favorites DELETE
endpoint:**

/users/:Username/movies/:MovieID

**9. allow new user to register CREATE
endpoint:**

/users

**10. allow users to update their user name UPDATE
endpoint:**

/users/:Username

**11. allow existing user to deregister DELETE
endpoint:**

/users/:Username
