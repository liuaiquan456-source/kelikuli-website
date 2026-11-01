export type DevelopmentProject = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  imageCaption: string;
  evidence: string;
  evidenceHref: string;
  brief: string;
  category: string;
  service: string;
  guide: string;
  specifications: [string, string][];
  stages: [string, string][];
  questions: string[];
};

export const developmentProjects: DevelopmentProject[] = [
  {
    slug: "tourism-souvenir-fridge-magnet",
    title: "Tourism Souvenir & Fridge Magnet Program",
    summary:
      "A development brief for destination-themed relief magnets, using an existing KELIKULI catalog image as a visual reference.",
    image: "/images/collections/col-fridge-magnet-v2.jpg",
    imageCaption:
      "Existing catalog image: an Italy-themed relief magnet. Shown as a design reference, not evidence of a named customer order.",
    evidence: "KELIKULI’s existing fridge-magnet collection image",
    evidenceHref: "/products?category=Fridge+Magnet",
    brief:
      "Develop a souvenir format that combines recognizable landmarks, readable destination lettering and a manageable display footprint. The proposed buyer brief would define the destination, sales channel, artwork rights and quantity per design.",
    category: "Fridge Magnet",
    service: "mold-making-resin-casting",
    guide: "custom-resin-figurine-cost",
    specifications: [
      [
        "Material",
        "Proposed resin relief with a magnetic attachment; specification to be confirmed.",
      ],
      [
        "Product dimensions",
        "Buyer to define height, width and maximum projection.",
      ],
      ["MOQ", "To be quoted per sculpt and colorway after artwork review."],
      [
        "Sample method",
        "Proposed shape review followed by a painted and assembled sample.",
      ],
      [
        "Finish and color",
        "Paint map based on approved landmark and lettering references.",
      ],
      [
        "Packaging",
        "Protective individual packing; retail presentation to be selected.",
      ],
      [
        "Production lead time",
        "Not yet confirmed; requires sample, quantity and packing approval.",
      ],
    ],
    stages: [
      [
        "Buyer brief",
        "Proposed: identify destination motifs, quantity split and display requirements.",
      ],
      [
        "Design revision",
        "Planned: review lettering size, landmark accuracy and fragile relief details.",
      ],
      [
        "3D model",
        "Planned: define relief depth, flat back and attachment position.",
      ],
      [
        "Prototype",
        "Not documented for this brief: verify scale, weight and attachment behavior on a sample.",
      ],
      [
        "Color approval",
        "Pending: approve the paint map and visible detail limits.",
      ],
      [
        "Packaging",
        "Pending: review protection for projecting landmarks and retail labeling.",
      ],
      [
        "Mass production",
        "Not documented for this brief: release only against an approved sample and specification.",
      ],
      [
        "Timeline",
        "To be agreed after artwork review; no completed-order dates are claimed.",
      ],
    ],
    questions: [
      "How can the destination name remain legible at the selected scale?",
      "Which projecting details need reinforcement or packing support?",
      "What attachment specification suits the finished weight and intended surface?",
    ],
  },
  {
    slug: "pet-memorial-urn-collection",
    title: "Pet Memorial Urn Collection",
    summary:
      "A concept-led development project exploring a discreet memorial object, with capacity, closure and presentation still to be specified.",
    image: "/images/news/pet-memorial-collection-overview.jpg",
    imageCaption:
      "Concept visualization from KELIKULI’s existing pet memorial article. It does not establish a completed physical sample or production order.",
    evidence: "Existing pet memorial product-development article",
    evidenceHref:
      "/news/next-gen-pet-memorial-products-bridge-craftsmanship-and-comfort",
    brief:
      "Explore a memorial collection with a restrained decorative appearance and room for personalization. A procurement brief must establish the internal capacity, closure requirements, intended contents, dimensions and acceptable surface effects before sampling.",
    category: "Pet Memorial",
    service: "3d-design-prototyping",
    guide: "prepare-artwork-custom-resin",
    specifications: [
      [
        "Material",
        "Proposed resin body; the illustrated wood-like appearance is a finish concept.",
      ],
      [
        "Product dimensions",
        "External size and usable internal capacity are not yet confirmed.",
      ],
      ["MOQ", "Subject to design, size, finish and packaging review."],
      [
        "Sample method",
        "Proposed physical sample to review shape, capacity and closure separately.",
      ],
      [
        "Finish and color",
        "Wood-like surface concept; color and texture need physical approval.",
      ],
      [
        "Packaging",
        "Protective support and discreet branded presentation to be developed.",
      ],
      [
        "Production lead time",
        "To be scheduled after functional and appearance approvals.",
      ],
    ],
    stages: [
      [
        "Buyer brief",
        "Proposed: define capacity, closure, personalization and sales channel.",
      ],
      [
        "Design revision",
        "Planned: resolve the opening, base, wall layout and personalizable area.",
      ],
      [
        "3D model",
        "Not verified: model must define internal as well as external geometry.",
      ],
      [
        "Prototype",
        "Not verified: a physical sample is needed for fit, stability and capacity review.",
      ],
      [
        "Color approval",
        "Pending: evaluate a physical finish against the concept visualization.",
      ],
      [
        "Packaging",
        "Pending: assess support around the closure and decorative surfaces.",
      ],
      [
        "Mass production",
        "Not verified: the public concept article is not a production record.",
      ],
      [
        "Timeline",
        "Unconfirmed; development milestones depend on the agreed functional brief.",
      ],
    ],
    questions: [
      "What usable capacity is needed for the intended application?",
      "How should the closure operate and be evaluated?",
      "Which finish and personalization details can be reproduced consistently?",
    ],
  },
  {
    slug: "seasonal-decor-collection",
    title: "Christmas & Halloween Seasonal Décor",
    summary:
      "A collection-planning project using existing seasonal imagery to frame design variants, paint approvals and a retail launch schedule.",
    image: "/images/collections/Christmas Resin Toys.png",
    imageCaption:
      "Existing KELIKULI seasonal collection imagery. It illustrates a design direction; no customer identity, order quantity or sales result is claimed.",
    evidence: "KELIKULI’s seasonal catalog imagery",
    evidenceHref: "/products",
    brief:
      "Plan a coordinated seasonal range with a controlled number of sculpts and colorways. The buyer’s intended shelf date, quantity split, packing format and licensed-artwork requirements would determine the development scope.",
    category: "Christmas",
    service: "low-moq-resin-manufacturing",
    guide: "custom-resin-production-lead-time",
    specifications: [
      [
        "Material",
        "Proposed decorative resin / polyresin; intended use must be confirmed.",
      ],
      [
        "Product dimensions",
        "A coordinated size range to be defined in the buyer brief.",
      ],
      ["MOQ", "To be reviewed per sculpt, colorway and packing version."],
      [
        "Sample method",
        "Proposed representative samples plus approval for each distinct design / finish.",
      ],
      [
        "Finish and color",
        "Coordinated seasonal palette with detail-painting references.",
      ],
      [
        "Packaging",
        "Protection for hats, ears and projecting accessories; retail box options to be quoted.",
      ],
      [
        "Production lead time",
        "Schedule to work backward from the buyer’s required arrival date.",
      ],
    ],
    stages: [
      [
        "Buyer brief",
        "Proposed: define selling season, arrival date and assortment size.",
      ],
      [
        "Design revision",
        "Planned: prioritize a coherent range and mark features that can be shared.",
      ],
      [
        "3D model",
        "Not documented for this brief: confirm silhouettes, bases and accessories.",
      ],
      [
        "Prototype",
        "Pending: evaluate stability, fragile details and packed size.",
      ],
      [
        "Color approval",
        "Pending: approve palette consistency and detail-painting limits.",
      ],
      [
        "Packaging",
        "Pending: develop protection and confirm print artwork before bulk packing.",
      ],
      [
        "Mass production",
        "Not documented for this brief: release only after design and packing approvals.",
      ],
      [
        "Timeline",
        "To be agreed with approval deadlines and transport assumptions; no shipment history is asserted.",
      ],
    ],
    questions: [
      "Which variants are essential for the first launch?",
      "Can a shared palette or box format simplify the opening order?",
      "What approval deadlines protect the required retail arrival date?",
    ],
  },
];
