import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  const user = await currentUser();
  if (user) redirect("/");
  console.log("User is available", user);
  return (
    <div className="h-screen flex w-full justify-center">
      <div className="w-[600px] ld:w-full flex flex-col items-start p-6">
        <Image
          src="/images/davislogo.png"
          alt="DashBoard Image"
          sizes="100vw"
          style={{
            width: "20%",
            height: "auto",
          }}
          width={0}
          height={0}
        />
        {children}
      </div>
      <div className="hidden lg:flex flex-1 w-full max-h-full max-w-400px overflow-hidden relative bg-cream  flex-col pt-10 pl-24 gap-3">
        <Image
          src="/images/daylifflogo.jpg"
          alt="app image"
          loading="lazy"
          sizes="100"
          className="absolute inset-0 w-full h-full object-contain opacity-40"
          width={0}
          height={0}
        />
      </div>
    </div>
  );
};

export default layout;
