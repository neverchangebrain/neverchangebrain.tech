export type Job = {
  company: string
  position: string
  introDescription: React.ReactNode
  description?: React.ReactNode
  from: string
  to: string
}

export const assisterr: Job = {
  company: "Assisterr",
  position: "Backend Developer",
  introDescription: (
    <>
      I joined the <a href="https://assisterr.ai">Assisterr</a> team to help
      build a automation, accessibility and uniqueness in the product.
      <br />
      <span className="mt-4 block">
        At the moment, the idea is to expand the capabilities across social
        platforms.
      </span>
    </>
  ),
  from: "2021",
  to: "now",
}

export const nite: Job = {
  company: "NITE",
  position: "Backend Developer",
  introDescription: (
    <>
      I joined <a href="https://discord.gg/nitestudio">NITE Studio</a> to be
      inspired by design, update projects, connect with clients and have tons of
      fun creating!
      <br />
      <span className="mt-4 block">
        Let&#39;s create amazing designs together!
      </span>
    </>
  ),
  from: "2024",
  to: "now",
}