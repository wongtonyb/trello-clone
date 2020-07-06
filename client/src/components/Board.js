import React, { Component } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import { applyDrag, generateItems } from "./utils";
import { graphql } from "react-apollo";
import * as compose from "lodash.flowright";

//queries
import { getListsQuery } from "./queries/queries";
import { updateListPosMutation } from "./queries/mutations";

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onColumnDrop = this.onColumnDrop.bind(this);
    this.onCardDrop = this.onCardDrop.bind(this);
    this.getCardPayload = this.getCardPayload.bind(this);
    // this.sortListByPos = this.sortListByPos.bind(this);
  }

  //   sortListByPos() {
  //     let sortedList = this.state.data.lists.sort((a, b) => a.pos - b.pos);
  //     this.setState({
  //       data: {
  //         lists: sortedList,
  //       },
  //     });
  //   }

  getCardPayload(columnId, index) {
    console.log("getcardpayload");
  }

  onColumnDrop(dropResult) {
    console.log("column dropped", dropResult);
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
        });
      }
    }
    console.log(this.props.getListsQuery.getLists);
  }

  onCardDrop(columnId, dropResult) {
    console.log("oncarddrop");
  }

  render() {
    console.log(this.props);
    return (
      <div className="card-scene">
        <div>Add A New List</div>
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
            this.props.getListsQuery.getLists.map((list) => {
              return (
                <Draggable key={list.id} className="list">
                  <div className="card-column-header">
                    <span className="column-drag-handle">&#x2630;</span>
                    {list.title}
                  </div>
                  <Container
                    groupName="list"
                    onDragStart={(e) => console.log("drag started", e)}
                    onDragEnd={(e) => console.log("drag end", e)}
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
  graphql(updateListPosMutation, { name: "updateListPosMutation" })
)(Board);
