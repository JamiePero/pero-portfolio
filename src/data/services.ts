export type Service = {
  id: string;
  index: string;
  title: string;
  /** Always-visible one-liner. */
  summary: string;
  /** Revealed on hover / focus / tap. */
  detail: string;
  tools: string[];
};

export const services: Service[] = [
  {
    id: "3d",
    index: "01",
    title: "3D Modeling",
    summary: "Product design, prototyping and photoreal renders.",
    detail:
      "Parametric CAD when it has to be manufacturable, sculpted and lit renders when it has to sell. I take products from a rough idea to printable geometry and marketing-ready visuals.",
    tools: ["Fusion 360", "Blender"],
  },
  {
    id: "brand",
    index: "02",
    title: "Logo & Brand Design",
    summary: "Marks, identity systems and packaging that hold up in the real world.",
    detail:
      "You get more than a logo file. A wordmark, colour system, type scale, and the packaging artwork to go with it. Built so it still works at thumbnail size and on a printed carton.",
    tools: ["Illustrator", "Blender", "Canva"],
  },
  {
    id: "embedded",
    index: "03",
    title: "Arduino / ESP32 Development",
    summary: "Embedded systems, IoT devices and DIY hardware that ships.",
    detail:
      "Firmware, sensor integration, wireless connectivity and the enclosure to put it in. I work through the whole loop, from breadboard to PCB-ready design to a 3D printed housing, plus the app or dashboard that talks to it.",
    tools: ["Arduino", "ESP32", "C++", "MQTT"],
  },
  {
    id: "web",
    index: "04",
    title: "Web Development & SEO",
    summary: "Full site builds plus the technical SEO that makes them findable.",
    detail:
      "React and Node builds from scratch, deployed and monitored. Then the part most developers skip: schema, Core Web Vitals, crawlability and the on-page work that gets you ranked instead of just live.",
    tools: ["React", "Node.js", "TypeScript", "Technical SEO"],
  },
];

/** Skill pills for the About section marquee. */
export const skills = [
  "3D Modeling",
  "Fusion 360",
  "Blender",
  "Logo & Brand Design",
  "Packaging",
  "Arduino",
  "ESP32",
  "IoT",
  "React",
  "TypeScript",
  "Node.js",
  "Firebase",
  "Technical SEO",
  "Web Development",
];
