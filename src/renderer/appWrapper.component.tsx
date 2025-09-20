import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
import { Component, ReactNode } from "react";
import { theme } from "./theme";
import Footer from "./components/footer/footer.component";
import { Header } from "./components/header//header.component";

interface AppWrapperProps {
    children: ReactNode;
}

interface AppWrapperState {}

export class AppWrapper extends Component<AppWrapperProps, AppWrapperState> {
    constructor(props: AppWrapperProps) {
        super(props);
    }

    override render(): ReactNode {
        const { children } = this.props;

        return (
            <ThemeProvider theme={theme}>
                <Box
                    sx={{
                        width: "100%",
                        minHeight: "100vh",
                        border: "1px solid",
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    <CssBaseline />
                    <Header />

                    <Box
                        component={"main"}
                        sx={{
                            flexGrow: 1,
                            width: "100%",
                        }}>
                        {children}
                    </Box>
                    <Footer />
                </Box>
            </ThemeProvider>
        );
    }
}
