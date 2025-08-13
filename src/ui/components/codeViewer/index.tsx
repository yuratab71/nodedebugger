import { JSX } from "react";
import { PALLETTE } from "../../../constants/pallette";
import styled from "styled-components";

const CodeViewerWrapper = styled.div`
    border-style: solid;
    border-color: orange;
    border-size: 3px;
    font-size: 14px;
    width: 80%;
    max-height: 350px;
    overflow: scroll;
    padding: 0;
`;

const TextPre = styled.pre`
    width: 100%;
    margin: 0;
    background-color: ${PALLETTE.blueGrayDark};
`;

type CodeViewerUIComponentProps = {
    text: string;
};

export const CodeViewerUIComponent: React.FC<CodeViewerUIComponentProps> = ({
    text,
}: CodeViewerUIComponentProps): JSX.Element => {
    return (
        <CodeViewerWrapper>
            <TextPre>{text}</TextPre>
        </CodeViewerWrapper>
    );
};
