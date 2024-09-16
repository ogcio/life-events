/***
 * There's no real layouts currently available from the govie-ds
 * and we need something placeholder to let main take appropriate size.
 *
 * The body is styled as a flex column
 */
export default function Main({ children }: React.PropsWithChildren) {
  return <main style={{ flex: "auto" }}>{children}</main>;
}
