"use client"; // Required for interactivity (State)


import "@/app/globals.css";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, AlertCircleIcon } from "lucide-react"
import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import communicationImage from "@/components/images/communication.png"
import sdImage from "@/components/images/sd.png"
import uxImage from "@/components/images/ux.png"
import daImage from "@/components/images/da.png"


function FadeInSection({ children }) {
  const [isVisible, setIsVisible] = React.useState(false)
  const domRef = React.useRef()

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting)
      })
    })
    const { current } = domRef
    if (current) observer.observe(current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}
    >

      {children}
    </div>
  )
}

export default function AuthPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    //NAVBAR
    <div className="bg-white h-screen text-black mt-5 my-20 py-10 ">
      {error === 'unauthorized' && (
        <div className="fixed top-5 right-5 z-50 w-full max-w-md animate-in fade-in slide-in-from-top-5">
          <Alert variant="destructive" className="bg-white shadow-lg">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Your account is not registered as an admin.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <FadeInSection>
        <div className="flex flex-row px-10 pt-10 pb-30 ">
          <div className="flex flex-col w-220">
            <div className="flex flex-wrap items-center gap-2 md:flex-row py-5">
              <Button variant="outline">Learn More</Button>
              <Button variant="outline" size="icon" aria-label="Submit">
                <ArrowUpIcon />
              </Button>
            </div>
            <p className="text-7xl font-bold w-220 py-3">
              Welcome to the Dashboard Test Home Page
            </p>
            <p className="text-lg font-medium pt-5">
              This is a testing page for a dashbaord project. Soon authentication will be added together with service production.
            </p>

            <div className="flex flex-row pt-5">
              <Button className="px-6 mx-4 bg-black text-white border-blue-200 rounded-2xl shadow hover:bg-white hover:text-black transition">
                <p>Get Started</p>
              </Button>
              <Button className="px-6 mx-4 bg-black text-white border-blue-200 rounded-2xl shadow hover:bg-white hover:text-black transition">
                <p>View More</p>
              </Button>
            </div>


          </div>

          <div className="px-10">
            <img
              src={communicationImage.src}
              alt="Event cover"
              className="w-180 h-140 rounded-xl"

            />


          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div>
          <p className="text-3xl font-bold text-center items-center justify-center">
            Our Offerings</p>
          <p className="text-sm font-medium py-3 text-center items-center justify-center"> We provide a range of services to meet your needs.</p>
          <div className="py-10 bg-gray-50 flex flex-row ">
            <Card className="relative mx-auto w-full max-w-sm pt-0">
              <img
                src={sdImage.src}
                alt="Event cover"
                className="w-60 h-60 rounded-2xl object-cover mx-auto my-6"
              />
              <CardHeader>
                <CardAction>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-transparent hover:bg-blue-950 hover:text-blue-300">Base</Badge>
                </CardAction>
                <CardTitle>Software Development</CardTitle>
                <CardDescription>
                  A history and bacground in software development. Learning from CA University.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full rounded-2xl bg-white text-black border-2 border-black hover:bg-black hover:text-white">View CV</Button>
              </CardFooter>
            </Card>
            <Card className="relative mx-auto w-full max-w-sm pt-0">
              <img
                src={uxImage.src}
                alt="Event cover"
                className="w-60 h-60 rounded-3xl object-cover mx-auto my-6"
              />
              <CardHeader>
                <CardAction>
                  <Badge className="bg-green-50 text-green-600" >
                    Self taught
                  </Badge>
                </CardAction>
                <CardTitle>UX/UI Design</CardTitle>
                <CardDescription>
                  Self-taught design with a bacground in Figma. Still aspiring to get a course done on it.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full rounded-2xl bg-white text-black border border-black hover:bg-black hover:text-white">View CV</Button>
              </CardFooter>
            </Card>
            <Card className="relative mx-auto w-full max-w-sm pt-0">
              <img
                src={daImage.src}
                alt="Event cover"
                className="w-60 h-60 rounded-2xl object-cover mx-auto  my-6"
              />

              <CardHeader>
                <CardAction>
                  <Badge className="bg-yellow-50 text-yellow-600">
                    Ameture
                  </Badge>
                </CardAction>
                <CardTitle>Data Analysis</CardTitle>
                <CardDescription>
                  An ameture in data analytics. Barely have a bacground on it , still aspiring to do a course on it.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full rounded-2xl bg-white text-black border-2 border-black hover:bg-black hover:text-white">View CV</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div>
          <div>
            <p className="text-3xl font-bold text-center items-center justify-center pt-5">
              My Projects
            </p>
            <p className="text-sm font-medium pt-2 text-center items-center justify-center">
              Still improving my portfolio.Bare with me. I have little  projects.
            </p>
          </div>




        </div>
      </FadeInSection>



      <FadeInSection>

        <div className="flex flex-row px-20 py-10 mx-10 mt-20 mb-10 bg-white text-xs rounded-3xl shadow-2xl">
          <div className="flex flex-col py-5 ">
            <p className="text-sm font-bold">⠿FitWithP</p>
            <p className="text-xs mt-2">© copyright FitWithP 2026. All rights reserved.</p>
            <Button className="w-50 rounded-2xl text-white bg-black border-2 border-black hover:bg-black hover:text-white mt-3">Become a member</Button>
          </div>

          <div className="flex flex-col px-20 py-5">
            <p className="px-20 py-3 font-bold">Pages</p>
            <div className="flex flex-col px-20 text-black">
              <p className="py-1">Home</p>
              <p className="py-1">About</p>
              <p className="py-1">Projects</p>
              <p className="py-1">Contact</p>
            </div>


          </div>

          <div className="flex flex-col py-5 ml-15">
            <p className="py-3 font-bold">Socials</p>
            <div className="flex flex-col text-black">
              <p className="py-1">Instagram</p>
              <p className="py-1">Facebook</p>
              <p className="py-1">Twitter</p>
              <p className="py-1">TikTok</p>
            </div>
          </div>

          <div className="ml-15">
            <p className="px-20  pt-8 pb-3 text-xs font-bold">Newsletter</p>
            <p className="text-xs px-20 w-100 pb-4">Receive product updates news, exclusive discounts and early access.</p>
            <div className="px-20">
              <Field orientation="horizontal" className="text-xs">
                <Input type="search" placeholder="Enter email..." className="rounded-2xl text-xs" />
                <Button className="rounded-2xl text-xs">Send</Button>
              </Field>
            </div>
          </div>


        </div>

        <div>
          <p className="text-lg font-bold mx-auto items-center justify-center">Welcome</p>
        </div>

      </FadeInSection>

    </div>




  )
}
