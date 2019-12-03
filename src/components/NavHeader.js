// React
import React from 'react';

// Auth
import { useContext } from 'react';
import UserContext from '../lib/UserContext';

// Material-ui
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import HomeIcon from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

// Components
import Link from '../components/Link';

// Material-ui styles
const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    title: {
        flexGrow: 1,
    },
    breadcrumbs: {
        flexGrow: 1,
    },
    link: {
        display: 'flex',
    },
    icon: {
        marginRight: theme.spacing(0.5),
        width: 20,
        height: 20,
    },
}));



// Main export
export default function NavHeader() {
    // Material-ui hook
    const classes = useStyles();

    // Auth context
    const { user, handleLogin, handleLogout } = useContext(UserContext);

    // Menu anchor
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    // Handle click breadcrumb
    const handleMenu = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Main return
    return (
        <div className={classes.root}>
            <AppBar color='inherit' position="static">
                <Toolbar>

                    {user ? (
                        <React.Fragment>
                            <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumbs}>
                                <Link color="inherit" href="/" className={classes.link}>
                                    <HomeIcon className={classes.icon} />
                                    Plexus
                        </Link>
                                <Link color="inherit" href="/predictions" className={classes.link}>
                                    <WhatshotIcon className={classes.icon} />
                                    Predictions
                        </Link>
                                <Link color="textPrimary" href="/upload" className={classes.link}>
                                    <CloudUploadIcon className={classes.icon} />
                                    Upload
                        </Link>
                            </Breadcrumbs>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem divider onClick={handleClose}>Profile</MenuItem>
                                <MenuItem onClick={handleClose}>Account</MenuItem>
                                <MenuItem onClick={handleClose}>
                                    <Button variant="outlined" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </MenuItem>
                            </Menu>
                        </React.Fragment>
                    ) : (<React.Fragment><Typography variant="h6" className={classes.title}>
                        Plexus Prediction Engine
                  </Typography><Button color="inherit" variant="outlined" onClick={handleLogin}>
                            Login
</Button></React.Fragment>)}
                </Toolbar>
            </AppBar>
        </div>
    );
}