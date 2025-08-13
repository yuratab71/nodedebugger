import React, { JSX, useEffect, useState } from "react";
import styled from "styled-components";
import { Entry } from "../../../modules/fileManager";
import { CodeViewerUIComponent } from "../codeViewer";
import { FileExplorerUIComponent } from "../fileExplorer";

const CodeVisualizerWrapper = styled.div`
    display: flex;
    width: 100%;
    padding: 5px;
`;

export type CodeVisualizerUIComponentProps = {
    files: Entry[];
};

export const CodeVisualizerUIComponent: React.FC<
    CodeVisualizerUIComponentProps
> = ({ files }: CodeVisualizerUIComponentProps): JSX.Element => {
    const [fileContent, setFileContent] = useState<string>("");
    useEffect(() => {
        try {
            const receivedContent = window.electronAPI.getFileContent("");
            receivedContent.then((data) => {
                setFileContent(data);
            });
        } catch (e) {
            console.log(e);
        }
    }, []);
    const handleClick = (src: string) => {
        window.electronAPI
            .getFileContent(src)
            .then((data) => setFileContent(data));
    };
    return (
        <CodeVisualizerWrapper>
            <FileExplorerUIComponent
                files={files}
                onClickCallback={handleClick}
            />
            <CodeViewerUIComponent text={fileContent} />
        </CodeVisualizerWrapper>
    );
};
