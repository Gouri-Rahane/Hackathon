// -----------------------------------------------
// HTML helpers: page wrapper + table builder
// -----------------------------------------------

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} | MusicDB</title>
  <link rel="stylesheet" href="/style.css"/>
</head>
<body>
  <nav class="navbar">
    <div class="logo"><span>Music</span>DB</div>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/songs">All Songs</a>
      <a href="/count">Count</a>
      <a href="/add">Add Song</a>
    </div>
  </nav>
  <div class="container">${body}</div>
  <div class="footer">Music Database App &mdash; Express + MongoDB</div>
</body>
</html>`;
}

function buildTable(songs, showActions = true) {
  if (!songs.length) {
    return `<div class="empty"><p>No songs found.</p></div>`;
  }

  const dash = `<span style="color:#555">—</span>`;
  const rows = songs.map(s => `
    <tr>
      <td><strong>${s.Songname}</strong></td>
      <td>${s.Film}</td>
      <td>${s.Music_director}</td>
      <td>${s.Singer}</td>
      <td>${s.Actor   || dash}</td>
      <td>${s.Actress || dash}</td>
      ${showActions ? `<td><div class="action-btns">
        <a href="/update/${encodeURIComponent(s.Songname)}" class="btn-edit">Edit</a>
        <a href="/delete/${encodeURIComponent(s.Songname)}" class="btn-delete"
           onclick="return confirm('Delete ${s.Songname}?')">Delete</a>
      </div></td>` : ""}
    </tr>`).join("");

  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>Song Name</th><th>Film</th><th>Music Director</th>
      <th>Singer</th><th>Actor</th><th>Actress</th>
      ${showActions ? "<th>Actions</th>" : ""}
    </tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

module.exports = { page, buildTable };
