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

const onCardPosChangeSubscription = gql`
  subscription {
    onCardPosChange {
      id
      description
      pos
      listId
    }
  }
`;

const onCardAddedSubscription = gql`
  subscription {
    cardAdded {
      id
      description
      pos
      listId
    }
  }
`;

const cardDeletedSubscription = gql`
  subscription {
    cardDeleted {
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
  onCardPosChangeSubscription,
  onCardAddedSubscription,
  cardDeletedSubscription,
};
