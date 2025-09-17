import { JSX } from "react";
import styled from "styled-components";

type ButtonProps = {
    text: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
};

const ButtonStyled = styled.button`
    width: fit-content;
    height: 30px;
    padding: 3px;
    margin: 5px;
    background-color: orange;
    border-style: solid;
    border-radius: 4px;
    border-color: black;
    text-color: black;
    font-weight: bold;
`;

export const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    disabled = false
}): JSX.Element => {
    return (
        <>
            <ButtonStyled disabled={disabled} onClick={onClick}>{text}</ButtonStyled>
        </>
    );
};
