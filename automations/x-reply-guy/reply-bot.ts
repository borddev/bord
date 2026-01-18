import { chromium, Page } from "playwright";
import { findAdsPowerDebugPorts } from "../../lib/browser";

const TARGETS = ["elonmusk", "POTUS", "realDonaldTrump"];

async function findTweetsToReply(page: Page) {
  const tweets: any[] = [];

  for (const target of TARGETS) {
    console.log(`\nChecking @${target}...`);
    await page.goto(`https://x.com/${target}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const tweetElements = await page.$$("article[data-testid=\"tweet\"]");

    for (let i = 0; i < Math.min(3, tweetElements.length); i++) {
      try {
        const text = await tweetElements[i].$eval(
          "div[data-testid=\"tweetText\"]",
          (el) => el.textContent
        );
        const link = await tweetElements[i].$eval(
          "a[href*=\"/status/\"]",
          (el) => el.getAttribute("href")
        );

        if (text && link) {
          tweets.push({
            author: target,
            text: text.slice(0, 200),
            link: `https://x.com${link}`,
          });
          console.log(`  Found: "${text.slice(0, 50)}..."`);
        }
      } catch {}
    }
  }

  return tweets;
}

function generateReply(tweet: any): string {
  const templates = [
    "what would @grok say about this",
    "asking @grok to analyze this real quick",
    "@grok explain this to me like im 5",
    "this is actually based ngl",
    "ur not wrong about this one",
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

async function postReply(page: Page, tweetUrl: string, reply: string) {
  console.log(`\nReplying to: ${tweetUrl}`);
  console.log(`Reply: "${reply}"`);

  await page.goto(tweetUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Click reply button
  const replyButton = await page.$("div[data-testid=\"reply\"]");
  if (replyButton) {
    await replyButton.click();
    await page.waitForTimeout(1000);

    // Type reply
    const replyBox = await page.$("div[data-testid=\"tweetTextarea_0\"]");
    if (replyBox) {
      await replyBox.fill(reply);
      await page.waitForTimeout(500);

      // POST THE REPLY
      await page.click("button[data-testid=\"tweetButton\"]");
      console.log("  Posted!");
      return true;
    }
  }
  return false;
}

async function main() {
  console.log("=== X Reply Bot ===\n");

  const ports = findAdsPowerDebugPorts();
  if (ports.length === 0) {
    console.log("No AdsPower browser found. Open a profile first.");
    return;
  }

  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${ports[0]}`);
  const context = browser.contexts()[0];
  const page = await context.newPage();

  console.log("Connected to AdsPower browser as @donaldchadmusk");

  // Find tweets
  const tweets = await findTweetsToReply(page);
  console.log(`\nFound ${tweets.length} tweets to reply to`);

  // Post replies
  if (tweets.length > 0) {
    const tweet = tweets[0];
    const reply = generateReply(tweet);
    await postReply(page, tweet.link, reply);
  }

  console.log("\n=== Done ===");
  await browser.close();
}

main().catch(console.error);
