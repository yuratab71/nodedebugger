import { Typography } from "@mui/material";
import { Component, ReactNode } from "react";
import { wsStatus } from "../../../main/constants/wsStatus";

interface DotProps {
	status: wsStatus;
}

interface DotState {}

export class Dot extends Component<DotProps, DotState> {
	public constructor(props: DotProps) {
		super(props);
	}

	private getColor(status: wsStatus): string {
		switch (status) {
			case wsStatus.NOT_ACTIVE:
				return "grey";
			case wsStatus.CONNECTED:
				return "green";
			case wsStatus.ERROR:
				return "red";
			case wsStatus.DISCONNECTED:
				return "orange";
			default:
				return "grey";
		}
	}

	public override render(): ReactNode {
		return (
			<Typography
				sx={{
					width: 16,
					height: 16,
					borderRadius: "50%",
					bgcolor: this.getColor(this.props.status),
					border: "1px solid #ccc",
				}}
			/>
		);
	}
}
