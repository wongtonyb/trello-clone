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

export { updateListPosMutation, insertListMutation };
