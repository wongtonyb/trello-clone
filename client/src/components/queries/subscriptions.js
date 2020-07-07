import { gql } from "apollo-boost";

const onListPosChangeSubscription = gql`
  subscription {
    onListPosChange {
      id
      title
      pos
      cards {
        id
        description
        pos
      }
    }
  }
`;

const onListAddedSubscription = gql`
  subscription {
    listAdded {
      id
      title
      pos
      cards {
        id
        description
        pos
      }
    }
  }
`;
export { onListPosChangeSubscription, onListAddedSubscription };
