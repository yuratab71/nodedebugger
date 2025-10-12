import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
import type { ReactNode } from "react";
import { Component } from "react";
import Footer from "./components/footer/footer.component";
import Header from "./components/header/header.component";
import { theme } from "./theme";

interface AppWrapperProps {
    children: ReactNode;
}
export class AppWrapper extends Component<AppWrapperProps> {
    public constructor(props: AppWrapperProps) {
        super(props);
    }

    public override render(): ReactNode {
        const { children } = this.props;

        return (
            <ThemeProvider theme={theme}>
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <CssBaseline />
                    <Header />

                    <Box
                        component={"main"}
                        sx={{
                            flexGrow: 1,
                            width: "100%",
                        }}
                    >
                        {children}
                    </Box>
                    <Footer />
                </Box>
            </ThemeProvider>
        );
    }
}
