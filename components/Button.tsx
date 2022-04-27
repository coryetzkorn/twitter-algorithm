import { Dispatch, PropsWithChildren, SetStateAction } from "react"

interface ButtonProps {
  onClick: () => void
}

export const Button = ({
  children,
  onClick,
}: PropsWithChildren<ButtonProps>) => {
  return (
    <>
      <button onClick={onClick}>{children}</button>
      <style jsx>{`
        button {
          cursor: pointer;
          font-weight: 500;
          background: var(--dark-blue);
          height: 35px;
          border-radius: 4px;
          color: var(--white);
          border: 0;
          outline: none;
          padding: 0 1em;
          font-size: 14px;
        }
        button:hover {
          background: var(--darkest-blue);
        }
      `}</style>
    </>
  )
}
