import { Children, isValidElement } from "react";

/**
 *  Replaced by real tabs component from DS.
 *
 *  Awaiting an agreement on props/structure interface
 */

interface ServerProps {
  active?: boolean;
  href: string;
  id?: never;
  onClick?: never;
}

type ClientProps = {
  active?: boolean;
  href?: never;
  id: string;
  onClick: () => void;
};

function isServerData(data: unknown): data is ServerProps {
  return Boolean((data as ServerProps)?.href);
}
function isClientData(data: unknown): data is ClientProps {
  const check = data as ClientProps;
  return Boolean(check?.id && check.onClick);
}

export function Tabs(props: React.PropsWithChildren) {
  let isConsistentDataType: "server" | "client" | undefined;
  Children.forEach(props.children, (child) => {
    if (isValidElement(child)) {
      const props = child.props;
      if (!isConsistentDataType) {
        isConsistentDataType = isClientData(props) ? "client" : "server";
      } else if (
        (isClientData(props) && isConsistentDataType === "server") ||
        (isServerData(props) && isConsistentDataType === "client")
      ) {
        throw Error("all tabs children must be of the same type");
      }
    }
  });

  return <ul>{props.children}</ul>;
}

type Props = ServerProps | ClientProps;

export function Tab(props: React.PropsWithChildren<Props>) {
  if (isServerData(props)) {
    return (
      <a
        href={props.href}
        style={{ background: props.active ? "pink" : "transparent" }}
      >
        {props.children}
      </a>
    );
  }

  if (isClientData(props)) {
    return <button onClick={() => props.onClick()}>{props.children}</button>;
  }
  return null;
}
