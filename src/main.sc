require: slotfilling/slotFilling.sc
    module = sys.zb-common
require: functions.js

theme: /

    state: Start
        q!: $regex</start>
        a: Hello! Let's begin by reviewing your vocabulary. Please translate the following English words into Russian.
        script: var words = ["apple", "book", "cat", "dog", "sun"];
                $session.word_to_translate = words[Math.floor(Math.random() * words.length)];
                $session.correct_count = $session.correct_count || 0;
                $session.wrong_count   = $session.wrong_count   || 0;
                $session.words_asked   = $session.words_asked   || 0;

        #script: $session.word_to_translate = 'apple'
        script: log("word to translate " + $session.word_to_translate)
        a: {{$session.word_to_translate}}
        go: /TranslateInput

    state: TranslateInput
        q: *
        script: 
            $session.userAnswer = $parseTree.text.toLowerCase();
            log("User said:", $session.userAnswer);
        go!: /TranslateProcess


    state: TranslateProcess
        
        script: 
            var userAnswer = $session.userAnswer
            
                var word       = $session.word_to_translate;
                var url        = "https://dictionary.skyeng.ru/api/public/v1/words/search?search=" + encodeURIComponent(word);

                log("[CheckAnswer] userAnswer=", $request.query, userAnswer);

             // **ВООЗВРАЩАЕМ** промис, чтобы движок подождал результата
                return $http.query(url)
                .then(function(response) { 
                    var data = response
                     log("[CheckAnswer] API returned", response, "entries");

                if (!data || !data.length) {
                    $session.correct = false;
                    $session.correct_translations = "нет доступных переводов";
                } else {
                  // собираем первые 5 переводов
                    var meanings = data[0].meanings.slice(0,5)
                    .map(function(m) { return m.translation.text.toLowerCase(); });
                    $session.correct_translations = meanings.join(", ");
                    log("[CheckAnswer] meanings=", meanings);
                    $session.correct = meanings.indexOf(userAnswer) !== -1;
                    }

                    log("[CheckAnswer] correct=", $session.correct);

                if ($session.correct) {
                    $session.correct_count++;
                } else {
                     $session.wrong_count++;
                }
                    
                    
               
               
                  })
                .catch(function(err) {
                log("[CheckAnswer] ERROR", err);
                $session.correct = false;
                $session.correct_translations = "ошибка при проверке перевода";
                    });
                    
        if: $session.correct
            go!: /Correct
        else: 
            go!: /Wrong
            
        
        event: noMatch || toState = "./"

    state: Correct
        a: Correct! Nice!
        script: CheckFinish
        go!: /NextWord

    state: Wrong
        a: Wrong :( Some of the possible translations for "{{$session.word_to_translate}}" are: {{$session.correct_translations}}
        script: CheckFinish
        go!: /NextWord

    state: NextWord
        a: The next word is "{{$session.word_to_translate}}"
        go!: /Translate

    state: Finish
        a: Correct answers: {{$session.correct_count}}. Wrong answers: {{$session.wrong_count}}. Goodbye, see you later!
        go!: END

    state: NoMatch
        event!: noMatch
        a: I do not understand. You said: {{$request.query}}
  