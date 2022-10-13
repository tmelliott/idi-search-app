import Head from "next/head"

function about() {
  return (
    <div className="about prose prose-sm prose-blue mx-auto">
      <Head>
        <title>About | IDI Search</title>
      </Head>

      <section>
        <h2>About IDI Search</h2>

        <p>
          IDI Search is a web app that allows researchers to search for
          variables that are available in the IDI and, in some cases, metadata
          about these variables. The app uses data from IDI variables and Data
          Dictionaries shared with us by Stats NZ. The data are stored in a
          database which can then be searched using the web app.
        </p>

        <p>
          IDI Search has been developed by{" "}
          <a href="https://terourou.org?utm_medium=web&utm_source=idisearch&utm_content=about">
            Te Rourou Tātaritanga
          </a>
          , a research group funded by an MBIE Endevaour Grant (ref 62506
          ENDRP).
        </p>

        <h4>IDI: Integrated Data Infrastructure</h4>

        <p>
          The IDI is New Zealand's Integrated Data Infrastructure, provided by
          Statistics NZ. It houses data from government and non-government
          sources. More information can be obtained from{" "}
          <a
            href="https://www.stats.govt.nz/integrated-data/integrated-data-infrastructure/
"
          >
            https://www.stats.govt.nz/integrated-data/integrated-data-infrastructure/
          </a>
          .
        </p>
      </section>

      <hr />

      <section>
        <h3>The Update Process</h3>

        <p>
          Updates to IDI Search follow the triannual cycle of the IDI refresh
          with collaboration between Te Rourou Tātaritanga and Statistics NZ.
        </p>

        <p>
          Before each new IDI refresh goes live, Stats NZ extracts the variable
          listings from the latest refresh and provides this information to the
          app developers. This allows researchers to build an accurate picture
          of what data is currently available in the IDI.
        </p>

        <p>
          Stats NZ also provides the app developers with the latest IDI data
          dictionaries from the Data Lab User Wiki that have been updated in
          response to changes and additions to the latest refresh data and
          researcher queries. This information is extracted and added to the
          app.
        </p>
      </section>

      <hr />

      <section>
        <h3>Our Vision</h3>

        <p>
          We envision a future where Data Lab researchers can readily access
          accurate and reliable information about the data contained within the
          IDI through a user-friendly interface that is not limited to current
          IDI researchers.
        </p>

        <p>
          The IDI Search app uses a data model that gives rise to the
          opportunity for automation of data dictionaries and codes and
          classifications updates. In collaboration with Stats NZ, this will
          ensure the quality of IDI metadata is improved over time. It will also
          provide the opportunity to automate data dictionary, code, and
          classification updates.
        </p>

        <p>
          We encourage researchers to utilise this app and share it with other
          Data Lab researchers: experienced, new, or potential future
          researchers! Through your use, we can gain insights that will help
          further improve the app.
        </p>

        <p>
          Please get in touch with{" "}
          <a href="mailto:terourounz@gmail.com?subject=IDI Search App">
            terourounz@gmail.com
          </a>{" "}
          for your app-related feedback or with{" "}
          <a href="mailto:access2microdata@stats.govt.nz">
            access2microdata@stats.govt.nz
          </a>{" "}
          for questions or inquiries about the metadata included in the app.
        </p>
      </section>

      <section>
        <h3>Privacy Statement</h3>

        <p>
          We collect analytics data to track page views and search terms. This
          information is stored internally and used solely for tracking demand
          and collecting information to help us improve the app.
        </p>
      </section>
    </div>
  )
}

export default about
