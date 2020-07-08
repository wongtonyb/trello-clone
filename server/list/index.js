const mutationResolvers = require("./mutationResolvers");
const queryResolvers = require("./queryResolvers");
const { gql } = require("apollo-server-express");

//Type Definition
const listTypeDefs = gql`
  type List {
    id: ID!
    title: String!
    pos: Int!
    cards: [Card]
  }

  extend type Query {
    getLists: [List]
  }

  extend type Mutation {
    insertList(request: insertListInput): List
    updateListPos(request: updateListPosInput): List
    deleteList(request: deleteListInput): List
  }

  input insertListInput {
    title: String!
    pos: Int!
  }

  input updateListPosInput {
    listId: String!
    pos: Int!
  }

  input deleteListInput {
    listId: String!
  }
`;

//Query and Mutation names must be the same as the resolvers

//Resolver Definition
const listResolvers = {
  Query: {
    ...queryResolvers,
  },
  Mutation: {
    ...mutationResolvers,
  },
};

module.exports = {
  listTypeDefs,
  listResolvers,
};
