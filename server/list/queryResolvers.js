const getLists = async (parent, arg, context) => {
  try {
    const list = await context.list.getLists();
    return list;
  } catch (e) {
    console.log("Error => ", e);
    return null;
  }
};

module.exports = {
  getLists,
};
