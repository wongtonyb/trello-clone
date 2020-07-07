import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { HttpLink } from "apollo-link-http";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";

//components
// import Example from "./components/Example";
import Board from "./components/Board";

// https://www.apollographql.com/docs/react/data/subscriptions/
// create an http link
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

//create a WebSocketLink
const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    reconnect: true,
  },
});

// split enables data to be send to different links depending on kind of operation
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);
//subscriptions are send to wsLink, rest (Queries & Mutations) are send to httpLink

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <h1>Trello-Clone</h1>
      <Board />
      {/* <Example /> */}
    </ApolloProvider>
  );
}

export default App;
