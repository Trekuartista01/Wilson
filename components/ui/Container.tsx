type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

/**
 * Page-width wrapper: the site grid from the mockups, full width with 56px side gutters on
 * desktop (16/24px on phones and tablets). Past 1920px the whole grid centres, so header,
 * hero and sections stay lined up on ultrawide screens too.
 */
export default function Container({ children, className = "", id }: ContainerProps) {
  return (
    <div id={id} className={`mx-auto w-full max-w-[120rem] px-4 sm:px-6 lg:px-14 ${className}`}>
      {children}
    </div>
  );
}
