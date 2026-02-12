interface Props {
  children: React.ReactNode;
}

function FloatingContainer(props: Props) {
  return (
    <div className="flex flex-col gap-12 py-8 px-4 sm:py-8 sm:px-12 rounded-ui-container w-full max-w-112.5 text-center border border-ui-border bg-ui-bg">
      {props.children}
    </div>
  );
}

export default FloatingContainer;
