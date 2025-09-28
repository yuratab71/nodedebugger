import { Entry } from "../../../main/types/fileManager.types";
import { RichTreeView, TreeViewBaseItem } from "@mui/x-tree-view";
import { Box } from "@mui/material";
import { Component, ReactNode, SyntheticEvent } from "react";

type TreeViewBaseItemExtended = TreeViewBaseItem & { inspectorUrl: string };

interface FileExplorerProps {
    onClick: (url: string, inspectorUrl: string) => Promise<void>;
}
interface FileExplorerState {
    treeItems: TreeViewBaseItemExtended[];
}

export class FileExplorer extends Component<
    FileExplorerProps,
    FileExplorerState
> {
    constructor(props: FileExplorerProps) {
        super(props);
        this.state = {
            treeItems: [],
        };
    }

    override componentDidMount() {
        console.log("File explorer did mount");
        window.electronAPI.onParsedFilesUpdate((entry: Entry) => {
            console.log("parsed file");
            console.log(entry);
            if (!entry.sources?.length) return;

            const treeItem: TreeViewBaseItemExtended = {
                id: entry.path,
                label: "@/" + entry.name + entry.extension,
                inspectorUrl: entry.inspectorUrl,
                children: [
                    ...entry.sources.map((el: string) => {
                        return {
                            id: el,
                            label: el,
                            url: entry.path,
                            inspectorUrl: entry.path,
                        };
                    }),
                ],
            };

            this.setState((prevState) => ({
                treeItems: [...prevState.treeItems, treeItem],
            }));
        });
    }

    onItemFocus = async (
        _: SyntheticEvent<Element, Event> | null,
        itemId: string,
    ) => {
        await this.props.onClick(itemId, itemId);
    };

    treeItems: TreeViewBaseItem[] = [];

    onItemClick = (
        _: React.MouseEvent<Element, MouseEvent>,
        itemId: string,
    ) => {
        this.props.onClick(itemId, itemId);
    };

    override render(): ReactNode {
        return (
            <Box width="182px" height="90vh">
                <RichTreeView
                    sx={{ marginTop: 0 }}
                    onItemClick={this.onItemClick}
                    items={this.state.treeItems}
                />
            </Box>
        );
    }
}
