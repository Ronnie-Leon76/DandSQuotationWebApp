"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { currentUser } from "@clerk/nextjs";

const HeroSection = async () => {
  const user = await currentUser();

  return (
    <div className="text-center py-20 md:py-32 space-y-10">
      <h2 className="text-3xl md:text-5xl font-extrabold text-neutral-800">
        The Best AI Tool for Product Sizing & Quotation
      </h2>
      <br />
     

      <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
        Create accurate customer quotations 100x faster using AI-powered sizing
        and product recommendations.
      </p>

      <Button asChild size="lg" className="rounded-full">
        <Link href={user ? "/dashboard" : "/auth/sign-in"}>
          Start Generating For Free
        </Link>
      </Button>

      <p className="text-xl font-semibold text-[#0082D6]">
        Hassle-Free Quotations
      </p>

      <div className="mt-20 md:mt-32">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-800 mb-6">
          The Ultimate Energy Quotation Solution
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Solving complex energy sizing problems with advanced AI. Get precise
          quotations for powerbackup solutions in minutes.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
