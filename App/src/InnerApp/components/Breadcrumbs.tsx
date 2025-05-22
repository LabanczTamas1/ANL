import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x); // Split path and remove empty parts
    return [
      ...pathnames.map((name, index) => {
        const path = `/${pathnames.slice(0, index + 1).join("/")}`;
        return { name: name.charAt(0).toUpperCase() + name.slice(1), path };
      }),
    ];
  };

  const breadcrumbs = generateBreadcrumbs();
  return (
    <div className="flex flex-col">
      <div className="font-semibold text-lg dark:text-white">
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={breadcrumb.path}>
            <Link
              to={breadcrumb.path}
              className="text-blue-600 dark:text-[#CCCCCC] hover:underline"
            >
              {breadcrumb.name}
            </Link>
            {index < breadcrumbs.length - 1 && " / "} {/* Add separator */}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumbs;
