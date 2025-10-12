import type { ReactNode } from "react";
import { Component } from "react";
import { LogTerminal } from "../common/logTerminal.component";

interface SubprocessLogsProps {}
interface SubprocessLogsState {}

export class SubprocessLogs extends Component<
    SubprocessLogsProps,
    SubprocessLogsState
> {
    public constructor(props: SubprocessLogsProps) {
        super(props);
    }

    public override render(): ReactNode {
        return (
            <>
                <LogTerminal onLogs={window.electronAPI.onProcessLog} />
            </>
        );
    }
}
