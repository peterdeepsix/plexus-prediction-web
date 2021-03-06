import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'isomorphic-unfetch'

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import PredictionList from '../components/PredictionList'

import UserContext from '../lib/UserContext'

import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId } = publicRuntimeConfig

export default class Predictions extends Component {
  static async getInitialProps({ req, query }) {
    const user = req && req.session ? req.session.decodedToken : null
    // don't fetch anything from firebase if the user is not found
    // const snap = user && await req.firebaseServer.database().ref('messages').once('value')
    // const messages = snap && snap.val()
    const predictions = null
    return { user, predictions }
  }

  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      value: '',
      predictions: this.props.predictions,
    }

    this.addDbListener = this.addDbListener.bind(this)
    this.removeDbListener = this.removeDbListener.bind(this)
  }

  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: apiKey,
        authDomain: authDomain,
        databaseURL: databaseURL,
        projectId: projectId,
        storageBucket: storageBucket,
        messagingSenderId: messagingSenderId,
        appId: appId,
        measurementId: measurementId
      })
    }

    if (this.state.user) this.addDbListener()

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user: user })
        return user
          .getIdToken()
          .then(token => {
            // eslint-disable-next-line no-undef
            return fetch('/api/login', {
              method: 'POST',
              // eslint-disable-next-line no-undef
              headers: new Headers({ 'Content-Type': 'application/json' }),
              credentials: 'same-origin',
              body: JSON.stringify({ token }),
            })
          })
          .then(res => this.addDbListener())
      } else {
        this.setState({ user: null })
        // eslint-disable-next-line no-undef
        fetch('/api/logout', {
          method: 'POST',
          credentials: 'same-origin',
        }).then(() => this.removeDbListener())
      }
    })
  }

  addDbListener() {
    var db = firebase.firestore()
    let unsubscribe = db.collection('predictions').onSnapshot(
      querySnapshot => {
        var predictions = {}
        querySnapshot.forEach(function (doc) {
          predictions[doc.id] = doc.data()
        })
        if (predictions) this.setState({ predictions })
      },
      error => {
        console.error(error)
      }
    )
    this.setState({ unsubscribe })
  }

  removeDbListener() {
    // firebase.database().ref('predictions').off()
    if (this.state.unsubscribe) {
      this.state.unsubscribe()
    }
  }

  handleLogin() {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  }

  handleLogout() {
    firebase.auth().signOut()
  }

  render() {
    const { user, predictions } = this.state
    return (
      <Container maxWidth="sm">
        <Box my={4}>
          {user ? (
            <Box my={4}>
              <PredictionList predictions={predictions} />
            </Box>
          ) : (<Typography variant="body1" component="body1" gutterBottom>
            Login to see predictions.
                </Typography>)}
        </Box>
      </Container>
    )
  }
}