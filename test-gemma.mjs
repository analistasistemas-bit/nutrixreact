async function testGemma() {
    const apiKey = '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';
    const model = 'google/gemma-3-12b-it:free';

    console.log(`🚀 Testando modelo: ${model}`);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    { "role": "user", "content": "Olá, você é o Gemma 3? Responda em Português." }
                ]
            })
        });

        const data = await response.json();
        console.log("✅ Resposta da API:", JSON.stringify(data, null, 2));

        if (data.choices && data.choices[0]) {
            console.log("\n💬 Conteúdo da Resposta:", data.choices[0].message.content);
        } else {
            console.error("❌ Resposta inesperada da API.");
        }
    } catch (error) {
        console.error("❌ Erro ao chamar a API:", error);
    }
}

testGemma();
