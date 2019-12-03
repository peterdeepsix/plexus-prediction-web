import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import WhatshotIcon from '@material-ui/icons/Whatshot';

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
    const { predictions } = props
    return (
        <div className={classes.root}>
            <List component="nav" aria-label="predictions">
                {predictions &&
                    Object.keys(predictions).map(key => (
                        <ListItem divider button component={Link} naked href="/predictions" key={key}>
                            <ListItemIcon>
                                <WhatshotIcon />
                            </ListItemIcon>
                            <ListItemText primary={predictions[key].display_name} secondary={predictions[key].score} />
                        </ListItem>

                    ))}
            </List>
        </div>
    );
}