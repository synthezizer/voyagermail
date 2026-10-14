const ringNumber = document.getElementById("ring-number");
const messageBox = document.getElementById("message");
const sentStatus = document.getElementById("sent-status");
const feed = document.getElementById("feed");

// note that adding a new form will break this!
const form = document.querySelector("form");

async function loadFeed() {
  const token = localStorage.getItem("anarc_token");
  if (token === null) return;

  const response = await fetch("https://api.anarc.cc/feed", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) return;

  const messages = await response.json();

  feed.replaceChildren();

  if (messages.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "nothing has reached your ring yet.";
    feed.append(empty);
    return;
  }

  for (const msg of messages) {
    const article = document.createElement("article");
    article.className = "incoming-message";

    const label = document.createElement("span");
    label.textContent = "ring " + msg.ring + " · arrived";

    const body = document.createElement("p");
    body.textContent = msg.text;

    article.append(label, body);
    feed.append(article);
  }
}

async function setupRing() {
  let token = localStorage.getItem("anarc_token");
  let ring = localStorage.getItem("anarc_ring");

  if (token === null) {
    const response = await fetch("https://api.anarc.cc/accounts", { method: "POST" });
    const data = await response.json();

    token = data.token;
    ring = data.ring;

    localStorage.setItem("anarc_token", token);
    localStorage.setItem("anarc_ring", ring);
  }

  ringNumber.textContent = ring;
}

async function start() {
  await setupRing();
  loadFeed();
  setInterval(loadFeed, 5000);
}

start();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = messageBox.value.trim();
  if (text === "") return;

  const token = localStorage.getItem("anarc_token");

  const response = await fetch("https://api.anarc.cc/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify({ text }),
  });

  if (response.ok) {
    messageBox.value = "";
    sentStatus.textContent = "the message has been beamed out! nearby rings will get it first";
    loadFeed();
  } else {
    sentStatus.textContent = "looks like the launch failed, care to try again?";
  }
  sentStatus.hidden = false;
});