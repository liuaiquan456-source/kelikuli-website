export type ContentSection = {
  title: string;
  paragraphs: string[];
  checklist?: string[];
};
export type Service = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  inputs: string[];
  deliverables: string[];
  decisions: ContentSection[];
  material: string;
  dimensions: string;
  finish: string;
  packaging: string;
  timing: [string, string][];
  project: string;
  guide: string;
  category: string;
};

export const services: Service[] = [
  {
    slug: "custom-resin-manufacturing",
    title: "Custom Resin Manufacturing",
    summary:
      "Turn an approved product brief into a resin figurine, souvenir or giftware production plan, with clear approval points from artwork to packing.",
    audience:
      "Brands, gift importers, designers and retailers developing an original resin product or adapting a catalog design.",
    inputs: [
      "Front, side and back references; confirmation that you may use the artwork",
      "Target dimensions, quantity per design and intended use",
      "Destination market, packing requirements and required delivery date",
    ],
    deliverables: [
      "A quotation separating development, tooling, unit production and packaging",
      "A proposed design, sample and production approval sequence",
      "An agreed specification and packing plan before production release",
    ],
    decisions: [
      {
        title: "Define the product before comparing prices",
        paragraphs: [
          "A small figure with separate accessories can require more assembly and painting than a larger, simpler shape. Share the full design, including its base, underside and concealed surfaces. Identify details that must be preserved and areas where you can accept a manufacturing adjustment.",
        ],
      },
      {
        title: "Approve one reference for production",
        paragraphs: [
          "Confirm the sculpt, paint map, material appearance and packaging together. A signed sample or agreed photo set becomes the reference for production; changes after approval may require revised tooling or a new price.",
        ],
        checklist: [
          "Record the artwork revision and sample approval",
          "Confirm quantities by design and colorway",
          "Agree the inspection scope and shipping terms",
        ],
      },
    ],
    material:
      "Resin / polyresin; formulation and any mixed-material components reviewed against the intended use.",
    dimensions:
      "Height, width, depth and base footprint confirmed after artwork review.",
    finish:
      "Hand-painted details, sprayed base colors and decorative effects assessed against a reference sample.",
    packaging:
      "Protective inner support, individual boxes and export cartons scoped with the product.",
    timing: [
      ["MOQ", "Quoted per design and colorway after artwork review."],
      [
        "Sampling",
        "Scheduled after the brief, dimensions and sample method are agreed.",
      ],
      [
        "Mold making",
        "Confirmed after the master shape and part split are approved.",
      ],
      [
        "Mass production",
        "Confirmed after sample approval, order quantity and packing specifications are fixed.",
      ],
    ],
    project: "tourism-souvenir-fridge-magnet",
    guide: "custom-resin-figurine-cost",
    category: "Fridge Magnet",
  },
  {
    slug: "low-moq-resin-manufacturing",
    title: "Low-MOQ Resin Manufacturing",
    summary:
      "Plan a smaller opening order by separating essential product features from options that increase setup, tooling or packaging cost.",
    audience:
      "Independent brands, museum shops and retailers testing a new collection before committing to repeat production.",
    inputs: [
      "Target opening quantity and realistic reorder expectations",
      "Number of unique sculpts, colorways and packing versions",
      "Budget priorities and details that can be simplified",
    ],
    deliverables: [
      "Feasibility review for your proposed opening quantity",
      "Options to reuse a shape, simplify a finish or standardize packaging",
      "A quotation showing setup costs separately from repeat unit costs",
    ],
    decisions: [
      {
        title: "Count designs, not only total pieces",
        paragraphs: [
          "An order of several designs is not equivalent to the same total quantity of one design. Each new sculpt may need its own master and molds; each colorway may introduce a separate paint setup. Send the quantity split so the quotation reflects the actual work.",
        ],
      },
      {
        title: "Use a staged launch",
        paragraphs: [
          "Consider one approved shape and a restrained finish for the first run. Compare a plain protective box with custom printed packaging. Ask what can be retained for a reorder, and what changes would trigger a new setup charge.",
        ],
        checklist: [
          "Request quantity alternatives for the same specification",
          "Compare total first-order spend, not unit price alone",
          "Confirm tooling storage and reorder conditions in writing",
        ],
      },
    ],
    material:
      "Resin / polyresin reviewed for the design; special inserts can affect supplier minimums.",
    dimensions:
      "One shared body size may reduce the number of masters and packing formats.",
    finish:
      "A smaller color palette or shared base color can simplify the opening run.",
    packaging:
      "Standard protective packaging can be compared with custom printed boxes.",
    timing: [
      [
        "MOQ",
        "Project-specific. A small quantity is a review request, not an automatic acceptance.",
      ],
      ["Sampling", "Required approval steps still apply to small orders."],
      [
        "Mold making",
        "Tooling needs depend on shape and part count, not only quantity.",
      ],
      [
        "Mass production",
        "Scheduled after feasibility and sample approval; small orders are not necessarily faster.",
      ],
    ],
    project: "seasonal-decor-collection",
    guide: "moq-custom-resin-products",
    category: "Christmas",
  },
  {
    slug: "3d-design-prototyping",
    title: "3D Design & Prototyping",
    summary:
      "Resolve proportions, part separation and visible details before committing to production molds.",
    audience:
      "Design teams with sketches or digital artwork who need a physical resin product developed for review.",
    inputs: [
      "Multi-view artwork or an existing 3D file, plus the file revision",
      "Dimensions in millimeters and reference colors",
      "Moving parts, inserts, logo positions and must-keep details",
    ],
    deliverables: [
      "Review of missing views and manufacturing constraints",
      "A proposed model / prototype review sequence and revision scope",
      "A prototype specification and approval record for the next stage",
    ],
    decisions: [
      {
        title: "A render is a visual brief",
        paragraphs: [
          "A single image does not define the back, wall thickness, assembly or stability. Mark uncertain areas before modeling. Thin accessories, deep undercuts and narrow contact points need review because the finished object must survive production, handling and packing.",
        ],
      },
      {
        title: "Choose what the sample must prove",
        paragraphs: [
          "A shape sample checks silhouette and dimensions. A painted sample adds color placement and surface texture. A functional sample must also address fit or closure. Agree which questions the sample answers so a visual approval is not mistaken for a performance test.",
        ],
        checklist: [
          "Use one numbered revision for comments",
          "Approve dimensions separately from photography",
          "Confirm file ownership, deliverables and revision charges",
        ],
      },
    ],
    material:
      "Prototype method and material are quoted separately from final production resin.",
    dimensions:
      "Specify overall size, fitting dimensions and tolerance priorities.",
    finish: "Unpainted shape review or painted appearance sample, as agreed.",
    packaging:
      "Sample protection first; retail packing can be developed alongside the approved shape.",
    timing: [
      [
        "MOQ",
        "Development is scoped separately from the eventual production quantity.",
      ],
      [
        "Sampling",
        "Depends on artwork completeness, modeling complexity and revision rounds.",
      ],
      [
        "Mold making",
        "Begins only after the relevant master / prototype approval.",
      ],
      [
        "Mass production",
        "Estimated after the approved sample defines the production work.",
      ],
    ],
    project: "pet-memorial-urn-collection",
    guide: "prepare-artwork-custom-resin",
    category: "Pet Memorial",
  },
  {
    slug: "mold-making-resin-casting",
    title: "Mold Making & Resin Casting",
    summary:
      "Review part splits, mold requirements and casting details against an approved master and a defined order quantity.",
    audience:
      "Buyers with a developed sculpt or prototype who need production tooling and repeatable cast resin parts.",
    inputs: [
      "Approved model or physical master with dimensions",
      "Undercuts, hollow areas, inserts and assembly requirements",
      "Opening quantity, reorder plan and critical surface requirements",
    ],
    deliverables: [
      "Tooling scope with the proposed part breakdown",
      "Casting and assembly points for sample review",
      "Written confirmation of tooling charges, ownership and reorder arrangements",
    ],
    decisions: [
      {
        title: "Part separation affects more than tooling",
        paragraphs: [
          "Splitting a figure may make a difficult shape easier to cast, but it adds joining and finishing work. Identify visible seams and areas that will be concealed. An accessory should not be separated solely for a lower mold quote if the resulting assembly is fragile.",
        ],
      },
      {
        title: "Clarify what a tooling quote includes",
        paragraphs: [
          "Ask whether the quotation includes master preparation, production molds, trial castings and corrections. The number of molds needed depends on the production plan and design. Replacements and future changes should be agreed rather than assumed to be free.",
        ],
        checklist: [
          "Approve seam locations on the sample",
          "Review bubbles, pinholes and distortion criteria",
          "Record mold ownership, maintenance and storage terms",
        ],
      },
    ],
    material:
      "Casting resin / polyresin and any inserts are assessed for the product specification.",
    dimensions:
      "Critical dimensions and fit points need explicit checks after casting.",
    finish:
      "Cast parts may require trimming, sanding and surface preparation before painting.",
    packaging:
      "Part shape and fragility inform protective support and assembly choices.",
    timing: [
      [
        "MOQ",
        "Linked to the design, number of molds and production economics.",
      ],
      [
        "Sampling",
        "Trial castings follow tooling preparation and may require corrections.",
      ],
      [
        "Mold making",
        "Quoted after review of the approved master and part split.",
      ],
      [
        "Mass production",
        "Casting capacity, curing, finishing and packing are scheduled together.",
      ],
    ],
    project: "tourism-souvenir-fridge-magnet",
    guide: "resin-prototype-mold-cost",
    category: "Fridge Magnet",
  },
  {
    slug: "hand-painting-finishing",
    title: "Hand Painting & Finishing",
    summary:
      "Translate a color reference into a practical paint map, with agreed expectations for detail, texture and acceptable variation.",
    audience:
      "Brands developing detailed figurines, decorative gifts or collections with distinctive painted surfaces.",
    inputs: [
      "Color references and a marked paint map for all views",
      "Gloss, matte, metallic or weathered appearance references",
      "Important facial, logo and edge details, plus target quantity",
    ],
    deliverables: [
      "Review of base-color and detail-painting requirements",
      "A proposed painted sample for approval",
      "Appearance checkpoints and an agreed production reference",
    ],
    decisions: [
      {
        title: "Separate color from technique",
        paragraphs: [
          "A metallic effect, gradient and solid base color require different work. Mark the boundary between colors, including undersides and accessories. A photograph alone can shift with lighting; physical or standardized color references help clarify the intended result.",
        ],
      },
      {
        title: "Agree acceptable handwork variation",
        paragraphs: [
          "Hand-applied details will not be pixel-identical across every piece. Identify the features that matter most, such as eyes, lettering or alignment, and approve representative limits. Confirm the appearance under agreed lighting before production.",
        ],
        checklist: [
          "Approve paint coverage and visible seam treatment",
          "Define unacceptable marks, chips and missed areas",
          "Confirm coating and testing requirements for the intended use",
        ],
      },
    ],
    material:
      "Coatings and paint compatibility reviewed against the selected resin and use.",
    dimensions:
      "Small details and recessed areas may need simplification at the final scale.",
    finish:
      "Sprayed base colors, hand-painted details and decorative effects by sample approval.",
    packaging:
      "Contact surfaces and drying requirements inform protective wrapping.",
    timing: [
      ["MOQ", "Affected by colorways, paint setup and detail complexity."],
      ["Sampling", "Includes the agreed number of color review rounds."],
      [
        "Mold making",
        "Shape changes discovered during painting may require tooling review.",
      ],
      [
        "Mass production",
        "Depends on paint steps, drying, inspection and any rework.",
      ],
    ],
    project: "seasonal-decor-collection",
    guide: "custom-resin-manufacturing-process",
    category: "Christmas",
  },
  {
    slug: "private-label-packaging",
    title: "Private Label & Packaging",
    summary:
      "Develop the branding, protective support and retail presentation around the product’s shape and delivery route.",
    audience:
      "Retailers, importers and brands preparing resin giftware for their own sales channels.",
    inputs: [
      "Logo artwork, label text and barcode requirements",
      "Sales channel, destination and carton / shipping constraints",
      "Product dimensions, fragile points and preferred box style",
    ],
    deliverables: [
      "Review of logo placement and printable artwork requirements",
      "Packing specification separating inner protection, retail box and outer carton",
      "Packing sample and approval checkpoints before bulk printing",
    ],
    decisions: [
      {
        title: "Design protection and presentation together",
        paragraphs: [
          "A box that looks right may leave a thin accessory unsupported. Start with the product’s fragile points, then determine support, clearance and removal method. Ask for the packed dimensions and weight when comparing freight estimates.",
        ],
      },
      {
        title: "Lock text before printing",
        paragraphs: [
          "Confirm the legal entity, destination language, barcode and required warnings with your responsible team. Product classification and market rules vary; packaging artwork approval does not itself establish regulatory compliance.",
        ],
        checklist: [
          "Approve a print proof at actual size",
          "Check the product orientation and unboxing sequence",
          "Agree packing validation for the intended shipping route",
        ],
      },
    ],
    material:
      "Box board, inserts and wrapping options reviewed for the product and shipping method.",
    dimensions:
      "Retail and master-carton sizes established using the approved product and support.",
    finish:
      "Logo application and printed finishes subject to artwork and supplier review.",
    packaging:
      "Plain or custom printed boxes, fitted inner protection and export cartons as quoted.",
    timing: [
      [
        "MOQ",
        "Printing and insert suppliers may have minimums separate from the resin product.",
      ],
      [
        "Sampling",
        "Allow time for structural samples and print-proof approval.",
      ],
      [
        "Mold making",
        "Product tooling and packaging tooling, if any, are separate line items.",
      ],
      [
        "Mass production",
        "Packing procurement must align with the finished-product schedule.",
      ],
    ],
    project: "pet-memorial-urn-collection",
    guide: "custom-resin-production-lead-time",
    category: "Pet Memorial",
  },
  {
    slug: "resin-quality-control",
    title: "Resin Product Quality Control",
    summary:
      "Agree what to inspect, when to inspect it and which approved reference defines an acceptable resin product.",
    audience:
      "Importers and brand teams who need documented checks for appearance, assembly, dimensions and packing.",
    inputs: [
      "Approved sample and current specification",
      "Critical defects, measurement points and functional requirements",
      "Destination market, intended age/use and requested independent tests",
    ],
    deliverables: [
      "An agreed inspection scope and defect checklist",
      "Defined approval points for sample, production and packing",
      "Project-specific reporting and escalation arrangements",
    ],
    decisions: [
      {
        title: "Make the acceptance criteria visible",
        paragraphs: [
          "Write down the difference between an acceptable hand-painted variation and a reject. Include photographs where possible. Size checks, base stability, attached accessories, paint coverage and packing protection are different checks; one overall quality score cannot replace them.",
        ],
      },
      {
        title: "Separate inspection from certification",
        paragraphs: [
          "An appearance inspection does not prove chemical, toy-safety or food-contact compliance. Identify the product classification and destination requirements with a qualified party, then agree any laboratory testing and documentation before the order is released.",
        ],
        checklist: [
          "Define inspection timing and sampling with the buyer",
          "Record how rejected pieces will be handled",
          "Confirm who can authorize shipment after inspection",
        ],
      },
    ],
    material:
      "Material requirements and any test reports must match the particular product and market.",
    dimensions:
      "Buyer-designated measurement points and tolerances are recorded in the specification.",
    finish:
      "Compare color, coverage, chips, scratches and visible joints with the approved sample.",
    packaging:
      "Check item identity, count, labels, support and carton condition against the packing plan.",
    timing: [
      [
        "MOQ",
        "Inspection scope is agreed for the order; it does not establish a product MOQ.",
      ],
      [
        "Sampling",
        "The approved sample defines appearance expectations before production.",
      ],
      [
        "Mold making",
        "Early casting checks can identify defects before painting.",
      ],
      [
        "Mass production",
        "Include inspection, corrective action and packing checks in the shipment plan.",
      ],
    ],
    project: "seasonal-decor-collection",
    guide: "custom-resin-manufacturing-process",
    category: "Christmas",
  },
];

export const industries = [
  {
    title: "Brands & Character Merchandising",
    brief:
      "Character proportions, licensed artwork, color consistency and retail presentation.",
    category: "Figurines",
    service: "3d-design-prototyping",
  },
  {
    title: "Tourism & Museum Retail",
    brief:
      "Destination artwork, readable lettering, compact formats and multiple souvenir designs.",
    category: "Fridge Magnet",
    service: "custom-resin-manufacturing",
  },
  {
    title: "Pet Memorial",
    brief:
      "Discreet appearance, capacity, closure details and respectful presentation.",
    category: "Pet Memorial",
    service: "3d-design-prototyping",
  },
  {
    title: "Seasonal & Holiday Retail",
    brief:
      "Collection planning, finish variants, protective packing and fixed selling seasons.",
    category: "Christmas",
    service: "low-moq-resin-manufacturing",
  },
  {
    title: "Private-Label Home & Gifts",
    brief:
      "Coordinated finishes, brand placement, packaging and repeat-order specifications.",
    category: "Home Decor",
    service: "private-label-packaging",
  },
  {
    title: "Religious & Cultural Gifts",
    brief:
      "Buyer-approved symbols, text accuracy and culturally appropriate design references.",
    category: "Religious",
    service: "hand-painting-finishing",
  },
];
