//React
import React, { useContext, Component } from "react";

// Firebase
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/auth";
import "firebase/firestore";
import "isomorphic-unfetch";

// Nextjs
import App from "next/app";
import Head from "next/head";
import Router from "next/router";

// Material-ui
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../config/theme";

// Auth & User context
import UserContext from "../lib/UserContext";

// Firebase Creds
import clientCredentials from "../../credentials/client";

// Components
import NavHeader from "../components/NavHeader";

// Nextjs env config
// import getConfig from "next/config";
// const { publicRuntimeConfig } = getConfig();
// const {
//   apiKey,
//   authDomain
// } = publicRuntimeConfig;

let storage = null;
let firestore = null;

// Main export
export default class MyApp extends App {
  static async getInitialProps({ req, query }) {
    const user = req && req.session ? req.session.decodedToken : null;
    // don't fetch anything from firebase if the user is not found
    // const snap = user && await req.firebaseServer.database().ref('messages').once('value')
    // const messages = snap && snap.val()
    const messages = null;

    return { user, messages };
  }

  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user
    };
  }

  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(clientCredentials);
      storage = firebase.storage();
      firestore = firebase.firestore();
    }
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user: user });
        return user.getIdToken().then(token => {
          // eslint-disable-next-line no-undef
          return fetch("/api/login", {
            method: "POST",
            // eslint-disable-next-line no-undef
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({ token })
          });
        });
      } else {
        this.setState({ user: null });
        // eslint-disable-next-line no-undef
        fetch("/api/logout", {
          method: "POST",
          credentials: "same-origin"
        });
      }
    });
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }

  handleLogin = () => {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };

  handleLogout = () => {
    firebase.auth().signOut();
  };

  render() {
    const { Component, pageProps } = this.props;

    return (
      <UserContext.Provider
        value={{
          firestore: firestore,
          storage: storage,
          user: this.state.user,
          handleLogin: this.handleLogin,
          handleLogout: this.handleLogout
        }}
      >
        <Head>
          <title>Plexus Prediction Engine </title>
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <NavHeader />
          <Component {...pageProps} />
        </ThemeProvider>
      </UserContext.Provider>
    );
  }
}
