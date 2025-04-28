function GenerateWord(ctx, event) {
    var words = ["apple", "book", "cat", "dog", "sun"];
    var randomIndex = Math.floor(Math.random() * words.length);
    ctx.session.word_to_translate = words[randomIndex];
    ctx.session.correct_count = ctx.session.correct_count || 0;
    ctx.session.wrong_count = ctx.session.wrong_count || 0;
    ctx.session.words_asked = ctx.session.words_asked || 0;
}

async function CheckAnswer(ctx, event, api) {
    var userAnswer = event.payload.text.toLowerCase();
    var word = ctx.session.word_to_translate;
    
    var response = await api.fetch(`https://dictionary.skyeng.ru/api/public/v1/words/search?search=${word}`);
    var data = await response.json();

    if (!data.length) {
        ctx.session.correct = false;
        ctx.session.correct_translations = "нет доступных переводов";
        return;
    }

    var meanings = data[0].meanings.slice(0, 5).map(m => m.translation.text.toLowerCase());
    ctx.session.correct_translations = meanings.join(", ");
    ctx.session.correct = meanings.includes(userAnswer);

    if (ctx.session.correct) {
        ctx.session.correct_count++;
    } else {
        ctx.session.wrong_count++;
    }
}

function CheckFinish(ctx, event) {
    ctx.session.words_asked++;
    if (ctx.session.words_asked >= 5) {
        return "/Finish";
    } else {
        GenerateWord(ctx, event);
        return "/NextWord";
    }
}
