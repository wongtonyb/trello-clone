import React, { Component } from "react";
import { graphql } from "react-apollo";
import { insertCardMutation } from "./queries/mutations";
import * as compose from "lodash.flowright";

class AddCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      description: "",
    };
  }

  addCard(e) {
    e.preventDefault();
    let pos = this.props.list.cards.length;
    let listId = this.props.list.id;
    if (this.state.description.length) {
      this.props.insertCardMutation({
        variables: {
          description: this.state.description,
          pos: pos,
          listId: listId,
        },
      });
    }
    this.setState({ description: "" });
  }

  render() {
    return (
      <form onSubmit={this.addCard.bind(this)}>
        <label>Add a new card!</label>
        <input
          type="text"
          placeholder="Description"
          value={this.state.description}
          onChange={(e) => this.setState({ description: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>
    );
  }
}

export default compose(
  graphql(insertCardMutation, { name: "insertCardMutation" })
)(AddCard);
