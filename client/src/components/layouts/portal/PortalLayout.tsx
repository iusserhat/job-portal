import usePageTitle from "@/hooks/usePageTitle";
import { FC } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
        <div className="mx-auto w-full px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PortalLayout;
