import React, { Component } from "react";
import axios from "axios";

import { Container, Statistic, Table } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lat: 0,
      long: 0,
      views: [],
      count: 0
    };
  }

  componentDidMount = async () => {
    axios.get(`${process.env.REACT_APP_STAGE}/views`).then(result => {
      const { items: views, count } = result.data;
      this.setState({ views, count });
    });

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude: lat, longitude: long } = position.coords;
      axios
        .post(`${process.env.REACT_APP_STAGE}/hit-me`, { lat, long })
        .then(result => {
          const { items: views, count } = result.data;
          this.setState({ views, lat, long, count });
        })
        .catch(err => console.log);
    });
  };

  render() {
    return (
      <Container textAlign="center">
        <Statistic label="Views" value={this.state.count} />
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>IP</Table.HeaderCell>
              <Table.HeaderCell>User Agent</Table.HeaderCell>
              <Table.HeaderCell>Location</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.state.views.map(view => {
              return (
                <Table.Row key={view.id}>
                  <Table.Cell>{view.requestTime}</Table.Cell>
                  <Table.Cell>{view.sourceIp}</Table.Cell>
                  <Table.Cell>{view.userAgent}</Table.Cell>
                  <Table.Cell>
                    [{view.location.coordinates[0]},{" "}
                    {view.location.coordinates[0]}]
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        Current location: {this.state.lat}, {this.state.long}
      </Container>
    );
  }
}

export default App;
