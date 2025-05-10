import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="-m-1.5 p-1.5 flex items-center">
      <span className="sr-only">İş Portalı</span>
      <span className="h-8 w-auto font-bold text-xl text-indigo-600">İş Portalı</span>
    </Link>
  );
};

export default Logo; 