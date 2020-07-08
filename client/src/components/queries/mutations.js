import { gql } from "apollo-boost";

const updateListPosMutation = gql`
  mutation($listId: String!, $pos: Int!) {
    updateListPos(request: { listId: $listId, pos: $pos }) {
      id
      title
      pos
      cards {
        description
        pos
      }
    }
  }
`;

const insertListMutation = gql`
  mutation($title: String!, $pos: Int!) {
    insertList(request: { title: $title, pos: $pos }) {
      id
      title
      pos
      cards {
        description
        pos
      }
    }
  }
`;

const updateCardPosMutation = gql`
  mutation($cardId: String!, $listId: String!, $pos: Int!) {
    updateCardPos(request: { cardId: $cardId, listId: $listId, pos: $pos }) {
      id
      description
      pos
    }
  }
`;

const insertCardMutation = gql`
  mutation($description: String!, $pos: Int!, $listId: ID!) {
    insertCard(
      request: { description: $description, pos: $pos, listId: $listId }
    ) {
      id
      description
      pos
      listId
    }
  }
`;

const deleteCardMutataion = gql`
  mutation($cardId: String!) {
    deleteCard(request: { cardId: $cardId }) {
      id
      description
      pos
      listId
    }
  }
`;

export {
  deleteCardMutataion,
  updateListPosMutation,
  insertListMutation,
  updateCardPosMutation,
  insertCardMutation,
};
