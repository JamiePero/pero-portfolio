import { projects } from "../data/projects";
import { ProjectCaseStudy } from "./ProjectCaseStudy";
import { SectionHeading } from "./SectionHeading";
import { SmartBinSection } from "./SmartBinSection";

export function Projects() {
  return (
    <section id="work" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="02 / Selected work"
          title="Things I built and actually shipped."
          lead="Three platforms, three different problems. Each one went from an idea to something people actually use, hardware and payments and design systems and all."
        />

        <div className="mt-16 md:mt-20">
          {projects.map((project) => (
            <ProjectCaseStudy
              key={project.id}
              project={project}
              // Jexi is the only one with a model to show, so it's the only one
              // that gets the viewer. Everything inside it is gated and lazy,
              // so this costs nothing for visitors who never reach it.
              extra={project.id === "jexi" ? <SmartBinSection /> : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
