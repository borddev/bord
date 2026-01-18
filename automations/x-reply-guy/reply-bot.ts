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
  await page.waitForTimeout(3000);

  // Take screenshot before
  await page.screenshot({ path: "/tmp/before-reply.png" });

  // Find and click the reply input area at the bottom of the tweet
  try {
    // Click on the reply text area
    const replyArea = await page.waitForSelector("div[data-testid=\"tweetTextarea_0\"]", { timeout: 5000 });
    await replyArea.click();
    await page.waitForTimeout(500);

    // Type the reply
    await page.keyboard.type(reply, { delay: 50 });
    await page.waitForTimeout(1000);

    // Take screenshot after typing
    await page.screenshot({ path: "/tmp/typed-reply.png" });

    // Click the Reply/Post button
    const postButton = await page.waitForSelector("button[data-testid=\"tweetButtonInline\"]", { timeout: 5000 });
    await postButton.click();

    console.log("  Posted!");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "/tmp/after-reply.png" });
    return true;
  } catch (err: any) {
    console.log("  Error:", err.message);
    await page.screenshot({ path: "/tmp/reply-error.png" });
    return false;
  }
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
