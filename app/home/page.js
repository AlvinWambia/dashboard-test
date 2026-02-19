"use client"; // Required for interactivity (State)



import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon } from "lucide-react"
import * as React from "react"
import Link from "next/link"
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

  return (
    //NAVBAR
    <div className="bg-white h-screen text-black mt-5 ">
      <FadeInSection>
        <div className="flex flex-row px-10 pt-15 pb-30 ">
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
          <p className="text-sm font-medium pt-2 text-center items-center justify-center"> We provide a range of services to meet your needs.</p>
          <div className="py-10 bg-gray flex flex-row ">
            <Card className="relative mx-auto w-full max-w-sm pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src={communicationImage.src}
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover"
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
                <Button className="w-full">View Event</Button>
              </CardFooter>
            </Card>
            <Card className="relative mx-auto w-full max-w-sm pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src={communicationImage.src}
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover "
              />
              <CardHeader>
                <CardAction>
                  <Badge variant="outline" >
                    Self taught
                  </Badge>
                </CardAction>
                <CardTitle>UX/UI Design</CardTitle>
                <CardDescription>
                  Self-taught design with a bacground in Figma. Still aspiring to get a course done on it.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">View Event</Button>
              </CardFooter>
            </Card>
            <Card className="relative mx-auto w-full max-w-sm pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src={communicationImage.src}
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover"
              />
              <CardHeader>
                <CardAction>
                  <Badge variant="outline">
                    Ameture
                  </Badge>
                </CardAction>
                <CardTitle>Data Analysis</CardTitle>
                <CardDescription>
                  An ameture in data analytics. Barely have a bacground on it , still aspiring to do a course on it.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">View Event</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div>
          <div>
            <p className="text-3xl font-bold text-center items-center justify-center">
              My Projects
            </p>
            <p className="text-sm font-medium pt-2 text-center items-center justify-center">
              Still improving my portfolio.Bare with me. I have little  projects.
            </p>
          </div>




        </div>
      </FadeInSection>



      <FadeInSection>
        <footer className="flex fex-row px-20 py-20 ">
          <div className="flex flex-col py-5">
            <p>FitWithP</p>
            <p>© copyright FitWithP 2026. All rights reserved.</p>
          </div>

          <div className="flex flex-col px-20 py-5">
            <p>Pages</p>

          </div>

          <div className="flex flex-col py-5">
            <p>Socials</p>
            <div className="flex flex-col pt-5">
              <Item variant="outline" size="sm" className="mb-5">
                <ItemMedia variant="icon">

                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-sm font-medium pl-3">GitHubsss</ItemTitle>
                  <ItemDescription className="text-sm font-medium pl-3">Follow me on my GitHub.</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="outline">GitHub</Badge>
                </ItemActions>
              </Item>
              <Item variant="outline" size="sm">
                <ItemMedia variant="icon">

                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Dribbble</ItemTitle>
                  <ItemDescription>View my UX/UI designs.</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="outline"></Badge>
                </ItemActions>
              </Item>
            </div>
          </div>


        </footer>
      </FadeInSection>
    </div>




  )
}
