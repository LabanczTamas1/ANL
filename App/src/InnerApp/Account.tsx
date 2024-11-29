import React, { useState } from "react";

const Account = () => {

    const [PasswordVisible, setPasswordVisible]= useState(false);



  return (
    <div className="flex flex-row">
      <div className="flex flex-col basis-1/2">
        <div className="flex flex-row">Logo My account</div>
        <div className="flex flex-row items-center pl-3">
          <div className="flex align-center bg-[#D9D9D9] rounded-[100%] w-18 h-16 p-2 text-black text-[36px] font-bold mr-7">
            PP
          </div>
          <div className="text-[36px] font-bold">Peter Parker</div>
        </div>
        <div className="text-[36px] font-bold">Account details</div>
        <form className="flex flex-wrap">
          <div className="flex flex-col basis-1/2 justify-center">
            <label>First Name</label>
            <input type="text" className="border-2 w-[12vw]" />
          </div>
          <div className="flex flex-col basis-1/2 justify-center">
            <label>First Name</label>
            <input type="text" className="border-2 w-[12vw]" />
          </div>
          <div className="flex flex-col basis-1/2 justify-center">
            <label>First Name</label>
            <input type="text" className="border-2 w-[12vw]" />
          </div>
          <div className="flex flex-col basis-1/2 justify-center">
            <label>First Name</label>
            <input type="text" className="border-2 w-[12vw]" />
          </div>
        </form>
      </div>
      <div className="border-l-2">

      <form className="flex flex-wrap mt-10 ml-5">
          <div className="flex flex-col justify-center">
            <label>Password</label>
            <div className="flex flex-row items-center">
                <div className="flex border-[1px] rounded-lg">
            <input type={!PasswordVisible ? "password" : "text"} className="border-2 w-[16vw] px-2 border-0" /><button onClick={() => setPasswordVisible((prev) => !prev)} className="pr-2">icon</button></div>
            <button type="submit" className="bg-[#65558F] ml-4 border-2 rounded-lg text-white px-2 py-[1px]">Change password</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Account;
