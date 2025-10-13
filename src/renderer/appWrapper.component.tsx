import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
import { Component, ReactNode } from "react";
import Footer from "./components/footer/footer.component";
import Header from "./components/header/header.component";
import { theme } from "./theme";

interface AppWrapperProps {
	children: ReactNode;
}

interface AppWrapperState {}

export class AppWrapper extends Component<AppWrapperProps, AppWrapperState> {
	public constructor(props: AppWrapperProps) {
		super(props);
	}

	public override render(): ReactNode {
		const { children } = this.props;

		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Box
					sx={{
						width: "100%",
						height: "100%",
						display: "grid",
						gridTemplateRows: "250px 1fr 35px",
						gap: "0px",
					}}
				>
					<Header />
					<Box
						component={"main"}
						sx={{
							display: "grid",
							gridTemplateColumns: "200px 1fr 315px",
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
