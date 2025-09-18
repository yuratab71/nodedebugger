import { ThemeProvider } from "@emotion/react";
import {
    CssBaseline,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
} from "@mui/material";
import { Box } from "@mui/system";
import { Component, ReactNode } from "react";
import { theme } from "./theme";
import { Navbar } from "./components/navbar";
import Footer from "./components/footer/footer.component";

interface AppWrapperProps {
    children: ReactNode;
}

interface AppWrapperState {
    drawerOpen: boolean;
}

export class AppWrapper extends Component<AppWrapperProps, AppWrapperState> {
    constructor(props: AppWrapperProps) {
        super(props);
        this.state = { drawerOpen: false };
    }

    toggleDrawer = () => {
        this.setState((prevState) => ({ drawerOpen: !prevState.drawerOpen }));
    };

    override render(): ReactNode {
        const { children } = this.props;
        const { drawerOpen } = this.state;

        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Navbar />
                {false && (
                    <Drawer
                        onClose={this.toggleDrawer}
                        variant="permanent"
                        open={drawerOpen}>
                        <Toolbar />
                        <List>
                            <ListItemButton>
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </List>
                    </Drawer>
                )}

                <Box
                    component={"main"}
                    sx={{
                        flexGrow: 1,
                        p: 3,
                    }}>
                    {" "}
                    {children}{" "}
                </Box>
                <Footer />
            </ThemeProvider>
        );
    }
}
