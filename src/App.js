import React, { Component } from "react";
import { Router, Link } from "@reach/router";
import axios from "axios";

import { Container, Menu, Statistic, Table } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      views: [],
      count: 0
    };
  }

  componentDidMount = async () => {
    axios
      .post(`${process.env.REACT_APP_STAGE}/hit-me`)
      .then(() => {
        return axios.get(`${process.env.REACT_APP_STAGE}/views`);
      })
      .then(result => {
        const { items: views, count } = result.data;
        this.setState({ views, count });
      })
      .catch(err => console.log);
  };

  render() {
    const { views, count } = this.state;
    return (
      <Container textAlign="center" style={{ marginTop: "1em" }}>
        <Menu>
          <Menu.Item header>Hit Counter</Menu.Item>
          <Menu.Item>
            <Link to={`${process.env.REACT_APP_STAGE}/`}>Home</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to={`${process.env.REACT_APP_STAGE}/details`}>Details</Link>
          </Menu.Item>
        </Menu>
        <Router>
          <Home path={`${process.env.REACT_APP_STAGE}/`} count={count} />
          <Details
            path={`${process.env.REACT_APP_STAGE}/details`}
            views={views}
          />
        </Router>
      </Container>
    );
  }
}

const Home = ({ count }) => <Statistic label="Views" value={count} />;

const Details = ({ views }) => (
  <Table celled striped>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Date</Table.HeaderCell>
        <Table.HeaderCell>IP</Table.HeaderCell>
        <Table.HeaderCell>User Agent</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {views.map(({ id, requestTime, sourceIp, userAgent }) => {
        return (
          <Table.Row key={id}>
            <Table.Cell>{requestTime}</Table.Cell>
            <Table.Cell>{sourceIp}</Table.Cell>
            <Table.Cell>{userAgent}</Table.Cell>
          </Table.Row>
        );
      })}
    </Table.Body>
  </Table>
);

export default App;
