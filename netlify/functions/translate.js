exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let text, srcLang;
  try { const b = JSON.parse(event.body); text = b.text; srcLang = b.srcLang; }
  catch (e) { return { statusCode: 400, body: 'Bad Request' }; }
  if (!text || !srcLang || srcLang === 'it') return { statusCode: 400, body: 'No translation needed' };
  const names = { en: 'inglese', fr: 'francese', ru: 'russo' };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: `Traduci in italiano dal ${names[srcLang] || srcLang}. Rispondi SOLO con la traduzione:\n"${text}"` }]
      })
    });
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ result: data?.content?.[0]?.text?.trim() || null }) };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: e.message }) }; }
};
