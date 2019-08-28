This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Purpose

It shows an example 'tree' in which there are two 'frames'.

The question is how to add Client-side React routing logic which allows nav links to trigger render changes in different parts of the tree. Currently the react-router implementation is such that navigation affects all subtrees the same.

The idea is to more-or-less duplicate the behaviour of target="_self" if there were a _real_ frameset. In other words, instead of a link clicked in the left frame affecting both the left AND right frames, it would only cause the content in the left frame to navigate.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

