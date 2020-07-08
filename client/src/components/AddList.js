import React, { Component } from "react";
import { graphql } from "react-apollo";
import { insertListMutation } from "./queries/mutations";
import * as compose from "lodash.flowright";

class AddList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
    };
  }

  addList(e) {
    e.preventDefault();
    let pos = this.props.lists.length;
    this.props.insertListMutation({
      variables: {
        title: this.state.title,
        pos: pos,
      },
    });
    this.setState({ title: "" });
  }

  render() {
    return (
      <form onSubmit={this.addList.bind(this)}>
        <label>Add a new list!</label>
        <input
          type="text"
          placeholder="Title"
          value={this.state.title}
          onChange={(e) => this.setState({ title: e.target.value })}
        />
        <button>Add</button>
      </form>
    );
  }
}

export default compose(
  graphql(insertListMutation, { name: "insertListMutation" })
)(AddList);
