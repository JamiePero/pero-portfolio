import { projects } from "../data/projects";
import { ProjectCaseStudy } from "./ProjectCaseStudy";
import { SectionHeading } from "./SectionHeading";

export function Projects() {
  return (
    <section id="work" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="02 / Selected work"
          title="Things I built and actually shipped."
          lead="Three platforms, three different problems. Each one went from an idea to something people use — hardware, payments, design systems and all."
        />

        <div className="mt-16 md:mt-20">
          {projects.map((project) => (
            <ProjectCaseStudy key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
