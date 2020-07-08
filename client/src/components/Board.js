import React, { Component } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import { graphql } from "react-apollo";
import * as compose from "lodash.flowright";
import { client } from "../App.js";

//components
import AddList from "./AddList";
import AddCard from "./AddCard";

//queries
import { getListsQuery } from "./queries/queries";
import {
  updateListPosMutation,
  updateCardPosMutation,
  deleteCardMutataion,
  deleteListMutation,
} from "./queries/mutations";
import {
  onListPosChangeSubscription,
  onListAddedSubscription,
  onCardPosChangeSubscription,
  onCardAddedSubscription,
  cardDeletedSubscription,
  listDeletedSubscription,
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
    this.updateListPos = this.updateListPos.bind(this);
    this.addList = this.addList.bind(this);
    this.updateCard = this.updateCard.bind(this);
    this.addCard = this.addCard.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.deleteCardSubscription = this.deleteCardSubscription.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.deleteListSubscription = this.deleteListSubscription.bind(this);
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
      this.subscribeToCardAdded(this.addCard);
      this.subscribeToCardDeleted(this.deleteCardSubscription);
      this.subscribeToListDeleted(this.deleteListSubscription);
    } catch (err) {
      console.error(err);
    }
  }

  // ----------------SUBSCRIPTIONS-------------------------------------------
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
        query: onCardPosChangeSubscription,
      })
      .subscribe({
        next({ data }) {
          updateCard(data.onCardPosChange);
        },
      });
  };
  updateCard(updatedCard) {
    // retrieve List By CardId, replace an entire singular list
    // updatedCard is giving back the NEW data
    if (updatedCard) {
      const { id, listId, pos } = updatedCard;
      let lists = this.state.lists.slice();
      //find the old card - delete
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        let cards = list.cards;
        for (let j = 0; j < cards.length; j++) {
          let card = cards[j];
          if (card.id === id) {
            cards.splice(j, 1);
            this.setState({ lists: lists });
            break;
          }
        }
      }
      //insert new card
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (listId === list.id) {
          list.cards.splice(pos, 0, updatedCard);
          this.setState({ lists: lists });
          break;
        }
      }
    }
  }

  //subscription cardAdded
  subscribeToCardAdded = (addCard) => {
    client
      .subscribe({
        query: onCardAddedSubscription,
      })
      .subscribe({
        next({ data }) {
          addCard(data.cardAdded);
        },
      });
  };
  addCard(newCard) {
    if (newCard) {
      const { listId } = newCard;
      let lists = [...this.state.lists];
      for (let i = 0; i < lists.length; i++) {
        if (lists[i].id === listId) {
          lists[i].cards.push(newCard);
          this.setState({ lists: lists });
          break;
        }
      }
    }
  }

  //subscription cardDeleted
  subscribeToCardDeleted = (deleteCardSubscription) => {
    client
      .subscribe({
        query: cardDeletedSubscription,
      })
      .subscribe({
        next({ data }) {
          deleteCardSubscription(data.cardDeleted);
        },
      });
  };
  deleteCardSubscription(cardDeleted) {
    if (cardDeleted) {
      const cardId = cardDeleted.id;
      const { listId } = cardDeleted;
      let lists = [...this.state.lists];
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (list.id === listId) {
          let cards = list.cards;
          for (let j = 0; j < cards.length; j++) {
            let card = cards[j];
            if (card.id === cardId) {
              let cardPos = card.pos;
              cards.splice(cardPos, 1);
              this.setState({ lists: lists });
              break;
            }
          }
        }
      }
    }
  }

  //subscription listDeleted
  subscribeToListDeleted = (deleteListSubscription) => {
    client
      .subscribe({
        query: listDeletedSubscription,
      })
      .subscribe({
        next({ data }) {
          deleteListSubscription(data.listDeleted);
        },
      });
  };
  deleteListSubscription(listDeleted) {
    if (listDeleted) {
      //must use id instead of pos
      //cause list is already deleted for current user,
      //pos will remove more for that specifc user
      const { id, pos } = listDeleted;
      let lists = [...this.state.lists];
      if (lists[pos] && lists[pos].id === id) {
        lists.splice(pos, 1);
      }
      this.setState({ lists: lists });
    }
  }

  // ---------------------------------------------------------------------

  onColumnDrop(dropResult) {
    const { removedIndex, addedIndex } = dropResult;
    let lists = this.state.lists.slice();
    let list = lists.splice(removedIndex, 1);
    lists.splice(addedIndex, 0, list[0]);
    //set state first for better rendering/ui experience for current user
    this.setState({ lists: lists });
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

  async onCardDrop(l, dropResult) {
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
    // let cardId = this.state.dragCardId;
    // let oldListId = this.state.dragLeaveListId;
    let newListId = this.state.dragEnterListId;
    //update Card - listId
    //update Card - pos
    //built in onDrop function executes for every list created -
    //this makes sure it only executes on a valid change
    if (dropResult.addedIndex !== null && newCardPos !== null) {
      if (oldListPos === newListPos && oldCardPos === newCardPos) {
      } else {
        //update pos of all cards from oldList
        //.slice() creates a shallow copy that doesnt alter the original (state)
        let lists = this.state.lists.slice();
        let oldCards = lists[oldListPos].cards;
        let currCard = oldCards.splice(oldCardPos, 1)[0];
        for (let i = oldCardPos; i < oldCards.length; i++) {
          await this.props.updateCardPosMutation({
            variables: {
              cardId: oldCards[i].id,
              listId: oldCards[i].listId,
              pos: i,
            },
          });
        }
        //update pos of rest of cards in new list
        let newCards = lists[newListPos].cards;
        if (newListId === currCard.listId) newCards = oldCards;
        newCards.splice(newCardPos, 0, currCard);
        this.setState({ lists: lists });
        //card pos changed within same list
        for (let i = newCardPos; i < newCards.length; i++) {
          await this.props.updateCardPosMutation({
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
  }

  //delete Card
  async deleteCard(card, list) {
    const { id } = card;
    const cardPos = card.pos;
    const listPos = list.pos;
    let lists = [...this.state.lists];
    lists[listPos].cards.splice(cardPos, 1);
    //delete card
    this.props.deleteCardMutataion({
      variables: {
        cardId: id,
      },
    });
    //update cardPos for everythign else
    for (let i = cardPos; i < lists[listPos].cards.length; i++) {
      let card = lists[listPos].cards[i];
      await this.props.updateCardPosMutation({
        variables: {
          cardId: card.id,
          listId: card.listId,
          pos: i,
        },
      });
      card.pos = i;
    }
    //set state for this user - better ui/ux for current user
    this.setState({ lists: lists });
  }

  //delete List
  async deleteList(list) {
    const { id, pos, cards } = list;
    let lists = [...this.state.lists];
    lists.splice(pos, 1);
    this.setState({ lists: lists });
    //delete list
    await this.props.deleteListMutation({
      variables: {
        listId: id,
      },
    });
    //delete cards in list
    for (let i = 0; i < cards.length; i++) {
      const { id } = cards[i];
      this.props.deleteCardMutataion({
        variables: {
          cardId: id,
        },
      });
    }
    //update other lists' position
    for (let i = pos; i < lists.length; i++) {
      let list = lists[i];
      this.props.updateListPosMutation({
        variables: {
          listId: list.id,
          pos: i,
        },
      });
    }
  }

  // ---------------------------- RENDER--------------------------------------

  render() {
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
                    <span className="del" onClick={() => this.deleteList(list)}>
                      &#x2421;
                    </span>
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
                    // dragBeginDelay={100}
                  >
                    {list.cards.map((card) => {
                      return (
                        <Draggable key={card.id + card.pos}>
                          <div className="card">
                            <span
                              className="del-card"
                              onClick={() => this.deleteCard(card, list)}
                            >
                              &#x2421;
                            </span>
                            <p>{card.description}</p>
                            <p>cardId = {card.id}</p>
                            <p>pos = {card.pos}</p>
                            <p>listId = {card.listId}</p>
                          </div>
                        </Draggable>
                      );
                    })}
                    <AddCard list={list} />
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
  graphql(updateCardPosMutation, { name: "updateCardPosMutation" }),
  graphql(deleteCardMutataion, { name: "deleteCardMutataion" }),
  graphql(deleteListMutation, { name: "deleteListMutation" })
)(Board);
