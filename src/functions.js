function GenerateWord(ctx, event) {
    var words = ["apple", "book", "cat", "dog", "sun"];
    ctx.session.word_to_translate = words[Math.floor(Math.random() * words.length)];
    ctx.session.correct_count = ctx.session.correct_count || 0;
    ctx.session.wrong_count   = ctx.session.wrong_count   || 0;
    ctx.session.words_asked   = ctx.session.words_asked   || 0;
    console.log("[GenerateWord] word=", ctx.session.word_to_translate);
}

function CheckAnswer(ctx, event, api) {
    var userAnswer = event.payload.text.toLowerCase();
    var word       = ctx.session.word_to_translate;
    var url        = "https://dictionary.skyeng.ru/api/public/v1/words/search?search=" 
                       + encodeURIComponent(word);

    console.log("[CheckAnswer] userAnswer=", userAnswer);

    // **ВООЗВРАЩАЕМ** промис, чтобы движок подождал результата
    return api.fetch(url)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        console.log("[CheckAnswer] API returned", data.length, "entries");

        if (!data || !data.length) {
            ctx.session.correct = false;
            ctx.session.correct_translations = "нет доступных переводов";
        } else {
            // собираем первые 5 переводов
            var meanings = data[0].meanings.slice(0,5)
              .map(function(m) { return m.translation.text.toLowerCase(); });
            ctx.session.correct_translations = meanings.join(", ");
            console.log("[CheckAnswer] meanings=", meanings);

            ctx.session.correct = meanings.indexOf(userAnswer) !== -1;
        }

        console.log("[CheckAnswer] correct=", ctx.session.correct);

        if (ctx.session.correct) {
            ctx.session.correct_count++;
        } else {
            ctx.session.wrong_count++;
        }
      })
      .catch(function(err) {
        console.log("[CheckAnswer] ERROR", err);
        ctx.session.correct = false;
        ctx.session.correct_translations = "ошибка при проверке перевода";
      });
}

function CheckFinish(ctx, event) {
    ctx.session.words_asked = (ctx.session.words_asked || 0) + 1;
    console.log("[CheckFinish] wordsAsked=", ctx.session.words_asked);

    if (ctx.session.words_asked >= 5) {
        ctx.session.finished = true;
        return "/Finish";
    } else {
        GenerateWord(ctx, event);
        return "/NextWord";
    }
}
