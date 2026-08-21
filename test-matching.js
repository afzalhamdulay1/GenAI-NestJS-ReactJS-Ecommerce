const p = { name: "Alpine Ridge Men's Insulated Technical Puffer Jacket - Olive Green", category: 'Attire' };
const replyText = "Yes, we do! We have the gorgeous Alpine Ridge Men's Insulated Technical Puffer Jacket available in Red! ❤️";
const userMessage = "do you have a jacket which is red";

const replyLower = replyText.toLowerCase();
const userLower = userMessage.toLowerCase();
const nameLower = p.name.toLowerCase();
const catLower = (p.category || '').toLowerCase();

if (replyLower.includes(nameLower)) console.log('match1');
if (catLower && userLower.includes(catLower)) console.log('match2');

const nameWords = nameLower.split(' ').filter(w => w.length > 2);
if (nameWords.length >= 3) {
  const shortName = nameWords.slice(0, 3).join(' ');
  console.log('shortName:', shortName);
  if (replyLower.includes(shortName)) console.log('match3');
}
