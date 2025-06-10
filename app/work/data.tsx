export type Job = {
  company: string
  position: string
  introDescription: React.ReactNode
  description?: React.ReactNode
  from: string
  to: string
}

export const insiderTeam: Job = {
  company: "Insider Team",
  position: "Backend Developer",
  introDescription: (
    <>
      I joined the <a href="https://www.insiders.software">Insider Team</a> to develop
      my experience and work on various projects as part of a team.
    </>
  ),
  from: "2025",
  to: "*",
}

export const assisterr: Job = {
  company: "Assisterr",
  position: "Backend/Service Developer",
  introDescription: (
    <>
      I joined the <a href="https://assisterr.ai">Assisterr</a> team to help
      build a automation, accessibility and uniqueness in the product.
    </>
  ),
  from: "2021",
  to: "2024",
}
