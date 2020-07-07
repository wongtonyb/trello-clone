import React, { Component } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import { graphql } from "react-apollo";
import * as compose from "lodash.flowright";
import { client } from "../App.js";

//queries
import { getListsQuery } from "./queries/queries";
import { updateListPosMutation } from "./queries/mutations";
import { onListPosChangeSubscription } from "./queries/subscriptions";

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
    };
    this.onColumnDrop = this.onColumnDrop.bind(this);
    this.onCardDrop = this.onCardDrop.bind(this);
    this.getCardPayload = this.getCardPayload.bind(this);
    this.sortListByPos = this.sortListByPos.bind(this);
    this.updateListPos = this.updateListPos.bind(this);
  }

  async componentDidMount() {
    try {
      const { data } = await client.query({
        query: getListsQuery,
      });
      this.setState({ lists: data.getLists });
      //setup subscription point
      this.subscribeToListPosChange(this.updateListPos);
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
    let updatedLists = this.state.lists;
    updatedLists[updatedList.pos] = updatedList;
    this.setState(updatedLists);
  }

  sortListByPos() {
    let sortedList = this.state.data.lists.sort((a, b) => a.pos - b.pos);
    this.setState({
      data: {
        lists: sortedList,
      },
    });
  }

  getCardPayload(columnId, index) {
    console.log("getcardpayload");
  }

  onColumnDrop(dropResult) {
    const { removedIndex, addedIndex } = dropResult;
    let lists = this.props.getListsQuery.getLists;
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
          refetchQueries: [{ query: getListsQuery }],
        });
      }
    }
  }

  onCardDrop(columnId, dropResult) {
    console.log("oncarddrop");
  }

  render() {
    return (
      <div className="card-scene">
        <form>
          <label>Add a new list!</label>
          <input placeholder="Title" />
          <button>Add</button>
        </form>
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
                <Draggable className="list">
                  <div className="card-column-header">
                    <span className="column-drag-handle">&#x2630;</span>
                    {list.title}
                  </div>
                  <Container
                    groupName="list"
                    // onDragStart={(e) => console.log("drag started", e)}
                    // onDragEnd={(e) => console.log("drag end", e)}
                    onDrop={(e) => this.onCardDrop(list.id, e)}
                  >
                    {list.cards.map((card) => {
                      return (
                        <Draggable key={card.id}>
                          <div className="card">
                            <p>{card.description}</p>
                          </div>
                        </Draggable>
                      );
                    })}
                    <form>
                      <label>Add a new card!</label>
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
  graphql(onListPosChangeSubscription, { name: "onListPosChangeSubscription" })
)(Board);
