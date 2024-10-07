import React, { useState, useRef, useEffect } from "react";
import DarkMode from "../components/DarkMode"; // Ensure this path is correct
import { IconSettings } from "@tabler/icons-react";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  const handleOpenEditProfileModal = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button to toggle dropdown */}
      <button onClick={toggleDropdown} className="flex items-center">
        <IconSettings className="w-6 h-6" />
      </button>
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 bg-white shadow-lg rounded-lg mt-2 z-10">
          <div onClick={handleOpenEditProfileModal} className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
            Edit Profile
          </div>
          <div className="py-2 px-4">
            <DarkMode />
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
