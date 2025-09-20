import { Component, ReactNode } from "react";
import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import MainLogo from "../../../../public/Main_logo.png";
import { NqLogs } from "../nqLogs/nquisitorLogs.component";
import { Status } from "@main/constants/status";
import { Dot } from "../common/dot.component";

interface NavbarProps {}
interface NavbarState {
    conntectionStatus: Status;
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
}

export class Header extends Component<NavbarProps, NavbarState> {
    constructor(props: NavbarState) {
        super(props);
        this.state = {
            conntectionStatus: Status.NOT_ACTIVE,
            rss: "0",
            heapTotal: "0",
            heapUsed: "0",
            external: "0",
        };
    }

    override componentDidMount() {
        window.electronAPI.setWsStatus((status: Status) => {
            this.setState((prevState) => ({
                ...prevState,
                conntectionStatus: status,
            }));
        });
    }

    override render(): ReactNode {
        return (
            <>
                <Paper
                    elevation={2}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        height: 182,
                    }}>
                    <Avatar
                        sx={{
                            objectFit: "cover",
                            width: 182,
                            height: 182,
                        }}
                        src={MainLogo}
                    />
                    <Box
                        flex={1}
                        sx={{
                            height: "100%",
                        }}>
                        <NqLogs />
                    </Box>
                    <Box
                        height="100%"
                        display="flex"
                        width="310px"
                        flexDirection="column"
                        sx={{
                            padding: 1,
                        }}>
                        <Box display="flex" height="20%" flexDirection="row">
                            <Button
                                size="small"
                                sx={{ marginRight: 1 }}
                                variant="contained"
                                onClick={() => {
                                    window.electronAPI.setSubprocessDirectory();
                                }}>
                                Open
                            </Button>
                            <Button
                                size="small"
                                sx={{ marginRight: 1 }}
                                variant="contained"
                                onClick={() => {
                                    window.electronAPI.startProcess();
                                }}>
                                Run
                            </Button>
                            <Button
                                sx={{ marginRight: 1 }}
                                size="small"
                                variant="contained"
                                onClick={() => {
                                    window.electronAPI.resumeExecution();
                                }}>
                                Resume
                            </Button>

                            <Button
                                sx={{ marginRight: 1 }}
                                size="small"
                                variant="contained"
                                onClick={() => {
                                    window.electronAPI.terminateProcess();
                                }}>
                                Kill
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                marginTop: 1,
                            }}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography fontSize="12px" fontWeight="bold">
                                    Status:
                                </Typography>
                                <Dot status={this.state.conntectionStatus} />{" "}
                                <Typography fontSize="12px" fontWeight="bold">
                                    {this.state.conntectionStatus}
                                </Typography>
                            </Box>
                            <Typography fontSize="12px" fontWeight="bold">
                                Rss
                            </Typography>
                            <Typography fontSize="12px" fontWeight="bold">
                                Heap Total
                            </Typography>
                            <Typography fontSize="12px" fontWeight="bold">
                                Heap Used
                            </Typography>
                            <Typography fontSize="12px" fontWeight="bold">
                                External
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </>
        );
    }
}
