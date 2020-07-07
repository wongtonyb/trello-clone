import React, { Component } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import { graphql } from "react-apollo";
import * as compose from "lodash.flowright";
import { client } from "../App.js";

//components
import AddList from "./AddList";

//queries
import { getListsQuery } from "./queries/queries";
import {
  updateListPosMutation,
  updateCardPosMutation,
} from "./queries/mutations";
import {
  onListPosChangeSubscription,
  onListAddedSubscription,
  onCardPosChangeSubscriptions,
} from "./queries/subscriptions";

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
      dragLeaveListId: null,
      dragEnterListId: null,
      dragCardId: null,
      onDropRemovedPos: null,
      onDropAddedPos: null,
      oldListPos: null,
      oldCardPos: null,
    };
    this.onColumnDrop = this.onColumnDrop.bind(this);
    this.onCardDrop = this.onCardDrop.bind(this);
    this.getCardPayload = this.getCardPayload.bind(this);
    this.sortListByPos = this.sortListByPos.bind(this);
    this.updateListPos = this.updateListPos.bind(this);
    this.addList = this.addList.bind(this);
    this.updateCard = this.updateCard.bind(this);
    this.addCard = this.addCard.bind(this);
  }

  async componentDidMount() {
    try {
      const { data } = await client.query({
        query: getListsQuery,
      });
      this.setState({ lists: data.getLists });
      //setup subscription point
      this.subscribeToListPosChange(this.updateListPos);
      this.subscribeToListAdded(this.addList);
      this.subscribeToCardPosChange(this.updateCard);
    } catch (err) {
      console.error(err);
    }
  }

  //upon subscription hit, execute updateListPos
  subscribeToListPosChange = (updateListPos) => {
    client
      .subscribe({
        query: onListPosChangeSubscription,
      })
      .subscribe({
        next({ data }) {
          updateListPos(data.onListPosChange);
        },
      });
  };
  //execution after subscription triggered
  //replace old list with new list
  updateListPos(updatedList) {
    if (updatedList) {
      let lists = this.state.lists;
      lists[updatedList.pos] = updatedList;
      this.setState({ lists });
    }
  }
  //subscription List Position Change
  subscribeToListAdded = (addList) => {
    client
      .subscribe({
        query: onListAddedSubscription,
      })
      .subscribe({
        next({ data }) {
          addList(data.listAdded);
        },
      });
  };
  addList(newList) {
    console.log("addList Sub");
    if (newList) {
      let prevLists = this.state.lists;
      this.setState({
        lists: [...prevLists, newList],
      });
    }
  }
  //subscription Card Position Change
  subscribeToCardPosChange = (updateCard) => {
    client
      .subscribe({
        query: onCardPosChangeSubscriptions,
      })
      .subscribe({
        next({ data }) {
          updateCard(data.onCardPosChange);
        },
      });
  };
  async updateCard(updatedCard) {
    // retrieve List By CardId, replace an entire singular list
    // updated card is giving back the NEW data
    if (updatedCard) {
      console.log(updatedCard);
      const { id, listId, pos } = updatedCard;
      let lists = this.state.lists.slice();
      //find the old card - delete
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        let cards = list.cards;
        for (let j = 0; j < cards.length; j++) {
          let card = cards[j];
          console.log(card.id, id);
          if (card.id === id) {
            cards.splice(card.pos, 1);
            this.setState({ lists: lists });
            break;
          }
        }
      }
      //insert new card
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (listId === list.id) {
          //   console.log(listId, list.id, pos, "state change");
          console.log(pos, list.cards[pos], updatedCard);
          if (list.cards[pos]) {
            list.cards[pos] = updatedCard;
          } else {
            list.cards.push(updatedCard);
          }
          this.setState({ lists: lists });
          break;
        }
      }
    }
  }

  sortListByPos(arr) {
    let sortedList = arr.sort((a, b) => a.pos - b.pos);
    // this.setState({
    //   data: {
    //     lists: sortedList,
    //   },
    // });
  }

  onColumnDrop(dropResult) {
    const { removedIndex, addedIndex } = dropResult;
    let lists = this.state.lists.slice();
    let list = lists.splice(removedIndex, 1);
    lists.splice(addedIndex, 0, list[0]);
    for (let i = 0; i < lists.length; i++) {
      //   update pos value for all list elements
      if (lists[i].pos !== i) {
        this.props.updateListPosMutation({
          variables: {
            listId: lists[i].id,
            pos: i,
          },
          //   refetchQueries: [{ query: getListsQuery }],
        });
      }
    }
  }

  getCardPayload(listPos, index) {
    // console.log("payload", listPos, index);
    let dragCardId = this.state.lists[listPos].cards[index].id;
    this.setState({ dragCardId, oldListPos: listPos, oldCardPos: index });
  }

  onCardDrop(l, dropResult) {
    // console.log("oncarddrop", dropResult.removedIndex, dropResult.addedIndex);
    if (dropResult.removedIndex !== null) {
      this.setState({ onDropRemovedPos: dropResult.removedIndex });
    }
    if (dropResult.addedIndex !== null) {
      this.setState({ onDropAddedPos: dropResult.addedIndex });
    }
    let oldCardPos = this.state.oldCardPos;
    let newCardPos = this.state.onDropAddedPos;
    let oldListPos = this.state.oldListPos;
    let newListPos = l.pos;
    let cardId = this.state.dragCardId;
    let oldListId = this.state.dragLeaveListId;
    let newListId = this.state.dragEnterListId;
    //update Card - listId
    //update Card - pos
    //built in onDrop function executes for every list created -
    // this makes sure it only executes on a valid change
    if (dropResult.addedIndex !== null && newCardPos !== null) {
      if (oldListPos === newListPos && oldCardPos === newCardPos) {
      } else {
        // console.log(
        //   "update-mutation",
        //   cardId,
        //   newListId,
        //   newListPos,
        //   newCardPos
        // );
        // this.props.updateCardPosMutation({
        //   variables: {
        //     cardId: cardId,
        //     listId: newListId,
        //     pos: newCardPos,
        //   },
        // });
        // console.log(
        //   "updating-state-lists",
        //   "oldListPos",
        //   oldListPos,
        //   "oldCardPos",
        //   oldCardPos,
        //   "newListPos",
        //   newListPos,
        //   "newCardPos",
        //   newCardPos
        // );
        //update pos of all cards from oldList
        //.slice() creates a shallow copy that doesnt alter the original (state)
        let oldCards = this.state.lists[oldListPos].cards.slice();
        let currCard = oldCards.splice(oldCardPos, 1)[0];
        for (let i = oldCardPos; i < oldCards.length; i++) {
          this.props.updateCardPosMutation({
            variables: {
              cardId: oldCards[i].id,
              listId: oldCards[i].listId,
              pos: i,
            },
          });
        }
        //update pos of rest of cards in new list
        let newCards = this.state.lists[newListPos].cards.slice();
        if (newListId === currCard.listId) newCards = oldCards.slice();
        newCards.splice(newCardPos, 0, currCard);
        //card pos changed within same list
        for (let i = newCardPos; i < newCards.length; i++) {
          this.props.updateCardPosMutation({
            variables: {
              cardId: newCards[i].id,
              listId: newListId,
              pos: i,
            },
          });
        }
      }
      this.setState({
        dragLeaveListId: null,
        dragEnterListId: null,
        dragCardId: null,
        onDropRemovedPos: null,
        onDropAddedPos: null,
        oldListPos: null,
        oldCardPos: null,
      });
    }
    // ****continue here
    // console.log(listLeftId, oldListPos, dropResult);
    // console.log(this.state);
  }

  addCard() {}

  render() {
    // console.log(this.props.getListsQuery.getLists);
    return (
      <div className="card-scene">
        <AddList lists={this.state.lists} />
        <Container
          className="main-container"
          orientation="horizontal"
          onDrop={(e) => this.onColumnDrop(e)}
          dragHandleSelector=".column-drag-handle"
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: "cards-drop-preview",
          }}
        >
          {this.props.getListsQuery.loading ? (
            <div>Loading Lists...</div>
          ) : (
            this.state.lists.map((list) => {
              return (
                <Draggable key={list.id + list.pos} className="list">
                  <div className="card-column-header">
                    <span className="column-drag-handle">&#x2630;</span>
                    {list.title}
                  </div>
                  <Container
                    groupName="list"
                    // onDragStart={(e) => console.log("drag started", e)}
                    // onDragEnd={(e) => console.log("drag end", e)}
                    onDrop={(e) => this.onCardDrop(list, e)}
                    getChildPayload={(index) =>
                      this.getCardPayload(list.pos, index)
                    }
                    dragClass="card-ghost"
                    dropClass="card-ghost-drop"
                    onDragEnter={() => {
                      this.setState({ dragEnterListId: list.id });
                      //   console.log("enter", list.id);
                    }}
                    onDragLeave={() => {
                      this.setState({ dragLeaveListId: list.id });
                      //   console.log("leave", list.id);
                    }}
                    // onDropReady={(p) =>
                    //   this.setState({
                    //     dropReadyCardPos: p.addedIndex,
                    //   })
                    // }
                    dropPlaceholder={{
                      animationDuration: 150,
                      showOnTop: true,
                      className: "drop-preview",
                    }}
                    dropPlaceholderAnimationDuration={200}
                  >
                    {list.cards.map((card) => {
                      return (
                        <Draggable key={card.id + card.pos}>
                          <div className="card">
                            <p>{card.description}</p>
                            <p>pos = {card.pos}</p>
                            <p>listId = {card.listId}</p>
                          </div>
                        </Draggable>
                      );
                    })}
                    <form>
                      <label onSubmit={this.addCard}>Add a new card!</label>
                      <input placeholder="Description" />
                      <button>Add</button>
                    </form>
                  </Container>
                </Draggable>
              );
            })
          )}
        </Container>
      </div>
    );
  }
}

export default compose(
  graphql(getListsQuery, { name: "getListsQuery" }),
  graphql(updateListPosMutation, { name: "updateListPosMutation" }),
  graphql(updateCardPosMutation, { name: "updateCardPosMutation" })
)(Board);
