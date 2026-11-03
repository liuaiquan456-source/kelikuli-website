import assert from "node:assert/strict";
import { test } from "node:test";
import { createLoader } from "./load-ts.mjs";

const { readInquiryResponse } = createLoader()("lib/inquiry-response.ts");
const fallback = "We could not confirm receipt of your inquiry.";

test("proxy HTML upload rejection gives recovery instructions instead of a JSON parsing error", async () => {
  await assert.rejects(
    readInquiryResponse(
      new Response("<html><h1>413 Request Entity Too Large</h1></html>", {
        status: 413,
        headers: { "Content-Type": "text/html" },
      }),
      fallback,
    ),
    /too large.*smaller file.*remove the attachment/,
  );
});

test("proxy failures and malformed successful responses never count as receipts", async () => {
  for (const [body, status] of [
    ["<html>Bad Gateway</html>", 502],
    ["<html>Gateway Timeout</html>", 504],
    ["<html>Login</html>", 200],
    ["", 201],
    ["null", 201],
    ["[]", 201],
    ["{", 201],
  ]) {
    await assert.rejects(
      readInquiryResponse(new Response(body, { status }), fallback),
      { message: fallback },
    );
  }
});

test("server validation messages remain useful and accepted JSON responses remain intact", async () => {
  await assert.rejects(
    readInquiryResponse(
      Response.json({ error: "Please enter a valid email address." }, { status: 400 }),
      fallback,
    ),
    { message: "Please enter a valid email address." },
  );
  await assert.rejects(
    readInquiryResponse(Response.json({ error: {} }, { status: 500 }), fallback),
    { message: fallback },
  );
  assert.deepEqual(
    await readInquiryResponse(Response.json({ success: true, id: 9 }, { status: 201 }), fallback),
    { success: true, id: 9 },
  );
});

// Run the actual form handler with browser boundaries replaced by synthetic
// FormData/fetch. No database, live upload or notification email is involved.
function formHarness(t, files = []) {
  const NativeFormData = globalThis.FormData;
  t.mock.method(globalThis, "FormData", class extends NativeFormData {
    constructor(fields) {
      super();
      for (const [key, value] of Object.entries(fields || {})) this.set(key, value);
    }
  });
  let stateIndex = 0, refIndex = 0, leads = 0;
  const states = [files, false, "", null];
  const refs = [];
  const load = createLoader({
    react: {
      useId: () => "test-form",
      useState: () => {
        const index = stateIndex++;
        return [states[index], (value) => {
          states[index] = typeof value === "function" ? value(states[index]) : value;
        }];
      },
      useRef: (initial) => refs[refIndex++] ||= { current: initial },
    },
    "next/navigation": { usePathname: () => "/get-a-quote" },
    "@/lib/quote-analytics": {
      inquiryLandingPage: () => "/products",
      trackSavedInquiry: () => { leads++; },
    },
  });
  const QuoteForm = load("components/QuoteForm.tsx").default;
  const render = () => {
    stateIndex = refIndex = 0;
    return QuoteForm({});
  };
  return {
    states,
    render,
    get leads() { return leads; },
    submit: () => render().props.onSubmit({
      preventDefault() {},
      currentTarget: {
        name: "Synthetic Test",
        email: "test@example.invalid",
        country: "Test",
        message: "Local regression test only",
      },
    }),
  };
}

function findElement(node, predicate) {
  if (!node || typeof node !== "object") return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
}

test("an upload rejection blocks submission; removing that file allows the same form to submit", async (t) => {
  const file = new File(["synthetic design"], "design.pdf");
  const harness = formHarness(t, [file]);
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    return url.endsWith("/upload")
      ? new Response("<html>413 Request Entity Too Large</html>", { status: 413 })
      : Response.json({ success: true, id: 42 }, { status: 201 });
  });
  await harness.submit();
  assert.deepEqual(requests.map((r) => r.url), ["/api/inquiries/upload"]);
  assert.match(harness.states[2], /design.pdf:.*too large/);
  assert.equal(harness.states[1], false);
  assert.equal(harness.states[3], null);
  assert.equal(harness.leads, 0);

  const remove = findElement(harness.render(), (node) => node.props?.["aria-label"] === "Remove design.pdf");
  assert.ok(remove);
  remove.props.onClick();
  await harness.submit();
  assert.equal(requests[1].url, "/api/inquiries");
  const body = JSON.parse(requests[1].options.body);
  assert.equal(body.message, "Local regression test only");
  assert.deepEqual(body.attachments, []);
  assert.equal(harness.states[3], 42);
  assert.equal(harness.leads, 1);
});

test("failed submission can be retried without uploading accepted attachments again", async (t) => {
  const harness = formHarness(t, [new File(["synthetic design"], "design.pdf")]);
  let uploads = 0, submissions = 0;
  const attachment = {
    url: "/api/inquiries/files/00000000-0000-4000-8000-000000000001.pdf",
    name: "design.pdf",
  };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (url.endsWith("/upload")) {
      uploads++;
      return Response.json(attachment);
    }
    submissions++;
    assert.deepEqual(JSON.parse(options.body).attachments, [attachment]);
    return submissions === 1
      ? new Response("<html>Bad Gateway</html>", { status: 502 })
      : Response.json({ success: true, id: 42 }, { status: 201 });
  });
  await harness.submit();
  assert.equal(harness.states[3], null);
  assert.equal(harness.leads, 0);
  assert.match(harness.states[2], /could not confirm receipt/);
  await harness.submit();
  assert.equal(uploads, 1);
  assert.equal(submissions, 2);
  assert.equal(harness.states[3], 42);
  assert.equal(harness.leads, 1);
});

test("invalid receipts and network errors never show success or emit a lead", async (t) => {
  const harness = formHarness(t);
  for (const response of [
    Response.json({ success: true, id: 42 }),
    Response.json({ success: true, id: 0 }, { status: 201 }),
    Response.json({ success: true, id: "42" }, { status: 201 }),
    Response.json({ success: false, id: 42 }, { status: 201 }),
  ]) {
    const fetch = t.mock.method(globalThis, "fetch", async () => response);
    await harness.submit();
    assert.equal(harness.states[3], null);
    assert.equal(harness.leads, 0);
    fetch.mock.restore();
  }
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  await harness.submit();
  assert.match(harness.states[2], /Connection failed/);
  assert.equal(harness.states[1], false);
  assert.equal(harness.states[3], null);
  assert.equal(harness.leads, 0);
});
