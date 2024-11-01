"use client"

import { ArrowRightIcon } from "@radix-ui/react-icons"
import AnimatedShinyText from "@/components/ui/animated-shiny-text"
import { Hero } from "@/components/Hero"
import GradualSpacing from "@/components/ui/gradual-spacing"
import ShimmerButton from "@/components/ui/shimmer-button"
import { useAtom } from "jotai"
import { userAtom } from "@/store/userAtoms"
import Link from "next/link"

export default function HeroSection() {
  const [user] = useAtom(userAtom) 
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-8 px-4 ">
        <AnimatedShinyText className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-1 text-sm transition-colors duration-300 ease-out hover:text-neutral-600 dark:hover:text-neutral-400 mt-[-140px]">
          <span>✨ Introducing Bloggify</span>
          <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>

        <GradualSpacing
          className="font-display text-center text-4xl font-bold -tracking-widest text-black dark:text-white md:text-7xl md:leading-[5rem]"
          text="Blog Your Way"
        />

        <p className="max-w-xl text-center text-lg text-gray-600 dark:text-gray-400">
          Craft your thoughts into blogs, manage your content effortlessly, update and share your blogs.
        </p>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          {user ? ( // Check if the user is logged in
            <>
            
                <Link href='/pages/createpost'>
                <ShimmerButton className="shadow-lg">
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Create Posts
                  </span>
                </ShimmerButton>
                </Link>
              

              <Link href='/pages/home'>
                <ShimmerButton className="shadow-lg">
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Show Posts
                  </span>
                </ShimmerButton>
                </Link>
            </>
          ) : (
            <>
              
                <ShimmerButton className="shadow-lg">
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Get Started
                  </span>
                </ShimmerButton>
            

              <ShimmerButton className="shadow-lg">
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                  Learn more
                </span>
              </ShimmerButton>
            </>
          )}
        </div>
      </div>

      <Hero />
    </div>
  )
}
