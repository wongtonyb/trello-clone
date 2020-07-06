import { gql } from "apollo-boost"; //graphql - javascript parser

const getListsQuery = gql`
  {
    getLists {
      id
      title
      pos
      cards {
        id
        description
        pos
        listId
      }
    }
  }
`;

export { getListsQuery };
