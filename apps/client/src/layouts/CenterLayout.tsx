interface Props {
  children: React.ReactNode;
}

function CenterLayout(props: Props) {
  return (
    <div className="fixed left-0 top-0 w-full h-full flex items-start justify-center sm:items-center p-4 overflow-y-scroll">
      {props.children}
    </div>
  );
}

export default CenterLayout;
