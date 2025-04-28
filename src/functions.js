function GenerateWord(ctx, event) {
    var words = ["apple", "book", "cat", "dog", "sun"];
    var randomIndex = Math.floor(Math.random() * words.length);
    ctx.session.word_to_translate = words[randomIndex];
    ctx.session.correct_count = ctx.session.correct_count || 0;
    ctx.session.wrong_count = ctx.session.wrong_count || 0;
    ctx.session.words_asked = ctx.session.words_asked || 0;
}

function CheckAnswer(ctx, event, api) {
    var userAnswer = event.payload.text.toLowerCase();
    var word = ctx.session.word_to_translate;
    var url = "https://dictionary.skyeng.ru/api/public/v1/words/search?search=" + encodeURIComponent(word);

    // Делаем запрос
    api.fetch(url).then(function(response) {
        return response.json();
    }).then(function(data) {
        if (!data || data.length === 0) {
            ctx.session.correct = false;
            ctx.session.correct_translations = "нет доступных переводов";
        } else {
            // Собираем первые 5 переводов
            var arr = data[0].meanings.slice(0, 5);
            var meanings = [];
            for (var i = 0; i < arr.length; i++) {
                meanings.push(arr[i].translation.text.toLowerCase());
            }
            ctx.session.correct_translations = meanings.join(", ");
            
            // Проверяем ответ
            ctx.session.correct = false;
            for (var j = 0; j < meanings.length; j++) {
                if (meanings[j] === userAnswer) {
                    ctx.session.correct = true;
                    break;
                }
            }

            // Счётчики
            if (ctx.session.correct) {
                ctx.session.correct_count++;
            } else {
                ctx.session.wrong_count++;
            }
        }
    }).catch(function(err) {
        // В случае ошибки сети или API
        ctx.session.correct = false;
        ctx.session.correct_translations = "произошла ошибка при проверке перевода";
        console.log("CheckAnswer error:", err);
    });
}

function CheckFinish(ctx, event) {
    ctx.session.words_asked++;
    if (ctx.session.words_asked >= 5) {
        return "/Finish";
    } else {
        // Генерируем новое слово сразу
        GenerateWord(ctx, event);
        return "/NextWord";
    }
}
