import { InstaxImage } from "./InstaxImage"

export default function TeamGallery() {
  return (
    <section
      aria-labelledby="teamwork-title"
      className="mx-auto mt-5 max-w-4xl animate-slide-up-fade [animation-duration:600ms] [animation-delay:200ms] [animation-fill-mode:backwards]"
    >
      <div className="mt-20">
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <InstaxImage
            className="w-[25rem] -rotate-6 sm:-ml-10"
            src="/images/working.png"
            alt="Building the product"
            width={640}
            height={427}
            caption="Shipping features, not posting about them"
          />
          <InstaxImage
            className="w-[15rem] rotate-3"
            src="/images/workplace.png"
            alt="Focus time"
            width={640}
            height={853}
            caption="Deep work hours are sacred"
          />
          <InstaxImage
            className="-mr-10 w-[15rem] rotate-1"
            src="/images/home.png"
            alt="Building from anywhere"
            width={640}
            height={960}
            caption="Build from anywhere"
          />
        </div>
        <div className="mt-8 hidden w-full justify-between gap-4 md:flex">
          <InstaxImage
            className="-ml-16 w-[25rem] rotate-1"
            src="/images/break.png"
            alt="Team brainstorming"
            width={640}
            height={360}
            caption="Content strategy sessions (the fun kind)"
          />
          <InstaxImage
            className="-mt-10 w-[15rem] -rotate-3"
            src="/images/cool.png"
            alt="Listening to user feedback"
            width={640}
            height={965}
            caption="User calls on repeat"
          />
          <InstaxImage
            className="-mr-20 -mt-2 w-[30rem] rotate-[8deg]"
            src="/images/release.png"
            alt="Celebrating a launch"
            width={1920}
            height={1281}
            caption="v1.0 launch day. First 10 users onboarded in 48 hours."
          />
        </div>
      </div>
      <div className="mt-28">
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <InstaxImage
            className="w-full rotate-1"
            src="/images/founders.png"
            alt="The Build In Social team"
            width={1819}
            height={998}
            caption="We build in public. Obviously."
          />
        </div>
      </div>
    </section>
  )
}
