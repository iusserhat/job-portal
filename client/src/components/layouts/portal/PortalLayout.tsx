import usePageTitle from "@/hooks/usePageTitle";
import { FC } from "react";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

type Props = {
  title?: string;
  children: React.ReactNode;
};

const PortalLayout: FC<Props> = ({ title, children }) => {
  usePageTitle(title);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow">
        <div className="mx-auto w-full px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PortalLayout;
