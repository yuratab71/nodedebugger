import { Component, ReactNode } from "react";
import { LogTerminal } from "../common/logTerminal.component";

interface NqLogsProps {}
interface NqLogsState {}

export class NqLogs extends Component<NqLogsProps, NqLogsState> {
    public constructor(props: NqLogsProps) {
        super(props);
    }

    public override render(): ReactNode {
        return <LogTerminal onLogs={window.electronAPI.onProcessLog} />;
    }
}
