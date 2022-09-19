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
          IDI Search is a web app that uses data from IDI Data Dictionaries
          shared to us by Stats NZ. The data is stored in a database, which can
          then be searched using the web app. The goal of this app is to allow
          researchers to discover what data is available to use in research
          projects.
        </p>

        <p>
          IDI Search has been developed by{" "}
          <a href="https://terourou.org?utm_medium=web&utm_source=idisearch&utm_content=about">
            Te Rourou Tātaritanga
          </a>
          , funded by MBIE Endevaour Grant (ref 62506 ENDRP).
        </p>
      </section>

      <section>
        <h2>IDI: Integrated Data Infrastructure</h2>

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

      <section>
        <h2>Feedback and Collaboration</h2>

        <p>
          This app is still under development, and as such we are looking for
          feedback from (potential) users. This may be letting us know what
          works and what doesn't, or contributing ideas to make the app more
          useful.
        </p>

        <p>
          We are also open to collboration, so if you or your team would like to
          contribute to IDI Search in some way, please get in touch with us at
          {` `}
          <a href="mailto:terourounz@gmail.com?subject=IDI Search App">
            terourounz@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Planned Features</h2>

        <p>
          The following additional features are planned for future development:
        </p>

        <ul>
          <li>
            display links to other names of variables or datasets, so
            researchers can update code for new refreshes
          </li>
          <li>allow for multiple search terms (AND, OR, etc.)</li>
          <li className="text-green-600 italic line-through">
            include variables with missing data dictionaries: these variables
            will not have descriptions and other such information, but will
            otherwise show up where expected (but with limited search capacity)
          </li>
          <li>continue adding more data dictionaries</li>
          <li>
            add facilities for users to register and provide comments on
            agencies/collections/datasets/variables
          </li>
        </ul>
      </section>
    </div>
  )
}

export default about
