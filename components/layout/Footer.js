function Footer() {
  return (
    <div className="footer">
      <p>
        Elliott, Milne, Li, Simpson, and Sporle (2021).{` `}
        <em>
          IDI Search:
          {` `}A web app for searching New Zealand's IDI.
        </em>
        {` `}
        <a href="https://idisearch.terourou.org">
          https://idisearch.terourou.org
        </a>
        .
      </p>
      <p>
        A collaboration by{" "}
        <a href="https://terourou.org?utm_medium=web&utm_source=idisearch&utm_content=footer">
          Te Rourou Tātaritanga
        </a>
        ,{` `}
        <a href="https://www.auckland.ac.nz/en/arts/our-research/research-institutes-centres-groups/compass.html">
          COMPASS
        </a>
        ,{` `}
        <a href="https://wgtn.ac.nz">Victoria University of Auckland</a>,{` `}
        and <a href="https://auckland.ac.nz">The University of Auckland</a>.
        Funded by <a href="https://mbie.govt.nz">MBIE</a>.
      </p>
    </div>
  )
}

export default Footer
