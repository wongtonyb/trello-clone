const mutationResolvers = require("./mutationResolvers");
const queryResolvers = require("./queryResolvers");
const { gql } = require("apollo-server-express");

const cardTypeDefs = gql`
  type Card {
    id: ID!
    description: String!
    pos: Int!
    listId: ID!
  }

  type Query {
    card: String
    fetchCardsByListId(request: cardListInput): [Card]
  }

  type Mutation {
    insertCard(request: insertCardInput): Card
    updateCardPos(request: updateCardPosInput): Card
    deleteCard(request: deleteCardInput): Card
  }

  input cardListInput {
    listId: String!
  }
  input insertCardInput {
    description: String!
    pos: Int!
    listId: ID!
  }
  input updateCardPosInput {
    cardId: String!
    listId: String!
    pos: Int!
  }
  input deleteCardInput {
    cardId: String!
  }
`;

const cardResolvers = {
  Query: {
    ...queryResolvers,
  },
  Mutation: {
    ...mutationResolvers,
  },
};

module.exports = {
  cardTypeDefs,
  cardResolvers,
};
