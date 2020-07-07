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

const onCardPosChangeSubscriptions = gql`
  subscription {
    onCardPosChange {
      id
      description
      pos
      listId
    }
  }
`;

export {
  onListPosChangeSubscription,
  onListAddedSubscription,
  onCardPosChangeSubscriptions,
};
