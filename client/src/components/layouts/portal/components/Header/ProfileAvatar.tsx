import { Fragment } from "react";
import {
  UserIcon,
  Cog8ToothIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Link } from "react-router-dom";

interface ProfileAvatarProps {
  logout: () => void;
}

const ProfileAvatar = ({ logout }: ProfileAvatarProps) => {
  return (
    <div className="flex items-center gap-x-8">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button>
            <img
              className="h-8 w-8 rounded-full bg-gray-800"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profil resmi"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={`${
                      active ? "bg-indigo-500 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <UserIcon className="h-5 w-5 mr-2" />
                    ) : (
                      <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                    )}
                    Profilim
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-indigo-500 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <Cog8ToothIcon className="h-5 w-5 mr-2" />
                    ) : (
                      <Cog8ToothIcon className="h-5 w-5 mr-2 text-gray-400" />
                    )}
                    Ayarlar
                  </button>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-indigo-500 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => logout()}
                  >
                    {active ? (
                      <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-2" />
                    ) : (
                      <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-2 text-gray-400" />
                    )}
                    Çıkış
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default ProfileAvatar; 