import { getProject, getProjects } from "@/sanity/sanity-utils";
import { PortableText } from "@portabletext/react"
import Image from "next/image";


type Props = {
    params: { project: string };
}

export default async function Project({ params }: Props) {

    const slug = params.project;
    const project = await getProject(slug);
    const publications = await getProjects();

    if (!project) {
        return <div>Publication not found.</div>;
    }

    return <div className="max-w-3xl mx-auto py-20">

        <header className="flex items-center justify-between">
            <h1>{project.title}</h1>
            <h1>plopplop</h1>
        </header>

       {project.frontcover && (
                   <Image
                   src={project.frontcover}
                   alt={project.alt}
                   width={200}
                   height={200}
                 className="object-cover rounded-lg" 
               />
             )}

        <div><PortableText value={project.content} /></div>

    </div>
}