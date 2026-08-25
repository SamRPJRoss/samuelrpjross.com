```{=html}
<div class="recent-publication-list">
<% for (const item of items) { %>
  <article class="recent-publication recent-pub-<%= item.class %>">
    <div class="recent-pub-year"><%= item.year %></div>
    <div class="recent-pub-main">
      <h3><%= item.title %></h3>
      <p class="recent-pub-journal"><%= item.journal %></p>
      <div class="recent-pub-tags">
        <% for (const tag of (item.tags || [])) { %>
          <span class="tag tag-<%= tag.class %>"><%= tag.label %></span>
        <% } %>
      </div>
    </div>
  </article>
<% } %>
</div>
```