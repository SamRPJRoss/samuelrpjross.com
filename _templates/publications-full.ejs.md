```{=html}
<div class="publication-legend">
  <span class="legend-stability">DISTURBANCE/STABILITY</span>
  <span class="legend-acoustic">ECOACOUSTICS</span>
  <span class="legend-other">OTHER</span>
</div>

<div class="publication-list">
<%
let currentSection = null;
for (const item of items) {
  if (item.section !== currentSection) {
    currentSection = item.section;
%>
  <h2 class="publication-section-heading"><%= currentSection %></h2>
<%
  }
%>
  <article class="publication pub-<%= item.class %>">
    <div class="publication-main">
      <h3><%= item.title %></h3>
      <p class="publication-authors"><%= item.authors %></p>
      <p class="publication-journal"><%= item.journal %></p>
      <div class="pub-actions">
        <% for (const tag of (item.tags || [])) { %>
          <span class="tag tag-<%= tag.class %>"><%= tag.label %></span>
        <% } %>
        <% for (const link of (item.links || [])) { %>
          <a href="<%- link.url %>"><%= link.label %></a>
        <% } %>
      </div>
    </div>
  </article>
<% } %>
</div>
```