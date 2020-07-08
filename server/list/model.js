const Mongoose = require("mongoose");

// model
const listSchema = new Mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  pos: {
    type: Number,
    required: true,
  },
});

// model querying functions
class List {
  static getLists() {
    return this.find().sort("pos").exec();
  }

  static getListById(listId) {
    return this.findOne({
      _id: Mongoose.mongo.ObjectID(listId),
    }).exec();
  }

  static insertList(listInfo) {
    const list = this(listInfo);

    return list.save();
  }

  static updatePos(listId, pos) {
    return this.findOneAndUpdate(
      {
        _id: Mongoose.mongo.ObjectID(listId),
      },
      {
        $set: {
          pos,
        },
      },
      {
        new: true,
      }
    ).exec();
  }

  static deleteList(listId) {
    return this.findOneAndDelete({
      _id: Mongoose.mongo.ObjectID(listId),
    }).exec();
  }
}

listSchema.loadClass(List);

module.exports = Mongoose.model("List", listSchema);
