// Static, crawlable on-page content. This renders in the default (pre-upload)
// state, so search engines and the build-time prerender capture real text
// describing what the tool does and how to use it. The link back to pararang.com
// lives in the footer, so there is no call-to-action card here.
const SeoContent = () => {
  return (
    <section className="space-y-8 max-w px-4 sm:px-6 lg:px-8 text-left">
      <div className="space-y-3">
        <h2 className="text-h2 font-bold">
          A 24-hour clock chart for your daily schedule
        </h2>
        <p className="text-muted-foreground">
          Clock Chart turns a list of activities into a round 24-hour chart so
          you can see how a full day is spent at a glance. Daytime hours sit on
          the inner ring and nighttime hours on the outer ring, which keeps a
          sleep block or a late shift readable instead of wrapping awkwardly.
          Bring your own data as a CSV or Excel file and the chart is drawn in
          the browser, with nothing uploaded to a server.
        </p>
        <p className="text-muted-foreground">
          It works well for time blocking, planning a daily routine, comparing
          how two days differ, or just checking where the hours actually go.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-h2 font-bold">How to make your schedule chart</h2>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          <li>
            Prepare a CSV or Excel file with three columns:{" "}
            <code>activity</code> (or
            <code> label</code>), <code>start</code>, and <code>end</code>. Use
            24-hour times such as <code>08:30</code> or <code>22:00</code>.
          </li>
          <li>Upload the file using the button above.</li>
          <li>
            Read the chart. Each activity becomes a labelled arc on the clock.
          </li>
          <li>Download the result as a PNG to share or save.</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h2 className="text-h2 font-bold">Frequently asked questions</h2>
        <div className="space-y-2">
          <h3 className="text-h3 font-semibold">
            What file formats can I upload?
          </h3>
          <p className="text-muted-foreground">
            CSV and Excel (.xlsx) files. The columns are matched by name, so the
            order does not matter and headers are case-insensitive.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-h3 font-semibold">
            How should I format the times?
          </h3>
          <p className="text-muted-foreground">
            Use 24-hour times like <code>14:30</code>. An activity that runs
            past midnight, such as a sleep block from <code>23:00</code> to{" "}
            <code>06:00</code>, is handled and wraps around the clock correctly.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-h3 font-semibold">
            Is my data uploaded anywhere?
          </h3>
          <p className="text-muted-foreground">
            No. The file is read and the chart is drawn entirely in your
            browser. Nothing is sent to a server.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-h3 font-semibold">Can I save the chart?</h3>
          <p className="text-muted-foreground">
            Yes. Once a chart is drawn you can download it as a PNG image.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SeoContent;
