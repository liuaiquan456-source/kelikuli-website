import type { ContentSection } from "./manufacturing";

export type BuyingGuide = {
  slug: string;
  title: string;
  summary: string;
  service: string;
  project: string;
  takeaway: string;
  sections: ContentSection[];
  checklist: string[];
};

// Editorial procurement guidance. Numerical commercial terms require a project quotation.
export const buyingGuides: BuyingGuide[] = [
  {
    slug: "custom-resin-figurine-cost",
    title: "How Much Does a Custom Resin Figurine Cost?",
    summary:
      "Separate development, tooling, production and packing before comparing resin figurine quotations.",
    service: "custom-resin-manufacturing",
    project: "tourism-souvenir-fridge-magnet",
    takeaway:
      "There is no reliable unit price without a size, quantity split, finish and packing specification. Ask for both first-order cost and repeat-order cost.",
    sections: [
      {
        title: "Start with the complete cost structure",
        paragraphs: [
          "A custom project can include artwork development, a master or prototype, production molds, finished units, packaging, inspection and freight. Some quotations combine these items. Ask which costs are one-time, which recur, and which have been excluded. A low unit price is difficult to compare if tooling and packing are still undefined.",
          "For a planning comparison, add development and tooling to the quantity multiplied by the finished-unit price, then add packing, testing and logistics as applicable. Divide that total by the order quantity only when you need an all-in first-order comparison. Taxes and import charges need a separate destination-specific check.",
        ],
      },
      {
        title: "Size is only one cost driver",
        paragraphs: [
          "A simple large shape can be easier to finish than a small figure with thin accessories and many paint boundaries. Deep recesses, separate parts, visible seams and fine lettering can add work. Specify whether the underside needs decoration and whether accessories arrive assembled.",
          "In a destination magnet brief, for example, raised landmark details, fine place names and multiple color areas should be visible in the artwork. The existing magnet image linked below is a design reference; it is not a published price benchmark.",
        ],
      },
      {
        title: "Compare like-for-like alternatives",
        paragraphs: [
          "Request quantity alternatives using exactly the same specification. Then request a separate cost-saving option, such as fewer painted details or a standard box. This makes it clear whether a lower quote comes from quantity, a simplified finish or a changed product.",
          "Tooling reuse can change reorder economics, but do not assume molds or samples are supplied indefinitely at no cost. Confirm ownership, storage, replacement and revision terms in the quotation.",
        ],
      },
      {
        title: "What to send KELIKULI",
        paragraphs: [
          "Send views of the complete object, dimensions in millimeters, quantities by design and colorway, the target market and your packing preference. If you have a target budget, state whether it covers only the finished item or the full first order. Final quotation follows artwork review; no universal price range is asserted here.",
        ],
        checklist: [
          "Artwork revision and intended use",
          "Quantity split and target budget scope",
          "Finish reference and packing specification",
          "Delivery destination and requested shipping terms",
        ],
      },
    ],
    checklist: [
      "Development and sample charges are identified",
      "Tooling ownership and reorder terms are written down",
      "Unit pricing uses the same design, finish and packing",
      "Freight, testing and other exclusions are explicit",
    ],
  },
  {
    slug: "moq-custom-resin-products",
    title: "What Is the MOQ for Custom Resin Products?",
    summary:
      "Understand why minimum quantities differ by sculpt, colorway, packaging and the scope of a first order.",
    service: "low-moq-resin-manufacturing",
    project: "seasonal-decor-collection",
    takeaway:
      "MOQ is a condition of a particular specification. Share quantities per sculpt and colorway; a collection total alone is insufficient.",
    sections: [
      {
        title: "Separate the different minimums",
        paragraphs: [
          "A project may have a production minimum for each sculpt, a paint setup minimum for a colorway and a packaging minimum from a print supplier. These are related but are not necessarily the same number. Ask which minimum limits your proposed launch.",
          "For example, two hundred pieces split across four new sculpts are four separate development tasks, not one two-hundred-piece design. This is an illustrative quantity split, not a KELIKULI minimum or a quotation.",
        ],
      },
      {
        title: "Why a short run still has setup work",
        paragraphs: [
          "Artwork review, master preparation, molds and sample approval are needed even when the finished quantity is small. Those costs are spread across fewer units. Simplifying the design can sometimes make a small order more practical, but removing approval steps introduces avoidable uncertainty.",
          "Use the same specification to compare an opening run and a larger alternative. Check total cash commitment and likely stock requirements, not just the lowest unit price.",
        ],
      },
      {
        title: "Practical ways to scope an opening collection",
        paragraphs: [
          "Consider launching with one body shape, a restrained color palette and protective plain packaging. A shared shape with different decoration may avoid developing several unrelated masters, although each decoration still needs review.",
          "For seasonal products, reducing the number of variants can also reduce the number of samples awaiting approval. Keep a written list of which features are essential and which can be changed. Ask the factory to quote the changes separately rather than quietly simplifying the approved artwork.",
        ],
        checklist: [
          "One sculpt versus several sculpts",
          "Shared color palette versus separate paint setups",
          "Plain protective box versus custom printed packaging",
          "Opening quantity versus realistic reorder quantity",
        ],
      },
      {
        title: "How to request a low-MOQ review",
        paragraphs: [
          "State your target quantity honestly and provide the artwork. Include the maximum acceptable first-order spend, planned sales channel and any non-negotiable delivery date. KELIKULI will need to assess feasibility before confirming a minimum. A small quantity request does not imply automatic acceptance or a shorter production lead time.",
        ],
      },
    ],
    checklist: [
      "Quantities are split by sculpt and colorway",
      "Packaging minimums are confirmed separately",
      "Sample and tooling charges are included in the budget",
      "Reorder assumptions are documented",
    ],
  },
  {
    slug: "custom-resin-manufacturing-process",
    title: "Custom Resin Figurine Manufacturing Process",
    summary:
      "Follow the approval chain from buyer brief to packing, and identify the decisions that keep a resin project moving.",
    service: "resin-quality-control",
    project: "tourism-souvenir-fridge-magnet",
    takeaway:
      "The useful manufacturing sequence is a series of approvals. Define the evidence needed at each stage before the next stage starts.",
    sections: [
      {
        title: "Brief and design review",
        paragraphs: [
          "Begin with the product’s intended use, all visible views, dimensions, target quantity and destination. Resolve missing surfaces and unclear details before modeling. Confirm rights to character artwork and logos with the relevant rights holder.",
          "Design review should address thin parts, deep recesses, stability and assembly. A suggested manufacturing change needs buyer approval if it alters appearance or function. Keep one current artwork revision so different teams do not work from different files.",
        ],
      },
      {
        title: "Model, master and prototype",
        paragraphs: [
          "Review the model for proportions and the physical sample for size and handling. Decide whether the first sample is intended to prove shape, paint appearance, fit or all three. A screen rendering cannot confirm weight, balance or a working closure.",
          "Record comments against numbered views. Once the master is approved, tooling work can be scoped. Later changes to the sculpt may affect molds, paint masks and packaging, so they should trigger a schedule and cost review.",
        ],
      },
      {
        title: "Molding, casting and surface preparation",
        paragraphs: [
          "The approved shape informs mold separation and the number of parts. Trial castings allow the team to examine seams, trapped air, distortion and assembly. Trimming and surface preparation happen before the final finish is judged.",
          "Specify which dimensional or functional points matter most. On a magnet, the back attachment and overall weight matter alongside the relief detail. On a memorial container, the closure and capacity require their own review rather than appearance approval alone.",
        ],
      },
      {
        title: "Paint approval, packing and release",
        paragraphs: [
          "Approve the paint map, color references, surface effect and acceptable variation. During production, compare the work with that approved reference. A hand-painted surface needs clear appearance limits rather than an expectation of identical brush marks.",
          "Check the product in its actual inner support and box. Agree inspection timing, the treatment of rejects and who authorizes shipment. Independent testing, when required for the intended product and market, is a separate workstream; an attractive sample does not establish compliance.",
        ],
        checklist: [
          "Approved sculpt and assembly",
          "Approved painted reference",
          "Agreed inspection and defect criteria",
          "Approved packing and shipment release",
        ],
      },
    ],
    checklist: [
      "Each stage has an identified approver",
      "The current artwork and sample revision are recorded",
      "Functional and appearance approvals are distinct",
      "Packing and any testing are included before shipment",
    ],
  },
  {
    slug: "resin-prototype-mold-cost",
    title: "Resin Prototype and Mold Cost Explained",
    summary:
      "Understand what a development charge covers and how to clarify tooling terms before placing an order.",
    service: "mold-making-resin-casting",
    project: "pet-memorial-urn-collection",
    takeaway:
      "A prototype and a production mold solve different problems. Request separate scope, approval criteria and ownership terms for each.",
    sections: [
      {
        title: "What the prototype is for",
        paragraphs: [
          "A prototype makes a proposed design reviewable. It may demonstrate proportions, paint placement, fit or a combination of these. Its material and manufacturing method may differ from the production product. Confirm that difference before using the sample to make performance assumptions.",
          "The development quotation should state which files or physical samples are supplied, how many review rounds are included, and what counts as a new design rather than a correction. A new pose, changed size or added feature can affect work that was already approved.",
        ],
      },
      {
        title: "What tooling work can include",
        paragraphs: [
          "Tooling may include master preparation, mold construction, trial castings and adjustments. A multi-part item has different requirements from a simple single-piece shape. The planned quantity and production schedule can also influence the number of molds needed.",
          "Ask the supplier to describe the included scope rather than relying on one unexplained mold-fee line. Clarify whether painting or packaging fixtures have separate charges. Do not assume a sample charge includes production tooling.",
        ],
      },
      {
        title: "Ownership and reuse need written terms",
        paragraphs: [
          "Payment of a tooling charge does not by itself describe where the tooling is stored, who may use it, or what happens when it wears out. Agree ownership, storage duration, maintenance, replacement and access terms as part of the order.",
          "For reorders, retain the approved artwork revision and sample record. A change in overall size may require new tooling; a color-only change may still require a new painted sample. Ask for a change assessment before authorizing revised production.",
        ],
        checklist: [
          "Who owns the master and digital files?",
          "Who owns and stores production molds?",
          "What corrections are included?",
          "What triggers replacement or new tooling charges?",
        ],
      },
      {
        title: "Budget without an invented price",
        paragraphs: [
          "Send dimensions, views, part count, finish expectations and quantity to request a development quotation. If the design is still exploratory, request a staged scope with an approval point before tooling. KELIKULI confirms charges after reviewing the actual artwork; this guide does not assign an unsupported standard mold price.",
        ],
      },
    ],
    checklist: [
      "Prototype purpose and method are clear",
      "Revision scope is documented",
      "Tooling charges and trial castings are separated",
      "Ownership, storage and reorder terms are agreed",
    ],
  },
  {
    slug: "custom-resin-production-lead-time",
    title: "How Long Does Custom Resin Production Take?",
    summary:
      "Build a schedule that includes artwork decisions, sample revisions, tooling, production, packing and delivery.",
    service: "private-label-packaging",
    project: "seasonal-decor-collection",
    takeaway:
      "Production lead time is only part of the delivery schedule. Ask what starts the clock, what stops it and whether freight is included.",
    sections: [
      {
        title: "Work backward from the required arrival date",
        paragraphs: [
          "A retailer’s shelf date is different from the factory dispatch date. Separate arrival, customs and transport, shipment release, packing, production and development. Share your required arrival date and destination at the start so the proposal can be assessed against the full route.",
          "Do not infer a guaranteed delivery date from a general website statement. The schedule needs the current design, quantity, finish, packing specification and available capacity. Any transit estimate should identify its shipping method and assumptions.",
        ],
      },
      {
        title: "Artwork and sampling depend on decisions",
        paragraphs: [
          "A complete brief can reduce unanswered questions before modeling. Missing views, unclear dimensions or several people giving conflicting comments can extend development. Nominate one buyer-side approver and consolidate comments by revision.",
          "A shape approval does not necessarily approve paint or packaging. Ask which stages can run together and which must wait. Printing a box before product dimensions are fixed can create rework instead of saving time.",
        ],
      },
      {
        title: "Tooling and production have dependencies",
        paragraphs: [
          "Molds follow the approved shape. Painting follows usable castings and an approved finish. Packing requires finished products and the correct boxes and inserts. Complex paint work, assembly, inspection and corrective action all belong in the plan.",
          "A smaller order still needs these steps. Rush requests should state the tradeoffs being considered, such as a simpler finish or fewer variants, and require an updated quotation and approval. Do not remove testing or inspection from the plan just to make a date appear achievable.",
        ],
      },
      {
        title: "Ask for milestones, not one unexplained number",
        paragraphs: [
          "Request proposed dates for artwork approval, sample submission, sample approval, tooling completion, production completion and shipment readiness. Add buyer decision deadlines and a process for reporting changes. KELIKULI confirms project-specific timing after artwork and order review.",
        ],
        checklist: [
          "What event starts each lead time?",
          "Which approvals are still outstanding?",
          "Are weekends, holidays and shipping included?",
          "How will a design change affect the schedule?",
        ],
      },
    ],
    checklist: [
      "Arrival date and dispatch date are distinct",
      "Buyer approval deadlines are included",
      "Packaging and inspection have allocated time",
      "The schedule has been confirmed against the final specification",
    ],
  },
  {
    slug: "prepare-artwork-custom-resin",
    title: "How to Prepare Artwork for a Custom Resin Project",
    summary:
      "Prepare a useful design package with views, dimensions, colors, functional details and a clear approval owner.",
    service: "3d-design-prototyping",
    project: "pet-memorial-urn-collection",
    takeaway:
      "A useful design package explains what the object must look like, how large it is and which details must work. A polished render alone is not enough.",
    sections: [
      {
        title: "Show the whole object",
        paragraphs: [
          "Supply front, back and side views, plus the top or underside when they contain important features. If the design starts with one illustration, mark which areas still need interpretation. Include the base, accessories, logo and attachment points rather than leaving them to be guessed.",
          "Name files with one project identifier and a revision number. Include a short change log when sending an update. Confirm that you have permission to manufacture the artwork, character and branding before development proceeds.",
        ],
      },
      {
        title: "State dimensions and functional requirements",
        paragraphs: [
          "Use millimeters for height, width and depth. Mark critical fitting dimensions separately from overall size. Explain whether the object must stand unaided, hang, hold a magnet, fit an insert or close with a lid.",
          "For a memorial container, capacity and closure requirements should be stated independently from the external silhouette. For a souvenir magnet, identify the attachment and expected display surface. These details affect the development questions even when two products look similar in a picture.",
        ],
      },
      {
        title: "Build a color and finish map",
        paragraphs: [
          "Mark color boundaries on the views. Use a physical reference or a recognized color specification where exact matching matters, and state whether the finish is matte, gloss, metallic, translucent or textured. Screens and photographs can make the same color look different.",
          "Identify the small features that carry the character of the design, such as eyes or lettering. Be open to a sample review if the detail becomes too small at the intended scale. Confirm acceptable variation using an approved painted reference.",
        ],
      },
      {
        title: "Send commercial context with the files",
        paragraphs: [
          "Include quantities per design, destination, intended use, target timing and packaging preference. State whether you need modeling from sketches, a shape prototype, a painted sample or a production quotation. That prevents a concept request from being mistaken for a production-ready specification.",
          "Use the quote form to attach reference images, PDFs or design files. If a file is too large, describe it in the message and arrange a transfer with the team. Keep one person responsible for consolidating revisions and approving the next stage.",
        ],
        checklist: [
          "Multi-view artwork and revision number",
          "Dimensions, fit points and intended use",
          "Color / finish map and logo files",
          "Quantity split, market, timing and packing",
        ],
      },
    ],
    checklist: [
      "Missing views are marked",
      "Dimensions have explicit units",
      "Artwork rights and file revision are clear",
      "One buyer-side approver owns consolidated feedback",
    ],
  },
];
