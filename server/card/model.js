const Mongoose = require("mongoose");

const cardSchema = new Mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    pos: {
      type: Number,
      required: true,
    },
    listId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

class Card {
  static insertCard(cardInfo) {
    const card = this(cardInfo);

    return card.save();
  }

  static getCardByListId(listId) {
    return this.find({ listId }).sort("pos").exec();
  }

  static updatePos(cardId, pos, listId) {
    return this.findOneAndUpdate(
      {
        _id: Mongoose.mongo.ObjectID(cardId),
      },
      {
        $set: {
          pos,
          listId,
        },
      },
      { new: true }
    ).exec();
  }
}

cardSchema.loadClass(Card);

module.exports = Mongoose.model("Card", cardSchema);
