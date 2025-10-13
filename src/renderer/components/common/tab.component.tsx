import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import * as React from "react";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps): React.JSX.Element {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number): { id: string; "aria-controls": string } {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}

type BasicTabsState = {
	value: number;
};

export class BasicTabs extends React.Component<never, BasicTabsState> {
	public constructor(props: never) {
		super(props);
		this.state = {
			value: 0,
		};
	}

	private readonly handleChange = (
		_: React.SyntheticEvent,
		value: number,
	): void => {
		this.setState(() => ({ value }));
	};

	public override render(): React.ReactNode {
		return (
			<Box sx={{ width: "182px" }}>
				<Box
					sx={{
						borderBottom: 1,
						width: 182,
						borderColor: "divider",
						marginTop: 0,
					}}
				>
					<Tabs
						sx={{
							width: "182px",
						}}
						value={this.state.value}
						onChange={this.handleChange}
						aria-label="basic tabs example"
					>
						<Tab label="Item One" {...a11yProps(0)} />
						<Tab label="Item Two" {...a11yProps(1)} />
						<Tab label="Item Three" {...a11yProps(2)} />
					</Tabs>
				</Box>
				<CustomTabPanel value={this.state.value} index={0}>
					Item One
				</CustomTabPanel>
				<CustomTabPanel value={this.state.value} index={1}>
					Item Two
				</CustomTabPanel>
				<CustomTabPanel value={this.state.value} index={2}>
					Item Three
				</CustomTabPanel>
			</Box>
		);
	}
}
