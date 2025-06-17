interface Props {
  children: React.ReactElement;
}

export const Box = (props: Props) => {
  return (
    <>
      <div>{props.children}</div>
    </>
  );
};
