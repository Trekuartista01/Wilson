type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

/** Page-width wrapper with the site's fluid side gutters. */
export default function Container({ children, className = "", id }: ContainerProps) {
  return (
    <div id={id} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 2xl:max-w-[88rem] ${className}`}>
      {children}
    </div>
  );
}
