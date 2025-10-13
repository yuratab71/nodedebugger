import { Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { Component, createRef, ReactNode } from "react";

interface LogTerminalProps {
	onLogs: (callback: (message: string) => void) => void;
}
interface LogTerminalState {
	logs: string[];
}

export class LogTerminal extends Component<LogTerminalProps, LogTerminalState> {
	private readonly scrollRef = createRef<HTMLDivElement>();

	public constructor(props: LogTerminalProps) {
		super(props);
		this.state = {
			logs: [],
		};
	}

	public override componentDidMount(): void {
		this.props.onLogs(this.handleLogMessage);
	}

	public override componentDidUpdate(): void {
		this.scrollToBottom();
	}

	private scrollToBottom(): void {
		if (this.scrollRef.current) {
			//this.logEndRef.current.scrollIntoView({ behavior: "smooth" });
			this.scrollRef.current.scrollTop =
				this.scrollRef.current.scrollHeight;
		}
	}

	private readonly handleLogMessage = (message: string): void => {
		this.setState((prevState) => ({ logs: [...prevState.logs, message] }));
	};
	public override render(): ReactNode {
		const { logs } = this.state;
		return (
			<Paper
				elevation={3}
				ref={this.scrollRef}
				sx={{
					bgcolor: "black",
					color: "lime",
					fontFamily: "monospace",
					p: 1,
					height: "100%",
					width: "100%",
					maxWidth: "1024px",
					overflow: "scroll",
					borderRadius: 1,
				}}
			>
				{logs.map((log, i) => (
					<Typography
						key={i}
						variant="body2"
						sx={{
							fontSize: "12px",
						}}
					>
						{log}
					</Typography>
				))}
			</Paper>
		);
	}
}
