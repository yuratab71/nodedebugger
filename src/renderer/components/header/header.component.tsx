import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import { Component, ReactNode } from "react";
import { connect } from "react-redux";
import { Status } from "@/main/constants/status";
import { Runtime } from "@/main/types/runtime.types";
import {
	UPDATE_MEMORY_STATS,
	UpdateMemoryStatsAction,
} from "@/renderer/redux/memoryStats.reducer";
import { GlobalState } from "@/renderer/redux/store";
import {
	UPDATE_WS_CONNECTION,
	UpdateWebSocketStatusAction,
} from "@/renderer/redux/webSocketConnection.reducer";
import MainLogo from "../../../../public/Main_logo.png";
import { Dot } from "../common/dot.component";
import { NqLogs } from "../nqLogs/nquisitorLogs.component";

interface StateProps {
	memStats: Runtime.MemoryStats;
	status: Status;
}

interface DispatchProps {
	updateMemStats: (stats: Runtime.MemoryStats) => void;
	updateWsStatus: (status: Status) => void;
}

type NavbarProps = StateProps & DispatchProps;

export class Header extends Component<NavbarProps> {
	private formatMemoryValue(val: number): string {
		return (val / 1024 / 1024).toFixed(2);
	}

	public override componentDidMount(): void {
		window.electronAPI.setMemoryUsage((data) => {
			this.props.updateMemStats(data);
		});

		window.electronAPI.setWsStatus((status: Status) =>
			this.props.updateWsStatus(status),
		);
	}

	public override render(): ReactNode {
		const { status, memStats } = this.props;
		return (
			<>
				<Paper
					elevation={2}
					sx={{
						display: "grid",
						gridTemplateColumns: "200px 1fr 315px",
						height: "100%",
					}}
				>
					<Avatar
						sx={{
							objectFit: "cover",
							width: "100%",
							height: "100%",
						}}
						src={MainLogo}
					/>
					<NqLogs />
					<Box
						height="100%"
						display="flex"
						width="100%"
						flexDirection="column"
						sx={{
							padding: 1,
						}}
					>
						<Box display="flex" height="20%" flexDirection="row">
							<Button
								size="small"
								sx={{ marginRight: 1 }}
								variant="contained"
								onClick={(): void => {
									window.electronAPI.setSubprocessDirectory();
								}}
							>
								Open
							</Button>
							<Button
								size="small"
								sx={{ marginRight: 1 }}
								variant="contained"
								onClick={(): void => {
									window.electronAPI.startProcess();
								}}
							>
								Run
							</Button>
							<Button
								sx={{ marginRight: 1 }}
								size="small"
								variant="contained"
								onClick={(): void => {
									window.electronAPI.resumeExecution();
								}}
							>
								Resume
							</Button>

							<Button
								sx={{ marginRight: 1 }}
								size="small"
								variant="contained"
								onClick={(): void => {
									window.electronAPI.terminateProcess();
								}}
							>
								Kill
							</Button>
						</Box>
						<Box
							sx={{
								marginTop: 1,
							}}
						>
							<Box display="flex" justifyContent="space-between">
								<Typography fontSize="12px" fontWeight="bold">
									Status:
								</Typography>
								<Dot status={status} />{" "}
								<Typography fontSize="12px" fontWeight="bold">
									{status}
								</Typography>
							</Box>
							<Typography fontSize="12px" fontWeight="bold">
								Rss: {this.formatMemoryValue(memStats.rss)}
							</Typography>
							<Typography fontSize="12px" fontWeight="bold">
								Heap Total{" "}
								{this.formatMemoryValue(memStats.heapTotal)}
							</Typography>
							<Typography fontSize="12px" fontWeight="bold">
								Heap Used{" "}
								{this.formatMemoryValue(memStats.heapTotal)}
							</Typography>
							<Typography fontSize="12px" fontWeight="bold">
								External{" "}
								{this.formatMemoryValue(memStats.external)}
							</Typography>
						</Box>
					</Box>
				</Paper>
			</>
		);
	}
}

const mapStateToProps = (state: GlobalState): StateProps => {
	return {
		memStats: state.memoryStats,
		status: state.webSocketStatus.status,
	};
};

const mapDispatchToProps: DispatchProps = {
	updateMemStats: (memoryStats: Runtime.MemoryStats) => {
		const action: UpdateMemoryStatsAction = {
			type: UPDATE_MEMORY_STATS,
			stats: memoryStats,
		};

		return action;
	},
	updateWsStatus: (status: Status) => {
		const action: UpdateWebSocketStatusAction = {
			type: UPDATE_WS_CONNECTION,
			status,
		};

		return action;
	},
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
