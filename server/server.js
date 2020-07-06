const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express"); //apollo-server via express to communicate with MongoDB
const { PubSub } = require("apollo-server"); // For Subscription
const mongoose = require("mongoose"); // MongoDB ORM
const merge = require("lodash/merge");
const { createServer } = require("http");

// Type Definitions and Resolvers for List and Card
const { listResolvers, listTypeDefs } = require("./list");
const { cardResolvers, cardTypeDefs } = require("./card");

// Database Model
const listModel = require("./list/model");
const cardModel = require("./card/model");

// Subscription
const SUBSCRIPTION_CONSTANTS = require("./subscriptionConstants"); // constants used for subscription Resolver

const typeDefs = gql`
  type Subscription {
    listAdded: List
    cardAdded: Card
    onListPosChange: List
    onCardPosChange: Card
  }

  ${cardTypeDefs}
  ${listTypeDefs}
`;

const pubsub = new PubSub();

const SubscriptionsResolvers = {
  Subscription: {
    listAdded: {
      subscribe: () =>
        pubsub.asyncIterator([SUBSCRIPTION_CONSTANTS.LIST_ADDED]),
    },
    cardAdded: {
      subscribe: () =>
        pubsub.asyncIterator([SUBSCRIPTION_CONSTANTS.CARD_ADDED]),
    },
    onListPosChange: {
      subscribe: () =>
        pubsub.asyncIterator([SUBSCRIPTION_CONSTANTS.ON_LIST_POS_CHANGE]),
    },
    onCardPosChange: {
      subscribe: () =>
        pubsub.asyncIterator([SUBSCRIPTION_CONSTANTS.ON_CARD_POS_CHANGE]),
    },
  },
};

const customResolvers = {
  List: {
    cards(parent, args, cxt) {
      return cxt.card.getCardByListId(parent._id);
    },
  },
};

const resolvers = merge(
  cardResolvers,
  listResolvers,
  customResolvers,
  SubscriptionsResolvers
);

//connect to mlab database
mongoose
  .connect(
    "mongodb+srv://tc123:tc123@cluster0.njmfv.mongodb.net/trello-clone?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("mongodb connected successfully");

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        card: cardModel,
        list: listModel,
        publisher: pubsub,
        SUBSCRIPTION_CONSTANTS: SUBSCRIPTION_CONSTANTS,
      }),
      playground: {
        tabs: [
          {
            endpoint: "/graphql",
          },
        ],
      },
    });

    const app = express();
    server.applyMiddleware({ app });

    const httpServer = createServer(app);
    server.installSubscriptionHandlers(httpServer);

    const PORT = 4000;
    httpServer.listen({ port: PORT }, () => {
      console.log(`Server is running in port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });