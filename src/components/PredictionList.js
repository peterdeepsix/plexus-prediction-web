import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import GestureIcon from '@material-ui/icons/Gesture';

import Link from '../components/Link';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

export default function PredictionList(props) {
    const classes = useStyles();
    const { messages } = props
    return (
        <div className={classes.root}>
            <List component="nav" aria-label="predictions">
                {messages &&
                    Object.keys(messages).map(key => (
                        <ListItem divider button component={Link} naked href="/predictions" key={key}>
                            <ListItemIcon>
                                <GestureIcon />
                            </ListItemIcon>
                            <ListItemText primary={messages[key].text} />
                        </ListItem>

                    ))}
            </List>
        </div>
    );
}