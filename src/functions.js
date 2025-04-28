// Фикс: логи первого шага
function GenerateWord(ctx, event) {
    console.log("[GenerateWord] wordsAsked=", ctx.session.words_asked,
                "correctCount=", ctx.session.correct_count,
                "wrongCount=", ctx.session.wrong_count);

    var words = ["apple", "book", "cat", "dog", "sun"];
    var randomIndex = Math.floor(Math.random() * words.length);
    ctx.session.word_to_translate = words[randomIndex];
    
    // Инициализируем счётчики, если нужно
    ctx.session.correct_count = ctx.session.correct_count || 0;
    ctx.session.wrong_count   = ctx.session.wrong_count   || 0;
    ctx.session.words_asked   = ctx.session.words_asked   || 0;

    console.log("[GenerateWord] new word_to_translate=", ctx.session.word_to_translate);
}

function CheckAnswer(ctx, event, api) {
    // Логируем сам ввод
    console.log("[CheckAnswer] user said:", event.payload.text);

    var userAnswer = event.payload.text.toLowerCase();
    var word       = ctx.session.word_to_translate;
    var url        = "https://dictionary.skyeng.ru/api/public/v1/words/search?search=" 
                        + encodeURIComponent(word);

    api.fetch(url)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        console.log("[CheckAnswer] API data length:", data.length);
        
        if (!data || data.length === 0) {
            ctx.session.correct = false;
            ctx.session.correct_translations = "нет доступных переводов";
        } else {
            // Собираем первые 5 переводов
            var arr      = data[0].meanings.slice(0, 5);
            var meanings = [];
            for (var i = 0; i < arr.length; i++) {
                meanings.push(arr[i].translation.text.toLowerCase());
            }
            ctx.session.correct_translations = meanings.join(", ");
            
            // Проверяем ответ
            ctx.session.correct = meanings.indexOf(userAnswer) !== -1;
        }

        console.log("[CheckAnswer] correct=", ctx.session.correct,
                    "translations=", ctx.session.correct_translations);
        // Счётчики
        if (ctx.session.correct) {
            ctx.session.correct_count++;
        } else {
            ctx.session.wrong_count++;
        }
      })
      .catch(function(err) {
        ctx.session.correct = false;
        ctx.session.correct_translations = "ошибка при проверке перевода";
        console.log("[CheckAnswer] ERROR", err);
      });
}

function CheckFinish(ctx, event) {
    ctx.session.words_asked = (ctx.session.words_asked || 0) + 1;
    console.log("[CheckFinish] wordsAsked=", ctx.session.words_asked,
                "correctCount=", ctx.session.correct_count,
                "wrongCount=", ctx.session.wrong_count);

    if (ctx.session.words_asked >= 5) {
        ctx.session.finished = true;
        console.log("[CheckFinish] finished=true");
        return "/Finish";
    } else {
        // Генерируем новое слово
        GenerateWord(ctx, event);
        return "/NextWord";
    }
}
