fetchCardsByListId = async (__, args, cxt) => {
  try {
    const listId = args.request.listId;

    const cards = await cxt.card.getCardByListId(listId);

    return cards;
  } catch (e) {
    console.log("Error =>", e);
    return null;
  }
};

module.exports = {
  fetchCardsByListId,
};
