const AccountBanner = () => {
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  return (
    <div className="flex align-center bg-[#D9D9D9] rounded-[100%] w-18 h-16 p-2 text-black text-[36px] font-bold mr-7">
      {initials}
    </div>
  );
};

export default AccountBanner;
