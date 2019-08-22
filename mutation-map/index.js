/** Example code based loosely on https://github.com/iamshaunjp/graphql-playlist/blob/lesson-12/server/schema/schema.js  */
const _ = require("lodash")
const graphql = require("graphql")
const express = require("express")
const expressGraphql = require("express-graphql")

const { GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql

// Mutation works:
// mutation {addBook(id:"4", name:"Education Course Guide", genre: "Education"){
// 	id
// }}

// Query proves it worked:
// {lookupBook(id:"4") {
//   name
// }}

// JSON-based Mutation works:
// mutation doAdd($id: String, $name: String!, $genre: String){
//   addBook(id:$id, name:$name, genre:$genre){
//     id
//   }
// }

// with variable...
// {
//   name: "Raspberry Pi and AVR Projects",
//   genre: "Electronics",
//   id: "5"
// }

// Other example books which work - second has no genre
// { name: "Education Course Guide", genre: "Education", id: "4" }
// {
//   name: "Jonathan Livingstone Seagull",
//   id: "6"
// }

var books = [
  { name: "Name of the Wind", genre: "Fantasy", id: "1" },
  { name: "The Final Empire", genre: "Fantasy", id: "2" },
  { name: "The Long Earth", genre: "Sci-Fi", id: "3" }
]

const Book = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    genre: { type: GraphQLString }
  })
})

const Query = new GraphQLObjectType({
  name: "Query",
  fields: {
    lookupBook: {
      type: Book,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return _.find(books, { id: args.id })
      }
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addBook: {
      type: Book,
      args: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        genre: { type: GraphQLString }
      },
      resolve(parent, args) {
        const book = _.cloneDeep(args)
        books.push(book)
        return book
      }
    }
  }
})

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
})

const server = express()
const port = 8080
server.use(
  "/graphql",
  expressGraphql({
    schema,
    graphiql: true
  })
)
server.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
