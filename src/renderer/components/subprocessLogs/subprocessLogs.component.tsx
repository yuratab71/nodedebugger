import { Component, ReactNode } from "react";
import { LogTerminal } from "../common/logTerminal.component";

interface SubprocessLogsProps {}
interface SubprocessLogsState {}

export class SubprocessLogs extends Component<
    SubprocessLogsProps,
    SubprocessLogsState
> {
    constructor(props: SubprocessLogsProps) {
        super(props);
    }

    override render(): ReactNode {
        return (
            <>
                <LogTerminal onLogs={window.electronAPI.onProcessLog} />
            </>
        );
    }
}
