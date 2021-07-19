import React, { useEffect, useState, useRef } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles, fade } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import AppBar from "@material-ui/core/AppBar";
import Grow from "@material-ui/core/Grow";
import "./App.css";

// connect to websocket port on server
const client = new W3CWebSocket(
  process.env.REACT_APP_MODE === "prod"
    ? `wss://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_SERVER_PORT}`
    : `ws://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_SERVER_PORT}`
);

const useStyles = makeStyles((theme) => ({
  paperUsername: {
    marginTop: theme.spacing(30),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "ghostwhite",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  text: {
    padding: theme.spacing(2, 2, 0),
  },
  paper: {
    paddingBottom: 50,
    backgroundColor: "ghostwhite",
  },
  list: {
    height: "100%",
    marginBottom: theme.spacing(3),
  },
  appBar: {
    top: "auto",
    bottom: 0,
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

const useStylesReddit = makeStyles((theme) => ({
  root: {
    border: "1px solid #e2e2e1",
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#fcfcfb",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    "&:hover": {
      backgroundColor: "#fff",
    },
    "&$focused": {
      backgroundColor: "#fff",
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
  },
  focused: {},
}));

function RedditTextField(props) {
  const classes = useStylesReddit();
  return (
    <TextField
      style={{ width: "100%" }}
      InputProps={{ classes, disableUnderline: true }}
      {...props}
    />
  );
}

function App() {
  const classes = useStyles();
  const [newMessage, setNewMessage] = useState("");
  const [state, setState] = useState({
    username: "",
    isLoggedIn: false,
    messages: [
      {
        user: "admin",
        msg: "Welcome to the chat room!",
      },
    ],
  });
  const messagesEndRef = useRef(null);

  function sendMessage() {
    if (newMessage.trim() !== "") {
      client.send(
        JSON.stringify({
          type: "message",
          msg: newMessage,
          user: state.username,
        })
      );

      setNewMessage("");
    }
  }

  client.onmessage = (message) => {
    const dataFromServer = JSON.parse(message.data);
    // console.log("got reply", dataFromServer);

    if (dataFromServer.type === "message") {
      setState({
        ...state,
        messages: [
          ...state.messages,
          {
            msg: dataFromServer.msg,
            user: dataFromServer.user,
          },
        ],
      });
    }
  };

  function enterChat(e) {
    e.preventDefault();
    if (state.username.trim() !== "") {
      setState({
        ...state,
        isLoggedIn: true,
      });
    }
  }

  const scrollToBottom = () => {
    if (state.messages.length > 1) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    client.onopen = () => {
      console.log("websocket client connected");
    };
    // eslint-disable-next-line
  }, []);

  useEffect(scrollToBottom, [state.messages]);

  return (
    <div className="main">
      {state.isLoggedIn ? (
        <div>
          <>
            <CssBaseline />
            <Paper square elevation={0} className={classes.paper}>
              <Typography className={classes.text} variant="h5" gutterBottom>
                WebSocket ChatApp
              </Typography>
              <List className={classes.list}>
                {state.messages.map(({ msg, user }, index) => (
                  <React.Fragment key={index}>
                    <Grow in={true}>
                      <ListItem button>
                        <ListItemAvatar>
                          <Avatar alt={user} />
                        </ListItemAvatar>
                        <ListItemText
                          style={{ wordWrap: "break-word" }}
                          primary={user}
                          secondary={msg}
                        />
                      </ListItem>
                    </Grow>
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
              </List>
            </Paper>
            <AppBar position="fixed" color="primary" className={classes.appBar}>
              <Toolbar>
                <RedditTextField
                  label="Message"
                  className={classes.margin}
                  // defaultValue="react-reddit"
                  variant="filled"
                  id="reddit-input"
                  value={newMessage}
                  autoFocus
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                  style={{ fontSize: "1.6rem" }}
                  size="large"
                  variant="contained"
                  color="secondary"
                  onClick={sendMessage}
                >
                  send
                </Button>
              </Toolbar>
            </AppBar>
          </>
        </div>
      ) : (
        <div style={{ backgroundColor: "ghostwhite" }}>
          {/** Enter/create username **/}
          <Container
            component="main"
            maxWidth="xs"
            style={{ backgroundColor: "ghostwhite" }}
          >
            <CssBaseline />
            <div className={classes.paperUsername}>
              <Typography component="h1" variant="h5">
                Create a username to join chat room
              </Typography>
              <form className={classes.form} noValidate>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  onChange={(e) =>
                    setState({ ...state, username: e.target.value })
                  }
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={enterChat}
                >
                  Create username
                </Button>
                <Grid container align="center">
                  <Grid item xs>
                    <Typography variant="caption" display="block" gutterBottom>
                      Your name will be removed after 24 hours
                    </Typography>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

export default App;
