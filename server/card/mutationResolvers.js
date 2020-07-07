const insertCard = async (__, args, cxt) => {
  try {
    const cardInfo = {
      description: args.request.description,
      pos: args.request.pos,
      listId: args.request.listId,
    };

    const card = await cxt.card.insertCard(cardInfo);

    cxt.publisher.publish(cxt.SUBSCRIPTION_CONSTANTS.CARD_ADDED, {
      cardAdded: card,
    });

    return card;
  } catch (e) {
    console.log("Error =>", e);

    return null;
  }
};

const updateCardPos = async (__, args, cxt) => {
  try {
    const cardId = args.request.cardId;
    const pos = args.request.pos;
    const listId = args.request.listId;

    const card = await cxt.card.updatePos(cardId, pos, listId);

    cxt.publisher.publish(cxt.SUBSCRIPTION_CONSTANTS.ON_CARD_POS_CHANGE, {
      onCardPosChange: card,
    });

    return card;
  } catch (e) {
    console.log("Error => ", e);

    return null;
  }
};

module.exports = {
  insertCard,
  updateCardPos,
};
