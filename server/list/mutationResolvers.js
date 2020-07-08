const insertList = async (__, args, cxt) => {
  try {
    //inputs
    const listInfo = {
      title: args.request.title,
      pos: args.request.pos,
    };
    //mongodb - mongoose method
    const list = await cxt.list.insertList(listInfo);
    //what to return subscription
    cxt.publisher.publish(cxt.SUBSCRIPTION_CONSTANTS.LIST_ADDED, {
      listAdded: list, //match subscription type definition
    });
    //return database obj
    return list;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const updateListPos = async (__, args, cxt) => {
  try {
    const listId = args.request.listId;
    const pos = args.request.pos;

    const list = await cxt.list.updatePos(listId, pos);
    // console.log(list);
    cxt.publisher.publish(cxt.SUBSCRIPTION_CONSTANTS.ON_LIST_POS_CHANGE, {
      onListPosChange: list,
    });

    return list;
  } catch (e) {
    console.log("Error =>", e);
    return null;
  }
};

const deleteList = async (_, args, cxt) => {
  try {
    const listId = args.request.listId;

    const list = await cxt.list.deleteList(listId);

    cxt.publisher.publish(cxt.SUBSCRIPTION_CONSTANTS.LIST_DELETED, {
      listDeleted: list,
    });

    return list;
  } catch (e) {
    console.log("Error =>", e);
    return null;
  }
};

module.exports = {
  insertList,
  updateListPos,
  deleteList,
};
