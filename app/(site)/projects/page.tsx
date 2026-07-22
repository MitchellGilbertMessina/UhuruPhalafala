import { getProjects } from "@/sanity/sanity-utils"
import Link from "next/link"

export default async function ProjectsPage() {

  const projects = await getProjects()

  return (
    <div className="max-w-5xl mx-auto py-20 px-6">

      <h1 className="text-3xl font-bold mb-10">Projects</h1>

      <div className="grid grid-cols-2 gap-8">

        {projects.map((project:any) => (

          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="border p-6 rounded-lg hover:bg-gray-50"
          >
            {project.title}
          </Link>

        ))}

      </div>

    </div>
  )
}