import { JSX, useRef, useState } from "react";
import styled from "styled-components";

const CodeViewerWrapper = styled.div`
    border-style: solid;
    border-color: orange;
    border-size: 3px;
    border-radius: 8px;
    font-size: 14px;
    width: 80%;
    max-height: 350px;
    overflow: scroll;
    padding: 0;
`;

const TextPre = styled.pre`
    width: 100%;
    margin: 0;
    whitespace: pre;
    font-family: monospace;
`;

type CodeViewerUIComponentProps = {
    text: string;
};

type Position = {
    line: number;
    column: number;
};

function getCaretIndex(pre: HTMLElement, range: Range): number {
    const preRange = document.createRange();
    preRange.selectNodeContents(pre);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
}

export const CodeViewerUIComponent: React.FC<CodeViewerUIComponentProps> = ({
    text,
}: CodeViewerUIComponentProps): JSX.Element => {
    const preRef = useRef<HTMLPreElement | null>(null);
    const [hoverPos, setHoverPosition] = useState<Position>();

    const handleMouse = (e: React.MouseEvent) => {
        if (!preRef.current) return;

        let range: Range | null = null;
        if ("caretRangeFromPoint" in document) {
            range = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
        } else if ("caretPositionFromPoint" in document) {
            const pos = (document as any).caretPositionFromPoint(
                e.clientX,
                e.clientY,
            );
            if (pos) {
                range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
            }
        }

        if (!range) return;

        const pre = preRef.current;
        const caretIndex = getCaretIndex(pre, range);

        const before = pre.innerText.slice(0, caretIndex);
        const line = before.split("\n").length;
        const col = caretIndex - before.lastIndexOf("\n");

        setHoverPosition({ line, column: col });
    };
    return (
        <CodeViewerWrapper id="code">
            <TextPre ref={preRef} onMouseMove={handleMouse}>
                {text}
            </TextPre>
            {hoverPos && (
                <div>
                    Line: {hoverPos.line} Column: {hoverPos.column}
                </div>
            )}
        </CodeViewerWrapper>
    );
};
