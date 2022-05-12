import { useEffect, useRef } from "react";
import Jazzicon from "@metamask/jazzicon";
import styled from "styled-components";

const StyledIdenticon = styled.div`
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 1rem;
  background-color: black;
`;

export default function Identicon(props) {
    const ref = useRef();

    useEffect(() => {
        if (props.account && ref.current) {
            ref.current.innerHTML = "";
            ref.current.appendChild(Jazzicon(28, parseInt(props.account.slice(2, 10), 16)));
        }
    }, [props.account]);

    return <StyledIdenticon style={{ marginLeft: '10px' }} ref={ref} />;
}
