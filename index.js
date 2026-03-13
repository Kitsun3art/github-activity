async function fetchGitHubActivity(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/events?per_page=10`,
    {
      headers: {
        "User-Agent": "github-activity-cli/1.0",
      },
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Username not found. Please check the username.");

    } else if (response.status === 403 || response.status === 429) {
      throw new Error("Rate limited. Wait or use a GitHub token.");

    } else {
      throw new Error(`Error fetching data ${response.status}`);
    }
  }
  return response.json();
}

function displayActivity(events) {
  if (events.length === 0) {
    console.log("No recent public activity found");
    return;
  }

  console.log(`\nRecent activity for ${username} (${events.length} events):\n`);

  events.forEach((event, index) => {
    const time = new Date(event.created_at).toLocaleString();
    let action;
    switch (event.type) {
      case "PushEvent":
        const commitCount = event.payload.commits.length;
        action = `Pushed ${commitCount} commit(s) to ${event.repo.name}`;
        break;
      case "IssuesEvent":
        action = `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} an issue in ${event.repo.name}`;
        break;
      case "WatchEvent":
        action = `Starred ${event.repo.name}`;
        break;
      case "ForkEvent":
        action = `Forked ${event.repo.name}`;
        break;
      case "CreateEvent":
        action = `Created ${event.payload.ref_type} in ${event.repo.name}`;
        break;
      default:
        action = `${event.type.replace("Event", "")} in ${event.repo.name}`;
    }
    console.log(`${index + 1}. ${action} (${time})`);
  });
}

const username = process.argv[2];


if (!username) {
  console.error("Usage: node index.js <github-username>");
  console.error("Example: node index.js octocat");
  process.exit(1);
}

fetchGitHubActivity(username)
  .then((events) => displayActivity(events))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
